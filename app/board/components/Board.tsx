"use client"

import { JSX, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CalendarCheck, CheckCircle, ChevronRight, ClipboardSignature, Clock, Code, FileText, Filter, Plus, Rocket, Search, TestTube2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useBoardQueries } from "@/hooks/useBoardQueries"
import { format } from 'date-fns';
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { BoardProject } from "@/types"

interface Props {
    userId: string
}

export default function Board({ userId }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<'internal' | 'external' | 'all'>('all');

    const { boardProjects } = useBoardQueries(userId);

    const validLabels = [
        "Perencanaan",
        "Pendefinisian",
        "Pengembangan",
        "Testing Plan",
        "Implementasi",
        "PIR",
    ];

    console.log(boardProjects)

    const filteredAndSearchedProjects = useMemo(() => {
        if (!boardProjects) return [];
        return boardProjects.filter(project => {
            const categoryMatch = filterCategory === 'all' ||
                (filterCategory === 'internal' && project.details?.category === 'internal') ||
                (filterCategory === 'external' && project.details?.category === 'external');

            const searchMatch = searchQuery === '' ||
                project.details?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.details?.project_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.details?.description.toLowerCase().includes(searchQuery.toLowerCase());

            return categoryMatch && searchMatch && validLabels.includes(project.label);
        });
    }, [boardProjects, filterCategory, searchQuery]);

    const groupedProjects = useMemo(() => {
        const initialGroups: Record<string, BoardProject[]> = {};
        validLabels.forEach(label => {
            initialGroups[label] = [];
        });

        return filteredAndSearchedProjects.reduce<Record<string, BoardProject[]>>((groups, project) => {
            const label = project.label;
            if (validLabels.includes(label)) {
                groups[label].push(project as any);
            }
            return groups;
        }, initialGroups);
    }, [filteredAndSearchedProjects]);

    const totalProjects = useMemo(() => {
        return filteredAndSearchedProjects.length;
    }, [filteredAndSearchedProjects]);

    const getStatusIcon = (label: string) => {
        const icons: Record<string, JSX.Element> = {
            "Perencanaan": <CalendarCheck className="h-4 w-4 text-blue-500 dark:text-blue-400" />,
            "Pendefinisian": <FileText className="h-4 w-4 text-purple-500 dark:text-purple-400" />,
            "Pengembangan": <Code className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />,
            "Testing Plan": <TestTube2 className="h-4 w-4 text-orange-500 dark:text-orange-400" />,
            "Implementasi": <Rocket className="h-4 w-4 text-green-500 dark:text-green-400" />,
            "PIR": <ClipboardSignature className="h-4 w-4 text-red-500 dark:text-red-400" />
        };
        return icons[label] || <div className="h-4 w-4 rounded-full bg-gray-500 dark:bg-gray-400" />;
    };

    return (
        <div className="flex flex-col h-screen px-3 mt-2 bg-background">
            <header className="px-6 py-4 bg-card rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-2xl font-semibold text-foreground">Projects Board</h4>
                        <p className="text-sm text-muted-foreground">{totalProjects} active projects</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search Projects..."
                                className="w-[250px] pl-9 focus-visible:ring-2 focus-visible:ring-ring"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="flex items-center gap-1">
                                    <Filter className="h-4 w-4" />
                                    <span>
                                        {filterCategory === 'all' ? 'Filter: All Projects' :
                                            filterCategory === 'internal' ? 'Filter: Internal' : 'Filter: External'}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                    className={`cursor-pointer ${filterCategory === 'all' ? 'bg-accent' : ''}`}
                                    onClick={() => setFilterCategory('all')}
                                >
                                    <span className={filterCategory === 'all' ? 'font-medium' : ''}>All Projects</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className={`cursor-pointer ${filterCategory === 'internal' ? 'bg-accent' : ''}`}
                                    onClick={() => setFilterCategory('internal')}
                                >
                                    <span className={filterCategory === 'internal' ? 'font-medium' : ''}>Internal</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className={`cursor-pointer ${filterCategory === 'external' ? 'bg-accent' : ''}`}
                                    onClick={() => setFilterCategory('external')}
                                >
                                    <span className={filterCategory === 'external' ? 'font-medium' : ''}>External</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Link href="/new-project">
                            <Button size="sm" className="flex items-center gap-1">
                                <Plus className="h-4 w-4" />
                                <span>New Project</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex-1 p-4 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="flex gap-4 h-full pb-6">
                        {validLabels.map((label) => {
                            const projects = groupedProjects[label] || [];
                            const statusIcon = getStatusIcon(label);

                            return (
                                <div key={label} className="flex-shrink-0 w-[320px]">
                                    <div className="bg-card rounded-lg shadow-sm h-[calc(100vh-150px)] flex flex-col border bg-slate-100 dark:bg-slate-950">
                                        <div className="p-3 font-medium flex items-center justify-between border-b">
                                            <div className="flex items-center gap-2">
                                                {statusIcon}
                                                <span className="text-sm font-semibold text-foreground">{label}</span>
                                                <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                                                    {projects.length}
                                                </Badge>
                                            </div>
                                        </div>
                                        <ScrollArea className="flex-1 p-2">
                                            <div className="space-y-3">
                                                {projects.length > 0 ? (
                                                    projects.map((project) => {
                                                        const progress = project.details?.total_tasks
                                                            ? Math.round((project.details.done_tasks / project.details.total_tasks) * 100)
                                                            : 0;

                                                        return (
                                                            <Card
                                                                key={project.id}
                                                                className="cursor-pointer hover:shadow-md transition-shadow border hover:border-primary/30"
                                                            >
                                                                <CardHeader className="p-3 pb-0">
                                                                    <CardTitle className="text-sm">
                                                                        <div className="text-xs text-muted-foreground mb-1">
                                                                            {project.details?.project_code || 'N/A'}
                                                                        </div>
                                                                        <Link
                                                                            href={`${location?.origin}/projects/${project.details?.id}`}
                                                                            className="hover:underline text-base font-medium text-foreground line-clamp-1"
                                                                        >
                                                                            {project.details?.name || 'Untitled Project'}
                                                                        </Link>
                                                                    </CardTitle>
                                                                    <CardDescription className="line-clamp-2 text-xs">
                                                                        {project.details?.description || 'No description available'}
                                                                    </CardDescription>
                                                                </CardHeader>
                                                                <CardContent className="p-3 pt-2">
                                                                    <div className="space-y-3">
                                                                        <div className="space-y-3">
                                                                            <div className="flex justify-between items-center text-xs mb-1">
                                                                                <span className="text-muted-foreground">Progress</span>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="font-medium">{progress}%</span>
                                                                                    {progress === 100 && (
                                                                                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-xs">
                                                                                            <CheckCircle className="h-3 w-3" />
                                                                                            Ready for next phase
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <Progress
                                                                                value={progress}
                                                                                className={`h-2 ${progress === 100
                                                                                    ? '[&>div]:bg-green-500 [&>div]:dark:bg-green-400'
                                                                                    : '[&>div]:bg-yellow-400 [&>div]:dark:bg-yellow-300'
                                                                                    }`}
                                                                            />

                                                                        </div>
                                                                        <div className="flex justify-between items-center text-xs">
                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                                                            <Clock className="h-3 w-3" />
                                                                                            <span>
                                                                                                {project.endDate
                                                                                                    ? format(project.endDate, 'MMM dd')
                                                                                                    : 'No due date'}
                                                                                            </span>
                                                                                        </div>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        {project.endDate
                                                                                            ? format(project.endDate, 'PPPP')
                                                                                            : 'No due date set'}
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>
                                                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                                                <span className="font-medium text-primary">
                                                                                    {project.details?.done_tasks}
                                                                                </span>
                                                                                <span>/</span>
                                                                                <span>{project.details?.total_tasks}</span>
                                                                                <span>tasks</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-32 p-4 text-center">
                                                        <div className="flex mb-3">
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-6 h-6 rounded bg-muted-foreground/10 flex items-center justify-center">
                                                                    <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
                                                                </div>
                                                                <div className="text-[10px] mt-1 text-muted-foreground/50">PREV PHASE</div>
                                                            </div>
                                                            <div className="px-2 flex items-center">
                                                                <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-6 h-6 rounded border-2 border-muted-foreground/30 flex items-center justify-center">
                                                                    <span className="text-xs text-muted-foreground/50">{label.charAt(0)}</span>
                                                                </div>
                                                                <div className="text-[10px] mt-1 text-muted-foreground/50">CURRENT</div>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Awaiting handoff from previous phase
                                                            <span className="block mt-1 italic text-muted-foreground/60">Every phase builds excellence</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </div>
    )
}