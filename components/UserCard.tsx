import React, { FC, memo } from 'react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import { UserAvatar } from './Avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Props {
    id: string;
    name: string;
    avatarUrl: string;
    description?: string;
    showPreviewName?: boolean;
    avatarStyles?: string;
}


const UserCardContent = memo(
    ({ name, avatarUrl, description, id }: Props) => (
        <div>
            <div className="flex items-center gap-2">
                <Link href={`/profile/${id}`}>
                    <UserAvatar src={avatarUrl} fallback={name.charAt(0)} />
                </Link>
                <p className="text-bold py-2 text-lg">{name}</p>
            </div>

            {description && (
                <p className="text-sm text-muted-foreground py-3">{description}</p>
            )}
        </div>
    )
);

UserCardContent.displayName = 'UserCardContent';

export const UserCard: FC<Props> = memo(
    ({
        id,
        name,
        avatarUrl,
        description,
        showPreviewName = true,
        avatarStyles,
    }) => {
        return (
            <HoverCard>
                <Link href={`/profile/${id}`}>
                    <HoverCardTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                            <UserAvatar
                                src={avatarUrl}
                                fallback={name.charAt(0)}
                                className={cn('w-6 h-6', avatarStyles)}
                            />
                            {showPreviewName && <span className="text-bold">{name}</span>}
                        </div>
                    </HoverCardTrigger>
                </Link>
                <HoverCardContent side="top" className="w-80">
                    <UserCardContent
                        id={id}
                        name={name}
                        avatarUrl={avatarUrl}
                        description={description}   
                    />
                </HoverCardContent>
            </HoverCard>
        );
    }
);

UserCard.displayName = 'UserCard';