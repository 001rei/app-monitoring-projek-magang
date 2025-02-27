'use client';

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { auth } from "@/utils/auth";
import { AuthError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function ResetPasswordForm() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            toast({
                variant: 'destructive',
                title: 'Password Reset Failed',
                description: 'The confirmation password does not match. Please try again.'
            });
            return;
        }

        try {
            setIsLoading(true);
            await auth.resetPassword(newPassword);
            toast({
                title: 'Success',
                description: 'Your password has been reset.',
            });
            router.push('/login');
        } catch (error) {
            const authError = error as AuthError;
            toast({
                variant: 'destructive',
                title: 'Error',
                description: authError.message,
            })
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-96">
            <form onSubmit={handleSubmit}>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Reset Password</CardTitle>
                    <CardDescription className="text-xs">Create your new password</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full items-center gap-4">
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="newPassword">New Password</Label>
                            </div>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            </div>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmNewPassword}
                                onChange={e => setConfirmNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button className="w-full" type="submit">
                            {isLoading && (
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Reset Password
                        </Button>
                    </div>
                </CardContent>
            </form>
        </Card>
    );
}