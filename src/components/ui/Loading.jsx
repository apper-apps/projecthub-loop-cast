import React from "react";

const Loading = ({ type = "default" }) => {
  if (type === "projects") {
    return (
      <div className="space-y-6">
        <div className="animate-shimmer h-8 w-48 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div className="animate-shimmer h-6 w-3/4 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
              <div className="space-y-2">
                <div className="animate-shimmer h-4 w-full rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
                <div className="animate-shimmer h-4 w-2/3 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
              </div>
              <div className="animate-shimmer h-5 w-20 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "dashboard") {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="animate-shimmer h-10 w-64 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
          <div className="animate-shimmer h-6 w-96 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div className="animate-shimmer h-12 w-12 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
              <div className="space-y-2">
                <div className="animate-shimmer h-8 w-16 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
                <div className="animate-shimmer h-4 w-24 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
    </div>
  );
};

export default Loading;