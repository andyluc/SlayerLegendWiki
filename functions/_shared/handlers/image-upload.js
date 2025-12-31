/**
 * Image Upload Handler
 * Handles user-uploaded content images with direct commit to CDN
 *
 * Note: All image processing (resizing, WebP conversion) MUST be done client-side
 * This handler only validates pre-processed images and commits them to the CDN
 */

import { createLogger } from '../../../wiki-framework/src/utils/logger.js';
const logger = createLogger('ImageUploadHandler');

import { Octokit } from 'octokit';
import { validateImageFile, checkImageModeration } from '../image-utils.js';
import { validateEmail } from '../validation.js';
import {
  generateImageId,
  buildMetadata,
  validateMetadata,
  getFileExtension,
  getUploadPath
} from '../utils/image-metadata.js';

/**
 * Handle image upload request (server-side)
 *
 * @param {Object} params - Upload parameters
 * @param {Buffer} params.originalFile - Original image file buffer
 * @param {string} params.originalFilename - Original filename
 * @param {string} params.originalMimeType - Original MIME type
 * @param {Buffer} params.webpFile - WebP version buffer
 * @param {Object} params.dimensions - Image dimensions { width, height }
 * @param {string} params.name - Image name/title
 * @param {string} params.description - Image description
 * @param {string} params.category - Image category
 * @param {Array<string>} params.tags - Image tags
 * @param {string} [params.userEmail] - Email (for anonymous)
 * @param {string} [params.verificationToken] - Verification token (for anonymous)
 * @param {Object} params.auth - Authentication info
 * @param {Object} params.config - Wiki configuration
 * @param {Object} params.adapter - Platform adapter
 * @returns {Promise<Object>} Upload result
 */
export async function handleImageUpload(params) {
  const {
    originalFile,
    originalFilename,
    originalMimeType,
    webpFile,
    dimensions,
    name,
    description,
    category,
    tags,
    userEmail,
    verificationToken,
    auth,
    config,
    adapter
  } = params;

  logger.info('Processing image upload', {
    filename: originalFilename,
    originalSize: originalFile?.length || 0,
    webpSize: webpFile?.length || 0,
    authenticated: !!auth.user,
    category
  });

  try {
    // Step 1: Validate required fields
    if (!name || !category) {
      throw new Error('Image name and category are required');
    }

    // Step 2: Validate image files exist
    if (!originalFile || originalFile.length === 0) {
      throw new Error('Original image file is required');
    }

    if (!webpFile || webpFile.length === 0) {
      throw new Error('WebP image file is required (client-side processing required)');
    }

    if (!dimensions || !dimensions.width || !dimensions.height) {
      throw new Error('Image dimensions are required');
    }

    // Step 3: Validate metadata
    validateMetadata(name, category, description, tags, config);

    // Step 4: Validate original image file (magic bytes check)
    validateImageFile(originalFile, originalMimeType, config);

    // Step 5: Check file sizes
    const maxSizeMB = config?.imageUploads?.maxFileSizeMB || 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (originalFile.length > maxSizeBytes) {
      throw new Error(`Original image exceeds ${maxSizeMB}MB limit`);
    }

    if (webpFile.length > maxSizeBytes) {
      throw new Error(`WebP image exceeds ${maxSizeMB}MB limit`);
    }

    // Step 6: Authentication and rate limiting for anonymous uploads
    if (!auth.user && !auth.token) {
      logger.debug('Processing anonymous upload');

      // Require email and verification token
      if (!userEmail || !verificationToken) {
        throw new Error('Email verification required for anonymous uploads');
      }

      // Validate email format
      const emailValidation = validateEmail(userEmail);
      if (!emailValidation.valid) {
        throw new Error(`Invalid email: ${emailValidation.error}`);
      }

      // Verify email verification token
      const jwt = await import('../jwt.js');
      const secret = adapter.getEnv('EMAIL_VERIFICATION_SECRET');
      if (!secret) {
        throw new Error('Email verification not configured');
      }

      try {
        const decoded = await jwt.verify(verificationToken, secret);
        if (!decoded || decoded.email !== userEmail) {
          throw new Error('Email verification expired or invalid');
        }
        logger.debug('Email verification token valid', { email: userEmail });
      } catch (error) {
        logger.warn('Email verification failed', { error: error.message });
        throw new Error('Email verification expired or invalid');
      }

      // Check rate limit (10 image uploads per email per 24 hours)
      const { hashEmail } = await import('../utils.js');
      const emailHash = await hashEmail(userEmail);
      const { createWikiStorage } = await import('../createWikiStorage.js');
      const storage = await createWikiStorage(adapter, config);
      const rateLimitKey = `image-upload-rate:${emailHash}`;

      const maxUploads = config?.imageUploads?.rateLimit?.maxUploadsPerDay || 10;
      const windowHours = config?.imageUploads?.rateLimit?.windowHours || 24;

      try {
        const rateLimitData = await storage.read(rateLimitKey);
        if (rateLimitData) {
          const { count, windowStart } = JSON.parse(rateLimitData);
          const windowMs = windowHours * 60 * 60 * 1000;
          const now = Date.now();

          if (now - windowStart < windowMs) {
            if (count >= maxUploads) {
              const resetTime = new Date(windowStart + windowMs).toLocaleString();
              throw new Error(`Upload limit reached (${maxUploads}/${windowHours}h). Resets at ${resetTime}`);
            }
            // Increment count
            await storage.write(rateLimitKey, JSON.stringify({
              count: count + 1,
              windowStart
            }));
          } else {
            // Window expired, start new window
            await storage.write(rateLimitKey, JSON.stringify({
              count: 1,
              windowStart: now
            }));
          }
        } else {
          // First upload for this email
          await storage.write(rateLimitKey, JSON.stringify({
            count: 1,
            windowStart: Date.now()
          }));
        }
      } catch (error) {
        logger.error('Rate limit check failed', { error: error.message });
        throw new Error('Rate limit check failed');
      }

      // Content moderation for anonymous uploads
      if (config?.imageUploads?.moderation?.enabled &&
          config?.imageUploads?.moderation?.checkAnonymous) {
        logger.debug('Running content moderation for anonymous upload');
        try {
          await checkImageModeration(originalFile, adapter);
          logger.debug('Content moderation passed');
        } catch (error) {
          logger.warn('Content moderation failed', { error: error.message });
          throw new Error(`Content moderation failed: ${error.message}`);
        }
      }
    }

    // Step 7: Content moderation for authenticated uploads (if enabled)
    if (auth.user && config?.imageUploads?.moderation?.enabled &&
        config?.imageUploads?.moderation?.checkAuthenticated) {
      logger.debug('Running content moderation for authenticated upload');
      try {
        await checkImageModeration(originalFile, adapter);
        logger.debug('Content moderation passed');
      } catch (error) {
        logger.warn('Content moderation failed', { error: error.message });
        throw new Error(`Content moderation failed: ${error.message}`);
      }
    }

    // Step 8: Build metadata
    const format = getFileExtension(originalFilename);
    const uploadedBy = auth.user?.login || 'anonymous';
    const uploadedAt = new Date().toISOString();

    const metadata = buildMetadata({
      name,
      description,
      category,
      tags,
      dimensions,
      uploadedBy,
      uploadedAt,
      filename: originalFilename,
      fileSize: originalFile.length,
      format
    });

    logger.debug('Metadata built', { metadata });

    // Step 9: Upload to CDN (direct commit to main branch)
    const imageId = generateImageId();
    const botToken = auth.botToken || adapter.getEnv('WIKI_BOT_TOKEN') || adapter.getEnv('VITE_WIKI_BOT_TOKEN');

    if (!botToken) {
      throw new Error('Bot token not configured');
    }

    const cdnConfig = config.features.imageUploads.cdn.github;
    const urls = await uploadImagesToCDN(
      imageId,
      category,
      originalFile,
      originalFilename,
      webpFile,
      metadata,
      botToken,
      cdnConfig
    );

    logger.info('Image uploaded successfully', {
      imageId,
      uploadedBy,
      category,
      originalSize: originalFile.length,
      webpSize: webpFile.length
    });

    return {
      success: true,
      imageId,
      originalUrl: urls.originalUrl,
      webpUrl: urls.webpUrl,
      metadataUrl: urls.metadataUrl,
      dimensions
    };

  } catch (error) {
    logger.error('Image upload failed', { error: error.message, stack: error.stack });
    throw error;
  }
}

/**
 * Upload images to CDN repository with direct commit
 * @param {string} imageId - Unique image ID
 * @param {string} category - Image category
 * @param {Buffer} originalFile - Original image buffer
 * @param {string} originalFilename - Original filename
 * @param {Buffer} webpFile - WebP image buffer
 * @param {Object} metadata - Image metadata
 * @param {string} botToken - GitHub bot token
 * @param {Object} cdnConfig - CDN configuration
 * @returns {Promise<Object>} CDN URLs
 */
async function uploadImagesToCDN(imageId, category, originalFile, originalFilename, webpFile, metadata, botToken, cdnConfig) {
  try {
    const octokit = new Octokit({ auth: botToken });

    // Generate date-based path
    const { year, month } = getUploadPath(category);
    const basePath = `${cdnConfig.basePath}/${category}/${year}/${month}`;

    // Get original file extension
    const originalExt = getFileExtension(originalFilename);
    if (!originalExt) {
      throw new Error('Could not determine file extension');
    }

    const paths = {
      original: `${basePath}/${imageId}.${originalExt}`,
      webp: `${basePath}/${imageId}.webp`,
      metadata: `${basePath}/${imageId}-metadata.json`
    };

    const commitMessage = `Upload image: ${metadata.name} [${imageId}] by @${metadata.uploadedBy}`;

    logger.debug('Uploading to CDN', { paths, commitMessage });

    // Upload original image
    logger.debug('Uploading original image', { path: paths.original, size: originalFile.length });
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: cdnConfig.owner,
      repo: cdnConfig.repo,
      path: paths.original,
      message: commitMessage,
      content: originalFile.toString('base64'),
      branch: 'main'
    });

    // Upload WebP version
    logger.debug('Uploading WebP image', { path: paths.webp, size: webpFile.length });
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: cdnConfig.owner,
      repo: cdnConfig.repo,
      path: paths.webp,
      message: commitMessage,
      content: webpFile.toString('base64'),
      branch: 'main'
    });

    // Upload metadata JSON
    logger.debug('Uploading metadata', { path: paths.metadata });
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: cdnConfig.owner,
      repo: cdnConfig.repo,
      path: paths.metadata,
      message: commitMessage,
      content: Buffer.from(JSON.stringify(metadata, null, 2)).toString('base64'),
      branch: 'main'
    });

    // Generate jsDelivr URLs
    const servingMode = cdnConfig.servingMode || 'jsdelivr';
    const baseUrl = servingMode === 'jsdelivr'
      ? `https://cdn.jsdelivr.net/gh/${cdnConfig.owner}/${cdnConfig.repo}@main`
      : `https://raw.githubusercontent.com/${cdnConfig.owner}/${cdnConfig.repo}/main`;

    const urls = {
      originalUrl: `${baseUrl}/${paths.original}`,
      webpUrl: `${baseUrl}/${paths.webp}`,
      metadataUrl: `${baseUrl}/${paths.metadata}`
    };

    logger.debug('CDN URLs generated', urls);

    return urls;

  } catch (error) {
    logger.error('CDN upload failed', { error: error.message, stack: error.stack });
    throw new Error(`Failed to upload to CDN: ${error.message}`);
  }
}
