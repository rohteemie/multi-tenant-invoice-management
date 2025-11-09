import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

interface FeatureNotAvailableProps {
  featureName: string;
  description?: string;
  backLink?: string;
  backLinkText?: string;
}

export const FeatureNotAvailable: React.FC<FeatureNotAvailableProps> = ({
  featureName,
  description = 'This feature is currently under development and will be available in a future release.',
  backLink = '/dashboard',
  backLinkText = 'Back to Dashboard',
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100 mb-6">
            <svg
              className="h-12 w-12 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            {featureName}
          </h2>
          <p className="text-lg text-gray-600 mb-2">Feature Not Yet Available</p>
          <p className="text-sm text-gray-500 mb-8">{description}</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              What's Available Now
            </h3>
            <ul className="text-sm text-blue-800 text-left list-disc list-inside space-y-1">
              <li>Invoice Management (Create, Edit, View, Delete)</li>
              <li>Invoice Status Updates (Draft → Sent → Paid)</li>
              <li>PDF Generation and Email Sending</li>
              <li>User Management (Owner/Admin roles)</li>
              <li>Analytics Dashboard</li>
              <li>Invoice Export (CSV/JSON)</li>
            </ul>
          </div>
          
          <Link to={backLink}>
            <Button variant="primary" className="w-full">
              {backLinkText}
            </Button>
          </Link>
        </div>
        
        <div className="text-xs text-gray-400">
          Need this feature urgently? Contact support to request prioritization.
        </div>
      </div>
    </div>
  );
};
