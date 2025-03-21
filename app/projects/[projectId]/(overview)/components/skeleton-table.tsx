"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonTable() {
    return (
        <>
            <div className="flex justify-between pb-5">
                <Skeleton className="h-[30px] w-[350px] rounded-lg" />
                <Skeleton className="h-[30px] w-[100px] rounded-lg" />
            </div>
            <div className="flex-col space-y-1">
                <Skeleton className="w-full h-[38px]" />
                <Skeleton className="w-full h-[38px]" />
                <Skeleton className="w-full h-[38px]" />
                <Skeleton className="w-full h-[38px]" />
                <Skeleton className="w-full h-[38px]" />
                <Skeleton className="w-full h-[38px]" />
                <Skeleton className="w-full h-[38px]" />
                <Skeleton className="w-full h-[38px]" />
                <Skeleton className="w-full h-[38px]" />
                <Skeleton className="w-full h-[38px]" />
                <Skeleton className="w-full h-[38px]" />
            </div>
        </>
    );
}