import { Suspense } from "react";
import { Icons } from "./icons"
import { Button } from "./ui/button"

function OAuthButtons() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button">
                <Icons.gitHub className="h-4 w-2" />
                Github
            </Button>
            <Button variant="outline" type="button">
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