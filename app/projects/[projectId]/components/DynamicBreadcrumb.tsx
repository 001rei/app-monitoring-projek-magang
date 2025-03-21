"use client";

import { usePathname } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface DynamicBreadcrumbProps {
    projectId: string;
    projectName: string;
}

export function DynamicBreadcrumb({ projectId, projectName }: DynamicBreadcrumbProps) {
    const pathname = usePathname();
    
    let breadcrumbItems: { label: string; href?: string }[] = [];

    if (pathname === `/projects/${projectId}`) {
        breadcrumbItems = [
            { label: "Phase Activities" },
        ];
    } else if (pathname === `/projects/${projectId}/settings/project-settings`) {
        breadcrumbItems = [
            { label: "Project Settings" },
        ];
    } else if (pathname === `/projects/${projectId}/settings/access`) {
        breadcrumbItems = [
            { label: "Manage Access" },
        ];
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                    <BreadcrumbItem key={index}>
                        {item.href ? (
                            <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                        ) : (
                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        )}
                        {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                    </BreadcrumbItem>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

// {/* <Breadcrumb>
//     <BreadcrumbList>
//         <BreadcrumbItem className="hidden md:block">
//             <BreadcrumbLink href="#">
//                 Phase Activities
//             </BreadcrumbLink>
//         </BreadcrumbItem>
//         {/* <BreadcrumbSeparator className="hidden md:block" />
//                                 <BreadcrumbItem>
//                                     <BreadcrumbPage>Data Fetching</BreadcrumbPage>
//                                 </BreadcrumbItem> */}
//     </BreadcrumbList>
// </Breadcrumb> */}