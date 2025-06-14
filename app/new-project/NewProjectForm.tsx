"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { defaultPhases, defaultMilestones } from "../../consts/default-options"
import { createClient } from "@/utils/supabase/client"
import { projects } from "@/utils/projects"
import type { ProjectWithOptions } from "@/types"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NewProjectForm() {
    const router = useRouter()

    const [isCreating, setIsCreating] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("internal")
    const [phases] = useState(defaultPhases)
    const [milestones] = useState(defaultMilestones)

    const [nameCharCount, setNameCharCount] = useState(0)
    const [descCharCount, setDescCharCount] = useState(0)
    const [nameError, setNameError] = useState("")
    const [descError, setDescError] = useState("")
    const [isNameValid, setIsNameValid] = useState(false)
    const [isDescValid, setIsDescValid] = useState(false)

    useEffect(() => {
        setNameCharCount(name.length)
        setDescCharCount(description.length)
        setIsNameValid(name.length > 0 && name.length <= 50)
        setIsDescValid(description.length > 0 && description.length <= 800)
    }, [name, description])

    const getNameCharCountColor = () => {
        if (nameCharCount === 0) return "text-zinc-500"
        if (nameCharCount > 50) return "text-red-500"
        if (nameCharCount > 40) return "text-amber-500"
        return "text-green-500"
    }

    const getDescCharCountColor = () => {
        if (descCharCount === 0) return "text-zinc-500"
        if (descCharCount > 800) return "text-red-500"
        if (descCharCount > 700) return "text-amber-500"
        return "text-green-500"
    }

    const handleCreateProject = async () => {
        if (!name.trim()) {
            setNameError("Project name is required")
            return
        }

        if (name.length > 50) {
            setNameError("Title must be 50 characters or less")
            return
        }

        if (!description.trim()) {
            setDescError("Project description is required")
            return
        }

        if (description.length > 800) {
            setDescError("Description must be 800 characters or less")
            return
        }

        try {
            setIsCreating(true)
            const supabase = createClient()

            const {
                data: { session },
            } = await supabase.auth.getSession()
            if (!session) throw new Error("Not authenticated")

            const projectData = {
                name: name.trim(),
                description: description.trim(),
                phases,
                milestones,
                category,
            }

            const project = await projects.management.create(projectData as ProjectWithOptions, session.user.id)

            toast({
                title: "Success!",
                description: "Your project has been created successfully",
            })

            router.push(`/projects/${project.id}`)
        } catch (error) {
            console.error("Error creating project:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create project. Please try again.",
            })
        } finally {
            setIsCreating(false)
        }
    }

    const isFormValid = isNameValid && isDescValid && !isCreating

    return (
        <Card className="shadow-xl border-0 bg-white/90 dark:bg-[#0c0c0c]/95 backdrop-blur-sm ring-1 ring-slate-200/50 dark:ring-zinc-900/50">
            <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-zinc-700 to-black dark:from-zinc-800 dark:to-black rounded-lg shadow-lg">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-semibold">Project Details</CardTitle>
                        <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
                            Fill in the information below to create your project
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-8">
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="project-name" className="text-sm font-medium flex items-center gap-2">
                            Project Name
                            <Badge variant="secondary" className="text-xs dark:bg-zinc-900 dark:text-zinc-300">
                                Required
                            </Badge>
                        </Label>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-xs font-medium", getNameCharCountColor())}>{nameCharCount}/50</span>
                            {isNameValid && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            {nameError && <AlertCircle className="h-4 w-4 text-red-500" />}
                        </div>
                    </div>
                    <Input
                        id="project-name"
                        placeholder="Enter a descriptive project name..."
                        value={name}
                        onChange={(e) => {
                            setName(e.currentTarget.value)
                            setNameError("")
                        }}
                        className={cn(
                            "transition-all duration-200 dark:bg-zinc-900 dark:border-zinc-800 dark:placeholder:text-zinc-600",
                            nameError
                                ? "border-red-500 focus-visible:ring-red-500"
                                : isNameValid
                                    ? "border-green-500 focus-visible:ring-green-500"
                                    : "",
                        )}
                    />
                    {nameError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="h-4 w-4" />
                            {nameError}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <Label className="text-sm font-medium">Project Category</Label>
                    <RadioGroup value={category} onValueChange={setCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <RadioGroupItem value="internal" id="internal" className="peer sr-only" />
                            <Label
                                htmlFor="internal"
                                className={cn(
                                    "flex flex-col items-start justify-between rounded-xl border-2 bg-white dark:bg-zinc-900 p-6 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all duration-200 cursor-pointer shadow-sm",
                                    "peer-data-[state=checked]:border-zinc-400 peer-data-[state=checked]:bg-slate-50 dark:peer-data-[state=checked]:bg-black",
                                    category === "internal"
                                        ? "border-zinc-400 bg-slate-50 dark:bg-black shadow-md"
                                        : "border-slate-200 dark:border-zinc-800",
                                )}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Building2 className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                                    <span className="font-medium">Internal</span>
                                </div>
                                <span className="text-sm text-slate-600 dark:text-zinc-400">
                                    Projects for your company or organization
                                </span>
                            </Label>
                        </div>
                        <div className="relative">
                            <RadioGroupItem value="external" id="external" className="peer sr-only" />
                            <Label
                                htmlFor="external"
                                className={cn(
                                    "flex flex-col items-start justify-between rounded-xl border-2 bg-white dark:bg-zinc-900 p-6 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all duration-200 cursor-pointer shadow-sm",
                                    "peer-data-[state=checked]:border-zinc-400 peer-data-[state=checked]:bg-slate-50 dark:peer-data-[state=checked]:bg-black",
                                    category === "external"
                                        ? "border-zinc-400 bg-slate-50 dark:bg-black shadow-md"
                                        : "border-slate-200 dark:border-zinc-800",
                                )}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Users className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                                    <span className="font-medium">External</span>
                                </div>
                                <span className="text-sm text-slate-600 dark:text-zinc-400">
                                    Client projects and external collaborations
                                </span>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="project-description" className="text-sm font-medium flex items-center gap-2">
                            Description
                            <Badge variant="secondary" className="text-xs dark:bg-zinc-900 dark:text-zinc-300">
                                Required
                            </Badge>
                        </Label>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-xs font-medium", getDescCharCountColor())}>{descCharCount}/800</span>
                            {isDescValid && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            {descError && <AlertCircle className="h-4 w-4 text-red-500" />}
                        </div>
                    </div>
                    <Textarea
                        id="project-description"
                        value={description}
                        onChange={(e) => {
                            setDescription(e.currentTarget.value)
                            setDescError("")
                        }}
                        placeholder="Describe your project goals, objectives, and key requirements..."
                        rows={6}
                        className={cn(
                            "transition-all duration-200 resize-none dark:bg-zinc-900 dark:border-zinc-800 dark:placeholder:text-zinc-600",
                            descError
                                ? "border-red-500 focus-visible:ring-red-500"
                                : isDescValid
                                    ? "border-green-500 focus-visible:ring-green-500"
                                    : "",
                        )}
                    />
                    <div className="space-y-2">
                        <Progress value={(descCharCount / 800) * 100} className="h-2 dark:bg-zinc-900" />
                        {descError && (
                            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                <AlertCircle className="h-4 w-4" />
                                {descError}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200 dark:border-zinc-900">
                    <Button
                        variant="outline"
                        className="flex-1 sm:flex-none dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300"
                        onClick={() => router.back()}
                        disabled={isCreating}
                    >
                        Cancel
                    </Button>
                    <Button
                        className={cn(
                            "flex-1 font-semibold transition-all duration-200 shadow-lg"
                        )}
                        onClick={handleCreateProject}
                        disabled={!isFormValid}
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Project...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Create Project
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
