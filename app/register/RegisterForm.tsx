"use client";

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import OAuthSignIn from "@/components/OAuthSignIn"
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { auth } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { getAuthError } from "@/utils/auth-errors";
import { Icons } from "@/components/icons";

export default function RegisterForm() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Passwords do not match'
            });
            return;
        }

        try {
            setIsLoading(true);
            await auth.signUp(email, password);
            toast({
                title: 'Success',
                description: 'Please check your email to verify your account',
            });
            router.push('/login');
        } catch (error) {
            const { message } = getAuthError(error);
            toast({
                variant: 'destructive',
                title: 'Account creation error',
                description: message,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-96">
            <form onSubmit={handleRegister}>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Register</CardTitle>
                    <CardDescription className="text-xs">Create a new account</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full items-center gap-4">
                        <div className="pb-2 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-blue-600">
                                Login
                            </Link>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                            </div>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button className="w-full" type="submit">
                            { isLoading && (
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Sign up
                        </Button>
                    </div>
                </CardContent>
                <CardFooter>
                    <OAuthSignIn />
                </CardFooter>
            </form>
        </Card>
    );
}   