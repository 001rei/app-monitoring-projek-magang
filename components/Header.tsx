"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { inter } from "./ui/fonts"
import Link from "next/link"
import { ThemeToggle } from "./ThemeToggle"
import UserMenu from "./UserMenu"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

interface HeaderProps {
  className?: string
}

export default function Header({ className }: HeaderProps) {
  const supabase = createClient()

  const [user, setUser] = useState<User | null>()

  const pathname = usePathname()
  const isLanding = pathname === "/"

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 border-b border-slate-200/50 dark:border-zinc-900/50 bg-white/80 dark:bg-[#0c0c0c]/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#0c0c0c]/80",
        className,
      )}
    >
      <div className="container flex h-16 items-center justify-between px-6">
        <Link
          href={user ? "/projects" : "/"}
          className={cn(
            `${inter.className} text-xl font-bold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-zinc-300 transition-colors duration-200`,
          )}
        > 
          Orchestra.
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <UserMenu user={user} />
          ) : (
            isLanding && (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  asChild
                  className="text-slate-700 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900/50"
                >
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button
                  asChild
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors duration-200"
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )
          )}

          <div className="border-l border-slate-200 dark:border-zinc-800 pl-6">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
