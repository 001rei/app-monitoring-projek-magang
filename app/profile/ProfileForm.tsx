'use client';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { IUser } from "@/types";
import { Eye, Loader2, Check } from "lucide-react";
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
            required_error: 'Please enter your name',
        })
        .min(2, {
            message: 'Name must be at least 2 characters',
        })
        .max(30, {
            message: 'Name must not exceed 30 characters'
        }),
    email: z
        .string({
            required_error: 'Please enter your email'
        })
        .email('Please enter a valid email address'),
    description: z.string()
        .max(300, {
            message: 'Bio must not exceed 300 characters'
        })
        .optional(),
});

type profileFormTypes = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
    data: IUser;
}

export default function ProfileForm({ data }: ProfileFormProps) {
    const [userData, setUserData] = useState<IUser>(data);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

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
            });

            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update profile. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 pb-6 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 pb-4 border-b">
                <h1 className="text-2xl font-semibold">Profile Settings</h1>
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

            <div className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                    <PhotoProfileUploader
                        currentPhotoUrl={userData?.avatar}
                        userProvider={userData?.provider}
                        onPhotoUploaded={async (url: string) => {
                            if (!userData) return;
                            try {
                                await users.updateProfile(userData.id, { avatar: url });
                                setUserData({ ...userData, avatar: url });
                                toast({
                                    title: 'Profile photo updated',
                                    description: 'Your profile photo has been successfully updated.'
                                });
                            } catch (error) {
                                toast({
                                    variant: 'destructive',
                                    title: 'Error',
                                    description: 'Failed to update profile photo.'
                                });
                            }
                        }}
                    />
                    <p className="text-sm text-muted-foreground text-center">
                        Click on the avatar to upload a new photo (Max 2MB)
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            readOnly
                                            className="bg-muted/50"
                                            aria-readonly
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-sm text-muted-foreground">
                                        Contact support if you need to change your email
                                    </p>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="John Doe"
                                            {...field}
                                            className="focus-visible:ring-primary"
                                        />
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
                                    <div className="flex justify-between items-center">
                                        <FormLabel>Bio</FormLabel>
                                        <span className="text-sm text-muted-foreground">
                                            {field.value?.length || 0}/300
                                        </span>
                                    </div>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell us a little bit about yourself..."
                                            className="resize-none min-h-[100px] focus-visible:ring-primary"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                className={cn(
                                    primaryButton,
                                    'min-w-[150px] transition-colors',
                                    isSuccess && 'bg-green-500 hover:bg-green-600'
                                )}
                                disabled={isLoading || !form.formState.isDirty}
                            >
                                {isSuccess ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Updated!
                                    </>
                                ) : isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Profile'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}