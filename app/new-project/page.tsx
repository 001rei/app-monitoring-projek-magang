import { Separator } from "@/components/ui/separator";
import NewProjectForm from "./NewProjectForm";

export default function Page() {
    return (
        <div className="w-full md:w-[80%] mx-auto p-8">
            <h1 className="text-2xl">Create new project</h1>
            <Separator className="my-4" />
            <NewProjectForm />
        </div>
    );
}