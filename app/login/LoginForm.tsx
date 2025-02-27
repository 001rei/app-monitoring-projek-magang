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

export default function LoginForm() {
    return (
        <Card className="w-96">
            <form>
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
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link href="/forgot-password" className="text-xs text-blue-500">Forgot Password?</Link>
                            </div>
                            <Input id="password" required />
                        </div>
                        <Button className="w-full" type="submit">Sign in</Button>
                    </div>
                </CardContent>
                <CardFooter>
                    <OAuthSignIn />
                </CardFooter>
            </form>
        </Card>
    );
}   