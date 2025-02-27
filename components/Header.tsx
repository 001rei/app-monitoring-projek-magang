import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { inter } from "./ui/fonts";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import UserMenu from './UserMenu';
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const supabase = createClient()

  const [user, setUser] = useState<User | null>();

  const pathname = usePathname();
  const isLanding = pathname === '/';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="ps-5">
          <Link href={'/'} className={`${inter.className} text-xl font-bold`}>Orchestra.</Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <UserMenu user={user} />
          ) : (
              <div className="flex items-center gap-4"> 
                { isLanding && (
                  <>
                    <Button variant="ghost" asChild>
                      <Link href="/login">Sign in</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
          )}
          <div className="border-l px-4 dark:border-gray-800">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
