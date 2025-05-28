// components/PhaseProgressSkeleton.tsx
'use client';

export function PhaseProgressSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="flex justify-between">
                <div className="h-6 w-1/3 bg-gray-200 rounded dark:bg-gray-700" />
                <div className="h-6 w-24 bg-gray-200 rounded dark:bg-gray-700" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-4 w-1/2 bg-gray-200 rounded dark:bg-gray-700" />
                        <div className="h-4 w-10 bg-gray-200 rounded dark:bg-gray-700" />
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full dark:bg-gray-700" />
                    <div className="h-3 w-3/4 bg-gray-200 rounded dark:bg-gray-700" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-4 w-1/2 bg-gray-200 rounded dark:bg-gray-700" />
                        <div className="h-4 w-20 bg-gray-200 rounded dark:bg-gray-700" />
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <div className="h-3 w-16 bg-gray-200 rounded dark:bg-gray-700" />
                        <div className="h-3 w-16 bg-gray-200 rounded dark:bg-gray-700" />
                    </div>
                </div>
            </div>
        </div>
    );
}