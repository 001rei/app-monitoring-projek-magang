'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IUser } from "@/types";
import { Edit } from "lucide-react";
import Link from "next/link";

interface Props {
    user: IUser;
    isOwnProfile: boolean;
}

export default function ProfileView({ user, isOwnProfile }: Props) {
    return (
        <div className="w-[24rem] md:w-[36rem] mx-auto px-6 pb-4">
            <div className="flex justify-between items-center py-6">
                <h1 className="text-2xl">{user.name}</h1>
                {isOwnProfile && (
                    <Button variant="outline" asChild>
                        <Link href="/profile" className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Edit profile
                        </Link>
                    </Button>
                )}
            </div>

            <Avatar className="w-48 h-48">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                    {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                </AvatarFallback>
            </Avatar>

            {user.description && (
                <div>
                    <h2 className="text-lg pt-6 pb-2 font-bold">Bio</h2>
                    <p className="text-lg text-muted-foreground">{user.description}</p>
                </div>
            )}
        </div>
    );
}