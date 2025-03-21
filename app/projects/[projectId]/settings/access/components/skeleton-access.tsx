"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonManageAccess() {
    return (
        <div>
            {/* Judul */}
            <Skeleton className="h-6 w-[150px] mb-4" />

            {/* Container Utama */}
            <div className="rounded-md border overflow-hidden mt-4">
                {/* Header */}
                <div className="bg-muted dark:bg-muted/30 flex justify-between items-center px-4 py-2 border-b">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-4" /> {/* Checkbox */}
                        <Skeleton className="h-4 w-[100px]" /> {/* Teks "0 of 2 members" */}
                    </div>
                    <Skeleton className="h-8 w-[120px]" /> {/* Tombol "Remove Selected" */}
                </div>

                {/* Search Input */}
                <div className="px-4 py-3 border-b">
                    <Skeleton className="h-7 w-full" /> {/* Input */}
                </div>

                {/* List of Members */}
                <div className="divide-y">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="p-4 flex items-center justify-between">
                            {/* Bagian Kiri: Checkbox, Avatar, dan Nama */}
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-4 w-4" /> {/* Checkbox */}
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-6 rounded-full" /> {/* Avatar */}
                                    <div>
                                        <Skeleton className="h-4 w-[100px]" /> {/* Nama */}
                                        <Skeleton className="h-3 w-[80px] mt-1" /> {/* Status */}
                                    </div>
                                </div>
                            </div>

                            {/* Bagian Kanan: Role Selector atau Badge Owner */}
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-[80px]" /> {/* Role Selector atau Badge */}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}