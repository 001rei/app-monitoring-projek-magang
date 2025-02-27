'use client';

import * as React from "react"
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
import { auth } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { getAuthError } from "@/utils/auth-errors";
import { toast } from "@/hooks/use-toast";
import { title } from "process";
import { Icons } from "@/components/icons";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await auth.login(email, password);
            router.push('/projects');
            router.refresh();
        } catch (error) {
            const { message } = getAuthError(error);
            toast({
                variant: 'destructive',
                title: 'Authenctication error',
                description: message,
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-96">
            <form onSubmit={handleSubmit}>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Log in</CardTitle>
                    <CardDescription className="text-xs">Welcome Back</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full items-center gap-4">
                        <div className="pb-2 text-sm">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-blue-600">
                                Create Account
                            </Link>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                value={email}
                                required
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link href="/forgot-password" className="text-xs text-blue-500">Forgot Password?</Link>
                            </div>
                            <Input 
                                id="password" 
                                type="password"
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <Button className="w-full" type="submit">
                            {isLoading && (
                                <Icons.spinner className="h-2 w-4 animate-spin" />
                            )}
                            Sign in
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