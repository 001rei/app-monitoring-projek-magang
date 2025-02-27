import Link from "next/link";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { User as UserProfile, FolderKanban, FolderPlus, LogOut, CircleUser } from "lucide-react";
import { User } from "@supabase/supabase-js";
import Image from "next/image";

interface Props {
    user: User
}

export default function UserMenu({ user } : Props) {

    const handleSignOut = async () => {
        console.log("sign out");
    }
 
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full border bg-background">
                    {user.user_metadata.avatar_url ? (
                        <Image 
                            src={user.user_metadata.avatar_url}
                            alt={user.email || ''}
                            fill
                            className="rounded-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <CircleUser size = { 28 } />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-2">
                        <p className="text-sm font-medium leading-none">{ user.user_metadata.full_name || user.email }</p>
                        <p className="text-xs text-muted-foreground leading-none">{ user.email }</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full cursor-pointer">
                        <UserProfile className="mr-2 h-4 w-2" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/projects" className="w-full cursor-pointer">
                        <FolderKanban className="mr-2 h-4 w-2" />
                        <span>Projects</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/new-project" className="w-full cursor-pointer">
                        <FolderPlus className="mr-2 h-4 w-2" />
                        <span>New Project</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600" onSelect={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-2" color="#ff0000" />
                    <span>Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

    );
}