'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AssignedTasksSkeleton() {
    return (
        <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-[180px]" />
                <Skeleton className="h-5 w-[200px]" />
            </div>

            {/* DataTable Skeleton */}
            <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-10 w-[200px]" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-[100px]" />
                        <Skeleton className="h-10 w-[100px]" />
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {[...Array(5)].map((_, i) => (
                                    <TableHead key={i}>
                                        <Skeleton className="h-5 w-[100px]" />
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Empty state skeleton */}
                            <TableRow>
                                <TableCell colSpan={5} className="py-12">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <Skeleton className="h-4 w-[180px]" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-[120px]" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                    <Skeleton className="h-8 w-[100px]" />
                </div>
            </div>
        </div>
    );
}