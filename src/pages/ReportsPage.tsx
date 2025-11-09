import React from 'react';
import { FeatureNotAvailable } from '../components/common';

export const ReportsPage: React.FC = () => {
  return (
    <FeatureNotAvailable
      featureName="Reports & Analytics"
      description="Advanced reporting and analytics features are currently under development. This will include custom report generation, data visualization, and export capabilities for detailed business insights."
      backLink="/dashboard"
      backLinkText="Back to Dashboard"
    />
  );
};
