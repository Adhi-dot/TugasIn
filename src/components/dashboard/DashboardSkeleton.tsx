import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Memuat data dashboard...">
      {/* Skeleton Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-5 h-32 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="w-8 h-8 bg-slate-200 rounded-lg" />
            </div>
            <div>
              <div className="h-8 w-16 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-36 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton Filter Row */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
        <div className="h-9 w-64 bg-slate-200 rounded-lg" />
        <div className="h-9 w-48 bg-slate-200 rounded-lg" />
      </div>

      {/* Skeleton Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-5 h-56 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded-full" />
              </div>
              <div className="h-5 w-full bg-slate-200 rounded mb-2" />
              <div className="h-5 w-3/4 bg-slate-200 rounded mb-3" />
              <div className="h-3 w-full bg-slate-100 rounded mb-1" />
              <div className="h-3 w-2/3 bg-slate-100 rounded" />
            </div>
            <div className="pt-3 border-t border-border/60">
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
