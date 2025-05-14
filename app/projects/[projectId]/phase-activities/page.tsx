
import PhaseActivities from "./PhaseActivites";

interface Props {
    params: Promise<{ projectId: string }>;
}

export default async function Page({ params }: Props) {
    const { projectId } = await params;

    return (
        <div className="flex-1">
            <PhaseActivities projectId={projectId} />
        </div>
    );
}