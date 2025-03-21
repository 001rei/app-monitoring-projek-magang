import { tasks } from "@/utils/tasks";
import PhaseTabs from "./PhaseTabs";

interface Props {
    projectId: string;
}

export default async function PhaseActivities({ projectId } : Props) {

    return (
        <div className="p-5">
            <PhaseTabs projectId={projectId} />
        </div>
    );
}