import React from 'react';
import { FeatureNotAvailable } from '../components/common';

export const ProductsPage: React.FC = () => {
  return (
    <FeatureNotAvailable
      featureName="Products & Services Catalog"
      description="A comprehensive product and service catalog with pricing, descriptions, and inventory tracking is planned for a future release. Currently, line items are added manually to each invoice."
      backLink="/invoices"
      backLinkText="Back to Invoices"
    />
  );
};
