// components/StatsSkeleton.tsx
'use client';

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Chart Skeleton */}
            <div className="h-64 bg-gray-200 rounded-lg dark:bg-gray-700 animate-pulse" />

            {/* Stats Cards */}
            <div className="flex flex-col gap-3">
                <div className="p-5 space-y-4 bg-gray-200 rounded-lg dark:bg-gray-700 animate-pulse">
                    <div className="flex justify-between">
                        <div className="space-y-2">
                            <div className="h-4 w-1/2 bg-gray-300 rounded dark:bg-gray-600" />
                            <div className="h-6 w-10 bg-gray-300 rounded dark:bg-gray-600" />
                        </div>
                        <div className="h-12 w-12 bg-gray-300 rounded-lg dark:bg-gray-600" />
                    </div>
                    <div className="h-1.5 w-full bg-gray-300 rounded-full dark:bg-gray-600" />
                    <div className="h-3 w-full bg-gray-300 rounded dark:bg-gray-600" />
                </div>

                <div className="p-5 space-y-4 bg-gray-200 rounded-lg dark:bg-gray-700 animate-pulse">
                    <div className="flex justify-between">
                        <div className="space-y-2">
                            <div className="h-4 w-1/2 bg-gray-300 rounded dark:bg-gray-600" />
                            <div className="h-6 w-10 bg-gray-300 rounded dark:bg-gray-600" />
                        </div>
                        <div className="h-12 w-12 bg-gray-300 rounded-lg dark:bg-gray-600" />
                    </div>
                    <div className="h-1.5 w-full bg-gray-300 rounded-full dark:bg-gray-600" />
                    <div className="h-3 w-full bg-gray-300 rounded dark:bg-gray-600" />
                </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="h-full bg-gray-200 rounded-lg dark:bg-gray-700 animate-pulse" />
        </div>
    );
}