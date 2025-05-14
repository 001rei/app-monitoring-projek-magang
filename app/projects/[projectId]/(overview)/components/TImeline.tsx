import { IPhase } from "@/types";

interface Props {
    phases: Partial<IPhase>[];
}

export default function Timeline({ phases }: Props) {

    return (
        <div >
            <div className="relative">

                <div className="absolute left-4 right-4 top-4 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>

                <div
                    className="absolute left-4 top-4 h-px bg-gradient-to-r from-primary to-primary/70 dark:from-primary-400 dark:to-primary/80 transition-all duration-700 ease-out"
                    style={{
                        width: `${((phases.findIndex(p => p.status === 1) + 1) / phases.length * 100)}%`
                    }}
                ></div>

                <div className="relative flex justify-between px-2">
                    {phases.map((phase, index) => {
                        const isCompleted = phase.status === 2;
                        const isCurrent = phase.status === 1;

                        return (
                            <div key={index} className="flex flex-col items-center group" style={{ width: `${100 / 6}%` }}>
                                <div className={`relative z-10 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 ${isCompleted
                                    ? 'bg-background border-2 border-green-500 dark:border-green-400 shadow-[inset_0_0_0_4px_white] dark:shadow-[inset_0_0_0_4px_#020817]'
                                    : isCurrent
                                        ? 'bg-yellow-300 text-primary-foreground shadow-lg ring-2 ring-primary/30 scale-110'
                                        : 'bg-background border border-gray-300 dark:border-gray-600'
                                    }`}>
                                    {isCompleted ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full"></div>
                                        </div>
                                    ) : (
                                        <span className={`text-xs font-medium ${isCurrent ? 'text-primary-foreground' : 'text-muted-foreground'
                                            }`}>
                                            {index + 1}
                                        </span>
                                    )}
                                </div>
                                <span className={`mt-3 text-xs text-center transition-all ${isCompleted
                                    ? 'text-green-600 dark:text-green-400 font-medium'
                                    : isCurrent
                                        ? 'text-primary font-medium'
                                        : 'text-muted-foreground'
                                    }`}>
                                    {phase.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}