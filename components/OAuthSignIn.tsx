import { Suspense, useState } from "react";
import { Icons } from "./icons"
import { Button } from "./ui/button"
import { auth } from "@/utils/auth";
import { useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { getAuthError } from "@/utils/auth-errors";

interface OAuthButtonsProps {
    redirectUrl?: string;
}

function OAuthButtons({ redirectUrl }: OAuthButtonsProps) {
    const [isLoading, setIsLoading] = useState(false);

    const searchParams = useSearchParams();
    const nextUrl = redirectUrl || searchParams.get('next') || '/projects';

    const handleOAuthSignIn = async (provider: 'github' | 'google') => {
        try {
            setIsLoading(true);
            await auth.signInWithOAuth(provider, nextUrl);
        } catch (error) {
            const { message } = getAuthError(error);
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: message,
            })
        } finally { 
            setIsLoading(false);
        }
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            <Button 
                onClick={() => handleOAuthSignIn('github')} 
                variant="outline" 
                type="button" 
                disabled={isLoading}
            >
                <Icons.gitHub className="h-4 w-2" />
                Github
            </Button>
            <Button 
                onClick={() => handleOAuthSignIn('google')} 
                variant="outline" 
                type="button" 
                disabled={isLoading}
            >
                <Icons.google className="h-4 w-2" />
                Google
            </Button>
        </div>
    );
}

export default function OAuthSignIn() {
    return (
        <div className="w-full">
            <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <div className="bg-background px-2 text-muted-foreground">
                        Or continue with 
                    </div>
                </div>
            </div>

            <Suspense
                fallback={
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" disabled>
                            <Icons.gitHub className="mr-2 h-4 w-2" />
                            Github
                        </Button>
                        <Button variant="outline" disabled>
                            <Icons.google className="mr-2 h-4 w-2" />
                            Google
                        </Button>
                    </div>
                }
            >
                <OAuthButtons/>
            </Suspense>
        </div>
    );
}