'use client';

import { PhotoProfileUploader } from "@/components/ProfilePhotoUploader";
import { Button } from "@/components/ui/button";
import { IUser } from "@/types"
import { users } from "@/utils/users";
import Link from "next/link";
import { useState } from "react";

interface AccountDetailsProps {
    initialData: IUser;
}

export default function AccountDetails({ initialData }: AccountDetailsProps) {
    const [userData, setUserData] = useState<IUser>(initialData)
    return (
        <>
            <PhotoProfileUploader
                currentPhotoUrl={userData.avatar}
                userProvider={userData.provider}
                onPhotoUploaded={async (url) => {
                    if (!userData) return;
                    await users.updateProfile(userData.id, { avatar: url });
                    setUserData({ ...userData, avatar: url });
                }}
            />
            <h1 className="text-xl mt-4">{userData.name}</h1>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {userData.email}
            </div>
            {userData.description && <p className="text-sm">{userData.description}</p>}

            <Button
                className='w-full my-6'
                variant='outline'
                asChild
            >
                <Link href='/profile'>
                    Edit Profile
                </Link>
            </Button>
        </>
        
        
    );
}