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

export default function ForgotPasswordForm() {
    return (
        <Card className="w-96">
            <form>
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
                                placeholder="email@example.com"
                                required
                            />
                        </div>
                        <Button className="w-full" type="submit">Send reset link</Button>
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