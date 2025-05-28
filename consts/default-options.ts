import { ICustomFieldData, ICustomFieldTask } from '@/types';
import { v4 as uid } from 'uuid';

export const defaultPhases: ICustomFieldData[] = [
    {
        id: uid(),
        label: 'Perencanaan',
        phase_order: 1,
        status: 1,
    },
    {
        id: uid(),
        label: 'Pendefinisian',
        phase_order: 2,
    },
    {
        id: uid(),
        label: 'Pengembangan',
        phase_order: 3
    },
    {
        id: uid(),
        label: 'Testing Plan',
        phase_order: 4
    },
    {
        id: uid(),
        label: 'Implementasi',
        phase_order: 5
    },
    {
        id: uid(),
        label: 'PIR',
        phase_order: 6
    },
];  

export const defaultMilestones: ICustomFieldData[] = [
    {
        id: uid(),
        label: 'Finalisasi DAD',
        milestone_order: 1,
        phase_label: 'Perencanaan',
        status: 1,
    },
    {
        id: uid(),
        label: 'Finalisasi Customer Request',
        milestone_order: 2,
        phase_label: 'Perencanaan',
        status: 1,
    },
    {
        id: uid(),
        label: 'Technical Feasibility Meeting',
        milestone_order: 3,
        phase_label: 'Perencanaan',
        status: 1,
    },
    {
        id: uid(),
        label: 'Pemilihan Vendor',
        milestone_order: 4,
        phase_label: 'Pendefinisian',
        status: 1,
    },
    {
        id: uid(),
        label: 'Join Discussion Meeting',
        milestone_order: 5,
        phase_label: 'Pendefinisian',
        status: 1,
    },
    {
        id: uid(),
        label: 'Forum Arsitektur',
        milestone_order: 6,
        phase_label: 'Pendefinisian',
        status: 1,
    },
    {
        id: uid(),
        label: 'Development',
        milestone_order: 7,
        phase_label: 'Pengembangan',
        status: 1,
    },
    {
        id: uid(),
        label: 'Test Management Plan',
        milestone_order: 8,
        phase_label: 'Testing Plan',
        status: 1,
    },
    {
        id: uid(),
        label: 'Testing',
        milestone_order: 9,
        phase_label: 'Testing Plan',
        status: 1,
    },
    {
        id: uid(),
        label: 'Release Control Board',
        milestone_order: 10,
        phase_label: 'Implementasi',
        status: 1,
    },
    {
        id: uid(),
        label: 'Deploy',
        milestone_order: 11,
        phase_label: 'Implementasi',
        status: 1,
    },
    {
        id: uid(),
        label: 'Production Trial Run',
        milestone_order: 12,
        phase_label: 'Implementasi',
        status: 1,
    },
    {
        id: uid(),
        label: 'Go Live',
        milestone_order: 13,
        phase_label: 'Implementasi',
        status: 1,
    },
];  

