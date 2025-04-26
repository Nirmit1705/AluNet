import React, { Suspense } from "react";
import AlumniDirectoryComponent from "../components/alumni/AlumniDirectory";
import Navbar from "../components/layout/Navbar";
import CustomErrorBoundary from "../components/common/ErrorBoundary";

const LoadingFallback = () => (
  <div className="container-custom py-12 text-center">
    <div className="animate-pulse flex flex-col items-center">
      <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-16 w-16 mb-4"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 h-64">
            <div className="flex mb-4">
              <div className="h-14 w-14 rounded-xl bg-gray-200 dark:bg-gray-700 mr-4"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
            <div className="flex space-x-2 mt-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AlumniDirectory = () => {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <CustomErrorBoundary onReset={() => window.location.reload()}>
          <Suspense fallback={<LoadingFallback />}>
            <AlumniDirectoryComponent />
          </Suspense>
        </CustomErrorBoundary>
      </main>
    </>
  );
};

export default AlumniDirectory; 