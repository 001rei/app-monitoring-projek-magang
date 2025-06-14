"use client"

import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { IProject } from "@/types"
import { ProjectActions } from "./ProjectActions"
import { Calendar, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectItemProps {
    project: IProject
    tab: "active" | "all" | "closed"
    setProjectToClose?: (id: string) => void
    setProjectToReopen?: (id: string) => void
    setProjectToDelete?: (project: IProject) => void
}

export const ProjectItem = ({
    project,
    tab,
    setProjectToClose,
    setProjectToReopen,
    setProjectToDelete,
}: ProjectItemProps) => {
    const formatDate = (dateString: Date) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <div className="group p-6 border-b border-slate-200 dark:border-zinc-900 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-all duration-200">
            <div className="flex justify-between items-start gap-6">
                <div className="flex-1 min-w-0">
                    {/* Project Title and Status */}
                    <div className="flex items-center gap-3 mb-3">
                        {project.closed ? (
                            <h3 className="text-lg font-semibold text-slate-500 dark:text-zinc-500 truncate">{project.name}</h3>
                        ) : (
                            <Link
                                href={`/projects/${project.id}`}
                                className="group/link flex items-center gap-2 hover:gap-3 transition-all duration-200"
                            >
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover/link:text-slate-700 dark:group-hover/link:text-zinc-300 truncate">
                                    {project.name}
                                </h3>
                                <ExternalLink className="w-4 h-4 text-slate-400 dark:text-zinc-500 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200" />
                            </Link>
                        )}

                        {tab === "all" && (
                            <Badge
                                className={cn(
                                    "text-xs font-medium px-2.5 py-1 rounded-full border-0 shadow-sm",
                                    project.closed
                                        ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                        : "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
                                )}
                            >
                                {project.closed ? "Closed" : "Active"}
                            </Badge>
                        )}
                    </div>

                    {/* Project Description */}
                    <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-2">
                        {project.description}
                    </p>

                    {/* Project Metadata */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-500">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Created {formatDate(project.created_at)}</span>
                        </div>

                        {/* Additional metadata can be added here */}
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-zinc-600 rounded-full" />
                            <span className="capitalize">{project.category || "General"}</span>
                        </div>
                    </div>
                </div>

                {/* Project Actions */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ProjectActions
                        project={project}
                        tab={tab}
                        setProjectToClose={setProjectToClose}
                        setProjectToReopen={setProjectToReopen}
                        setProjectToDelete={setProjectToDelete}
                    />
                </div>
            </div>
        </div>
    )
}
