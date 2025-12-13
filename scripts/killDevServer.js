import { execSync } from 'child_process';
import { platform } from 'os';

/**
 * Kill any processes running on the Vite dev server port (5173)
 * Works on both Windows and Unix-like systems
 */

const PORT = 5173;
const isWindows = platform() === 'win32';

console.log(`Checking for existing dev servers on port ${PORT}...`);

try {
  if (isWindows) {
    // Windows: Find process using netstat and taskkill
    try {
      // Find PID using the port
      const netstatOutput = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });

      if (netstatOutput) {
        // Extract PIDs from netstat output
        const lines = netstatOutput.split('\n').filter(line => line.trim());
        const pids = new Set();

        for (const line of lines) {
          // netstat format: Proto  Local Address  Foreign Address  State  PID
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];

          // Verify it's a valid PID and listening on our port
          if (pid && /^\d+$/.test(pid) && line.includes(`:${PORT}`)) {
            pids.add(pid);
          }
        }

        if (pids.size > 0) {
          console.log(`Found ${pids.size} process(es) using port ${PORT}`);

          for (const pid of pids) {
            try {
              console.log(`Killing process ${pid}...`);
              execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
              console.log(`✓ Process ${pid} killed`);
            } catch (err) {
              console.warn(`⚠ Could not kill process ${pid} (may have already exited)`);
            }
          }
        } else {
          console.log('No processes found using the port');
        }
      }
    } catch (err) {
      // netstat command failed - likely no process on port
      console.log('No existing dev server found');
    }
  } else {
    // Unix-like: Use lsof and kill
    try {
      const lsofOutput = execSync(`lsof -ti:${PORT}`, { encoding: 'utf8' });
      const pids = lsofOutput.trim().split('\n').filter(pid => pid);

      if (pids.length > 0) {
        console.log(`Found ${pids.length} process(es) using port ${PORT}`);

        for (const pid of pids) {
          try {
            console.log(`Killing process ${pid}...`);
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
            console.log(`✓ Process ${pid} killed`);
          } catch (err) {
            console.warn(`⚠ Could not kill process ${pid} (may have already exited)`);
          }
        }
      }
    } catch (err) {
      // lsof command failed - likely no process on port
      console.log('No existing dev server found');
    }
  }

  console.log('Ready to start dev server\n');
} catch (err) {
  console.error('Error checking for existing servers:', err.message);
  // Don't fail the script - allow dev server to start anyway
  process.exit(0);
}
