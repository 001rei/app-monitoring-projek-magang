"use client"

import { Rocket, AlertTriangle } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { IPriority, IStatus } from "@/types"

const chartConfig = {
    blocker: {
        label: "Blocker",
        color: "hsl(0, 70%, 70%)",
    },
    critical: {
        label: "Critical",
        color: "hsl(10, 70%, 70%)",
    },
    major: {
        label: "Major",
        color: "hsl(30, 70%, 70%)",
    },
    minor: {
        label: "Minor",
        color: "hsl(45, 70%, 70%)",
    },
    trivial: {
        label: "Trivial",
        color: "hsl(60, 70%, 80%)",
    },
} satisfies ChartConfig

interface Props {
    tasks: {
        id: string;
        status: Partial<IStatus>;
        priority: Partial<IPriority>;
        endDate: Date;
        created_at: Date;
    }[];
}

export function Chart({ tasks }: Props) {
    const getChartData = () => {
        // Get unique statuses with their order values
        const statusMap = tasks.reduce((acc, task) => {
            if (task.status?.label && task.status?.order !== undefined &&
                task.status.label !== "Done" && task.status.label !== "Overdue") {
                acc[task.status.label] = task.status.order;
            }
            return acc;
        }, {} as Record<string, number>);

        // Sort statuses by their order value
        const sortedStatusNames = Object.keys(statusMap)
            .sort((a, b) => statusMap[a] - statusMap[b]);

        const statusTemplate = sortedStatusNames.reduce((acc, statusName) => {
            acc[statusName] = {
                blocker: 0,
                critical: 0,
                major: 0,
                minor: 0,
                trivial: 0
            };
            return acc;
        }, {} as Record<string, Record<keyof typeof chartConfig, number>>);

        tasks.forEach(task => {
            const statusName = task.status?.label;
            const priorityName = task.priority?.label?.toLowerCase();

            if (!statusName ||
                statusName === "Done" ||
                statusName === "Overdue" ||
                !priorityName ||
                !(priorityName in chartConfig)) {
                return;
            }

            const validPriority = priorityName as keyof typeof chartConfig;

            if (statusName in statusTemplate) {
                statusTemplate[statusName][validPriority] += 1;
            }
        });

        return Object.entries(statusTemplate).map(([status, counts]) => ({
            status,
            ...counts
        }));
    };

    const chartData = getChartData();

    function getNewTasksThisWeek() {
        const lastMonday = new Date();
        lastMonday.setDate(lastMonday.getDate() - (lastMonday.getDay() + 6) % 7);
        lastMonday.setHours(0, 0, 0, 0);
        return tasks.filter(task =>
            new Date(task.created_at) >= lastMonday
        ).length;
    }

    function generateInsightText() {
        const count = getNewTasksThisWeek();
        const urgentCount = tasks.filter(task =>
            new Date(task.created_at) >= new Date(new Date().setDate(new Date().getDate() - 7)) &&
            ['blocker', 'critical'].includes(task.priority?.label?.toLowerCase() as string)
        ).length;

        if (count === 0) return "No new tasks this week";
        if (urgentCount >= 3) return `${urgentCount} urgent tasks need attention`;
        if (count > 20) return "High task volume this week";
        if (count <= 5) return "Steady workflow this week";
        return `${urgentCount} high-priority tasks added`;
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Task Distribution</CardTitle>
                <CardDescription className="text-sm">
                    Grouped by status and priority
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
                <ChartContainer config={chartConfig}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 10, left: 10}}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="status"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                            height={40}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent indicator="line" />}
                            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}    
                        />
                        <ChartLegend content={<ChartLegendContent />} />

                        {Object.keys(chartConfig).map((key) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                stackId="a"
                                fill={`var(--color-${key})`}
                                stroke="#000000"
                                strokeOpacity={0.1}
                                strokeWidth={1}
                            />
                        ))}
                    </BarChart>
                </ChartContainer>
            </CardContent>
                        
            <CardFooter className="pt-3 border-t">
                <div className="flex items-center gap-3 w-full">
                    <div className="flex items-center justify-center p-2 rounded-full bg-blue-50">
                        <Rocket className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium">
                            {getNewTasksThisWeek()} new tasks this week
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {generateInsightText()}
                        </div>
                    </div>
                    {generateInsightText().includes("urgent") && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}