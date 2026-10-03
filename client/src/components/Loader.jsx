import React from 'react';
import DocAlertLogo from './DocAlertLogo.jsx';

const Loader = ({ fullScreen = false, message = 'Loading...', size = 'md' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
        <DocAlertLogo size={56} showText={true} textSize="text-3xl" />
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className={`${sizes.lg} border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin`} />
          <p className="text-sm text-gray-500 animate-pulse">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className={`${sizes[size]} border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin`} />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
};

// Skeleton shimmer for cards
export const CardSkeleton = () => (
  <div className="card p-5 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="shimmer h-5 w-40 rounded" />
      <div className="shimmer h-5 w-20 rounded-full" />
    </div>
    <div className="shimmer h-4 w-24 rounded mb-2" />
    <div className="shimmer h-4 w-32 rounded mb-2" />
    <div className="shimmer h-4 w-28 rounded" />
  </div>
);

export default Loader;
