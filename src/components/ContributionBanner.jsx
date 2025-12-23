/**
 * ContributionBanner Component - Slayer Legend Wiki customization
 *
 * Wraps the framework's ContributionBanner with game-specific messages
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import FrameworkContributionBanner from '../../wiki-framework/src/components/common/ContributionBanner.jsx';
import Emoticon from './Emoticon';

const ContributionBanner = ({ type = 'ai-generated' }) => {
  // Game-specific messages
  const customMessages = {
    'ai-generated': {
      title: (
        <>
          <Emoticon id={1005} size="large" /> Community Contribution Opportunity
        </>
      ),
      message: (
        <>
          This page is ready for your valuable insight are you ready to{' '}
          <Link
            to="/meta/contributing"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            become a contributor
          </Link>
          {' '}to the Slayer Legend wiki?! We need your help to build comprehensive information.
        </>
      ),
      footer: (
        <>
          Maybe you'll become a top contributor in the{' '}
          <Link
            to="/highscore"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            highscores
          </Link>
          , Slayer! <Emoticon id={6} size="large" />
        </>
      ),
    },
  };

  const custom = customMessages[type] || customMessages['ai-generated'];

  return (
    <FrameworkContributionBanner
      type={type}
      customTitle={custom.title}
      customMessage={custom.message}
      customFooter={custom.footer}
    />
  );
};

ContributionBanner.propTypes = {
  type: PropTypes.string,
};

export default ContributionBanner;
