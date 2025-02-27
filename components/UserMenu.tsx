import Link from "next/link";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { User, FolderKanban, FolderPlus, LogOut, CircleUser } from "lucide-react";

export default function UserMenu() {

    const handleSignOut = async () => {
        console.log("sign out");
    }
 
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl">
                    <CircleUser size={28} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Wildan Arya</p>
                        <p className="text-xs text-muted-foreground leading-none"> wildanarya707@gmail.com</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full cursor-pointer">
                        <User className="mr-2 h-4 w-2" />
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