import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function Page({ 
    searchParams 
} : {
    searchParams : Promise<{ error? : string }>;
}) {
    const { error: errorMessage } = await searchParams;

    return (
        <div className="flex justify-center items-center h-minus-135">
            <Card className="w-100">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Authentication Failed <span>❕</span></CardTitle>
                    <CardDescription>
                        Oops! Something went wrong during the authentication process.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <p className="text-sm text-muted-foreground">
                        {errorMessage}
                        <ul className="list-disc list-inside mt-2">
                            <li>An expired or invalid authentication link</li>
                            <li>An interrupted OAuth process</li>
                            <li>A technical glitch on our end</li>
                        </ul>
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button asChild className="w-full">
                        <Link href="/login">Try Again</Link>
                    </Button>
                    <Button asChild className="w-full" variant='outline'>
                        <Link href="/">Back to Home</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>

    );
}