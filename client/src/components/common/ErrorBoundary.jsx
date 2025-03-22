import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="container-custom py-6">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Something went wrong</h3>
        <p className="text-red-600 dark:text-red-300 mb-4">
          {error.message || "An unexpected error occurred"}
        </p>
        <details className="text-left mb-4">
          <summary className="cursor-pointer text-red-600 dark:text-red-300">View error details</summary>
          <pre className="mt-2 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded overflow-auto text-xs">
            {error.stack}
          </pre>
        </details>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export default function CustomErrorBoundary({ children, onReset }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={onReset}
      onError={(error, info) => {
        console.error("Error caught by boundary:", error, info);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
} 