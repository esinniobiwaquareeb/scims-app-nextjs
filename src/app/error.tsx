'use client';

import React from 'react';
import { ErrorPage } from '@/components/ErrorPage';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  console.error('Application error:', error);

  return (
    <ErrorPage
      statusCode={500}
      title="Something Went Wrong"
      message="An unexpected error occurred. Please try again or contact support if the problem persists."
      customActions={
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={reset}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Try Again
          </button>
        </div>
      }
    />
  );
}
