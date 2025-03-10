import { ICustomFieldData, ICustomFieldTask } from '@/types';
import { v4 as uid } from 'uuid';

export const defaultPhases: ICustomFieldData[] = [
    {
        id: uid(),
        label: 'Perencanaan'
    },
    {
        id: uid(),
        label: 'Pendefinisian'
    },
    {
        id: uid(),
        label: 'Pengembangan'
    },
    {
        id: uid(),
        label: 'Testing Plan'
    },
    {
        id: uid(),
        label: 'Implementasi'
    },
    {
        id: uid(),
        label: 'PIR'
    },
];  

export const defaultStatuses: ICustomFieldData[] = [
    {
        id: uid(),
        label: 'Pending',
        description: 'Tasks that are planned but not yet started',
        color: 'hsl(270, 14.60%, 81.20%)'
    },
    {
        id: uid(),
        label: 'To Do',
        description: 'Tasks ready to be worked on',
        color: 'hsl(195, 100%, 50%)'
    },
    {
        id: uid(),
        label: 'In Progress',
        description: 'Tasks currently being worked on',
        color: 'hsl(220, 100%, 55%)'
    },
    {
        id: uid(),
        label: 'Review',
        description: 'Tasks that are in the review phase',
        color: 'hsl(50, 100%, 45%)'
    },
    {
        id: uid(),
        label: 'Done',
        description: 'Tasks that have been completed',
        color: 'hsl(120, 100%, 35%)'
    },
    {
        id: uid(),
        label: 'Overdue',
        description: 'Tasks that have passed their deadline',
        color: 'hsl(0, 100%, 50%)'
    },
    {
        id: uid(),
        label: 'Blocked',
        description: 'Tasks that are blocked by other issues',
        color: 'hsl(25, 100%, 50%)'
    },
    {
        id: uid(),
        label: 'Awaiting',
        description: 'Tasks waiting for input or response',
        color: 'hsl(180, 100%, 30%)'
    }
];

export const defaultPriorities: ICustomFieldData[] = [
    {
        id: uid(),
        label: 'Blocker',
        description: "Issues that block the team's overall progress",
        color: 'hsl(353, 65%, 53%)',
    },
    {
        id: uid(),
        label: 'Critical',
        description: "Problems that are very important but do not block all progress",
        color: 'hsl(26, 87%, 54%)',
    },
    {
        id: uid(),
        label: 'Major',
        description: "Important issues that need to be resolved",
        color: 'hsl(45, 90%, 54%)',
    },
    {
        id: uid(),
        label: 'Minor',
        description: "Small problems that can be postponed",
        color: 'hsl(212, 66%, 50%)',
    },
    {
        id: uid(),
        label: 'Trivial',
        description: "Very minor issues or cosmetic enhancements",
        color: 'hsl(270, 60%, 60%)',
    },
];

export const defaultTasks: ICustomFieldTask[] = [
    {
        id: uid(),
        title: 'Finalisasi DAD',
        phase_label: 'Perencanaan',
    },
    {
        id: uid(),
        title: 'Finalisasi Customer Request',
        phase_label: 'Perencanaan',
    },
    {
        id: uid(),
        title: 'Technical Feasibility (Meeting)',
        phase_label: 'Perencanaan',
    },
    {
        id: uid(),
        title: 'Pemilihan Vendor',
        phase_label: 'Pendefinisian',
    },
    {
        id: uid(),
        title: 'Join Discussion Meeting',
        phase_label: 'Pendefinisian',
    },
    {
        id: uid(),
        title: 'Forum Arsitektur',
        phase_label: 'Pendefinisian',
    },
    {
        id: uid(),
        title: 'Development',
        phase_label: 'Pengembangan',
    },
    {
        id: uid(),
        title: 'Test Management Plan',
        phase_label: 'Testing Plan',
    },
    {
        id: uid(),
        title: 'Testing',
        phase_label: 'Testing Plan',
    },
    {
        id: uid(),
        title: 'RCB',
        phase_label: 'Implementasi',
    },
    {
        id: uid(),
        title: 'Deploy',
        phase_label: 'Implementasi',
    },
    {
        id: uid(),
        title: 'PTR',
        phase_label: 'Implementasi',
    },
    {
        id: uid(),
        title: 'Go Live',
        phase_label: 'Implementasi',
    },
];