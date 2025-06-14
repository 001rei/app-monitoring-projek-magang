import Overview from './Overview';
interface Props {
    params: Promise<{ projectId: string }>;
}

export default async function Page({ params }: Props) {
    const { projectId } = await params;

    return (
        <div className="container mx-auto p-8">
            <div className="flex-1">
                <Overview projectId={projectId} />
            </div>
        </div>
    );
}