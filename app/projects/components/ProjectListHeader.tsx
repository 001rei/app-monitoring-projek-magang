"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, SortAsc, SortDesc } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectListHeaderProps {
    tab: "active" | "all" | "closed"
    count: number
    sortOrder: "newest" | "oldest"
    onSort?: (order: "newest" | "oldest") => void
}

export const ProjectListHeader = ({ tab, count, sortOrder, onSort }: ProjectListHeaderProps) => {
    const getTabTitle = () => {
        switch (tab) {
            case "active":
                return "Active Projects"
            case "closed":
                return "Closed Projects"
            case "all":
                return "All Projects"
            default:
                return "Projects"
        }
    }

    const getTabColor = () => {
        switch (tab) {
            case "active":
                return "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400"
            case "closed":
                return "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400"
            case "all":
                return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            default:
                return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        }
    }

    return (
        <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-6">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">{getTabTitle()}</h2>
                    <Badge variant="outline" className={cn("text-xs font-medium px-2.5 py-1 rounded-full", getTabColor())}>
                        {count}
                    </Badge>
                </div>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-sm font-medium dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:text-zinc-300"
                    >
                        {sortOrder === "newest" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                        Sort by {sortOrder === "newest" ? "Newest" : "Oldest"}
                        <ChevronDown className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 dark:bg-zinc-900 dark:border-zinc-800">
                    <DropdownMenuItem
                        onClick={() => onSort?.("newest")}
                        className="flex items-center justify-between dark:hover:bg-zinc-800 dark:focus:bg-zinc-800"
                    >
                        <div className="flex items-center gap-2">
                            <SortDesc className="w-4 h-4" />
                            Newest First
                        </div>
                        {sortOrder === "newest" && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => onSort?.("oldest")}
                        className="flex items-center justify-between dark:hover:bg-zinc-800 dark:focus:bg-zinc-800"
                    >
                        <div className="flex items-center gap-2">
                            <SortAsc className="w-4 h-4" />
                            Oldest First
                        </div>
                        {sortOrder === "oldest" && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
