'use client';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { IUser } from "@/types";
import { Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { users } from "@/utils/users";
import { toast } from "@/hooks/use-toast";
import { PhotoProfileUploader } from "@/components/ProfilePhotoUploader";
import { primaryButton } from "@/consts/buttonStyles";

const profileFormSchema = z.object({
    name: z
        .string({
            required_error: 'Name must be provided.',
        })
        .max(25, {
            message: ''
        }),
    email: z
        .string({
            required_error: 'Email must be provided'
        })
        .email(),
    description: z.string().max(160).optional(),
});

type profileFormTypes = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
    data: IUser;
}

export default function ProfileForm({ data }: ProfileFormProps) {
    const [userData, setUserData] = useState<IUser>(data);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<profileFormTypes>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: data.name,
            email: data.email,
            description: data.description || '',
        },
    });

    const onSubmit = async (data: profileFormTypes) => {
        if (!userData) return;
        try {
            setIsLoading(true);
            await users.updateProfile(userData.id, {
                name: data.name,
                description: data.description,
            });
            toast({
                title: 'Profile updated',
                description: 'Your profile has been successfully updated.'
            })
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update profile. Please try again.'
            })
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-[24rem] md:w-[36rem] mx-auto px-6 pb-4">
            <div className="flex justify-between items-center py-6">
                <h1 className="text-2xl">Profile</h1>
                {userData && (
                    <Button variant='outline' asChild>
                        <Link
                            href={`/profile/${userData.id}`}
                            className="flex items-center gap-2"
                        >
                            <Eye className="h-4 w-4" />
                            View public profile
                        </Link>
                    </Button>
                )}
            </div>
            <PhotoProfileUploader 
                currentPhotoUrl={userData?.avatar} 
                userProvider={userData?.provider} 
                onPhotoUploaded={async (url: string) => {
                    if (!userData) return;
                    await users.updateProfile(userData.id, { avatar: url });
                    setUserData({ ...userData, avatar: url })
                }}
            />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} readOnly />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Tell us little bit about yourself"
                                        className="resize-none"
                                        {...field}
                                    /> 
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className={cn(primaryButton)} disabled={isLoading}>
                        {isLoading && (<Loader2 className="mr-2 h-2 w-4 animate-spin" />)}
                        {isLoading ? ('Updating...') : ('Update Profile')}
                    </Button>
                </form>
            </Form>
        </div>
    );
}