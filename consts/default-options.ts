import { ICustomFieldData, ICustomFieldTask } from '@/types';
import { v4 as uid } from 'uuid';

export const defaultPhases: ICustomFieldData[] = [
    {
        id: uid(),
        label: 'Perencanaan',
        order: 0,
        status: 1,
    },
    {
        id: uid(),
        label: 'Pendefinisian',
        order: 1,
    },
    {
        id: uid(),
        label: 'Pengembangan',
        order: 2
    },
    {
        id: uid(),
        label: 'Testing Plan',
        order: 3
    },
    {
        id: uid(),
        label: 'Implementasi',
        order: 4
    },
    {
        id: uid(),
        label: 'PIR',
        order: 5
    },
];  

export const defaultTasks: ICustomFieldTask[] = [
    {
        id: uid(),
        title: 'Finalisasi DAD',
        phase_label: 'Perencanaan',
        status: '079c26c7-4e3e-45ff-a3f5-dc11c79ed9ae',
        priority: '12c9ec93-0d57-4c48-aaa8-e43840604282',
    },
    {
        id: uid(),
        title: 'Finalisasi Customer Request',
        phase_label: 'Perencanaan',
        status: '079c26c7-4e3e-45ff-a3f5-dc11c79ed9ae',
        priority: '12c9ec93-0d57-4c48-aaa8-e43840604282',
    },
    {
        id: uid(),
        title: 'Technical Feasibility (Meeting)',
        phase_label: 'Perencanaan',
        status: '079c26c7-4e3e-45ff-a3f5-dc11c79ed9ae',
        priority: '12c9ec93-0d57-4c48-aaa8-e43840604282',
    },
    {
        id: uid(),
        title: 'Pemilihan Vendor',
        phase_label: 'Pendefinisian',
        status: '079c26c7-4e3e-45ff-a3f5-dc11c79ed9ae',
        priority: '12c9ec93-0d57-4c48-aaa8-e43840604282',
    },
    {
        id: uid(),
        title: 'Join Discussion Meeting',
        phase_label: 'Pendefinisian',
        status: '079c26c7-4e3e-45ff-a3f5-dc11c79ed9ae',
        priority: '12c9ec93-0d57-4c48-aaa8-e43840604282',
    },
    {
        id: uid(),
        title: 'Forum Arsitektur',
        phase_label: 'Pendefinisian',
        status: '079c26c7-4e3e-45ff-a3f5-dc11c79ed9ae',
        priority: '12c9ec93-0d57-4c48-aaa8-e43840604282',
    },
    {
        id: uid(),
        title: 'Development',
        phase_label: 'Pengembangan',
        status: '079c26c7-4e3e-45ff-a3f5-dc11c79ed9ae',
        priority: '12c9ec93-0d57-4c48-aaa8-e43840604282',
    },
    {
        id: uid(),
        title: 'Test Management Plan',
        phase_label: 'Testing Plan',
        status: '079c26c7-4e3e-45ff-a3f5-dc11c79ed9ae',
        priority: '12c9ec93-0d57-4c48-aaa8-e43840604282',
    },
    {
        id: uid(),
        title: 'Testing',
        phase_label: 'Testing Plan',
        status: '079c26c7-4e3e-45ff-a3f5-dc11c79ed9ae',
        priority: '12c9ec93-0d57-4c48-aaa8-e43840604282',
    },
    {
        id: uid(),
        title: 'RCB',
        phase_label: 'Implementasi',
        status: '079c26c7-4e3e-45ff-a3f5-dc11c79ed9ae',
        priority: '12c9ec93-0d57-4c48-aaa8-e43840604282',
    },
    {
        id: uid(),
        title: 'Deploy',
        phase_label: 'Implementasi',
        status: '079c26c7-4e3e-45ff-a3f5-dc11c79ed9ae',
        priority: '12c9ec93-0d57-4c48-aaa8-e43840604282',
    },
    {
        id: uid(),
        title: 'PTR',
        phase_label: 'Implementasi',
        status: '079c26c7-4e3e-45ff-a3f5-dc11c79ed9ae',
        priority: '12c9ec93-0d57-4c48-aaa8-e43840604282',
    },
    {
        id: uid(),
        title: 'Go Live',
        phase_label: 'Implementasi',
        status: '079c26c7-4e3e-45ff-a3f5-dc11c79ed9ae',
        priority: '12c9ec93-0d57-4c48-aaa8-e43840604282',
    },
];