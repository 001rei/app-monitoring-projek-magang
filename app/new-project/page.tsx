import NewProjectForm from "./NewProjectForm"

export default function Page() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-black dark:to-[#0a0a0a]">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent mb-2">
                            Create New Project
                        </h1>
                        <p className="text-slate-600 dark:text-zinc-400 text-lg">
                            Start your next project with a clear plan and structure
                        </p>
                    </div>
                    <NewProjectForm />
                </div>
            </div>
        </div>
    )
}
