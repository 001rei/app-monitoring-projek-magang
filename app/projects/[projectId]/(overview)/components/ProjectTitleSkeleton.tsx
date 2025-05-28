// components/ProjectTitleSkeleton.tsx
'use client';

export function ProjectTitleSkeleton() {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 animate-pulse">
            <div className="space-y-1 w-full">
                <div className="h-7 w-3/4 bg-gray-200 rounded dark:bg-gray-700" />
                <div className="flex gap-2">
                    <div className="h-5 w-16 bg-gray-200 rounded dark:bg-gray-700" />
                    <div className="h-5 w-20 bg-gray-200 rounded dark:bg-gray-700" />
                </div>
            </div>
            <div className="h-8 w-8 bg-gray-200 rounded-md dark:bg-gray-700" />
        </div>
    );
}