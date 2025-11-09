import React from 'react';
import { FeatureNotAvailable } from '../components/common';

export const CustomersPage: React.FC = () => {
  return (
    <FeatureNotAvailable
      featureName="Customer Management"
      description="Dedicated customer management with profiles, contact history, and customer-specific invoice tracking is coming soon. For now, customer information is managed within invoices."
      backLink="/invoices"
      backLinkText="Back to Invoices"
    />
  );
};
