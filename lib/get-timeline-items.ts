import { ActivityResponse, CommentResponse, ITimeline, TimelineType } from '@/types';
import { v4 as uid } from 'uuid';

export const getTimelineItems = (
    activities: ActivityResponse[],
    comments: CommentResponse[]
) => {

    const filteredComments = comments.filter(( c ) => c.parent_id === null);

    const timelineItems: ITimeline[] = [
        ...activities.map((activity) => ({
            id: uid(),
            created_at: new Date(activity.created_at),
            type: 'activity' as TimelineType,
            value: activity,
        })),

        ...filteredComments.map((comment) => ({
            id: uid(),
            created_at: new Date(comment.created_at),
            type: 'comment' as TimelineType,
            value: comment,
        })),
    ].sort(
        (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return timelineItems;
};