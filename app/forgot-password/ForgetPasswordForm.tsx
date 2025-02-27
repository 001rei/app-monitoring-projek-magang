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
import { auth } from "@/utils/auth"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getAuthError } from "@/utils/auth-errors"
import { Icons } from "@/components/icons";

export default function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [email, setEmail] = React.useState('');

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const response = await auth.resetPasswordRequest(email);
            toast({
                title: 'Check your email',
                description: response.message,
            });
            router.push('/login');
        } catch (error) {
            const { message } = getAuthError(error);
            toast({
                variant: 'destructive',
                title: 'Reset Password Error',
                description: message,
            });
        } finally {
            setIsLoading(false);
        };
    }

    return (
        <Card className="w-96">
            <form onSubmit={handleSubmit}>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Reset Password</CardTitle>
                    <CardDescription className="text-xs">Enter your email address to receive a reset link</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full items-center gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                placeholder="email@example.com"
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button className="w-full" type="submit">
                            {isLoading && (
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Send reset link
                        </Button>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="pb-2 text-sm">
                        Remember your password?{' '}
                        <Link href="/login" className="text-blue-600">
                            Sign In
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}   