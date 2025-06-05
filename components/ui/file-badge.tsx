import { Badge } from "@/components/ui/badge"
import { File, FileText, FileImage, FileSpreadsheet, Archive, Presentation } from "lucide-react"

interface FileBadgeProps {
    filename: string
    className?: string
}

const getFileCategory = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase()

    if (ext === "pdf") return "pdf"
    if (["jpeg", "png", "gif", "webp", "jpg"].includes(ext || "")) return "image"
    if (["doc", "docx"].includes(ext || "")) return "word"
    if (["xls", "xlsx"].includes(ext || "")) return "excel"
    if (["ppt", "pptx", "key"].includes(ext || "")) return "presentation"
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext || "")) return "archive"

    return "default"
}

const getFileIcon = (category: string) => {
    switch (category) {
        case "pdf":
            return <FileText className="w-3 h-3" />
        case "word":
            return <FileText className="w-3 h-3" />
        case "presentation":
            return <Presentation className="w-3 h-3" />
        case "image":
            return <FileImage className="w-3 h-3" />
        case "excel":
            return <FileSpreadsheet className="w-3 h-3" />
        case "archive":
            return <Archive className="w-3 h-3" />
        default:
            return <File className="w-3 h-3" />
    }
}

const getFileColor = (category: string) => {
    switch (category) {
        case "pdf":
            return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
        case "image":
            return "bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:hover:bg-cyan-900/50"
        case "word":
            return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
        case "excel":
            return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
        case "presentation":
            return "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50"
        case "archive":
            return "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
        default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
    }
}

export default function FileBadge({ filename, className = "" }: FileBadgeProps) {
    const category = getFileCategory(filename)
    const icon = getFileIcon(category)
    const colorClass = getFileColor(category)

    return (
        <Badge className={`flex items-center gap-1.5 px-2 py-1 ${colorClass} border-0 ${className}`}>
            {icon}
            {filename}
        </Badge>
    )
}

export { getFileCategory, getFileIcon, getFileColor }
