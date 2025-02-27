'use client';

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Landing() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <div className="min-h-full bg-gradient-to-b from-background to-background/95">
      <div className="container pt-32">
        <div className="max-w-[800px] mx-auto text-center space-y-8 mb-20">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Master Your Workflow,
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                One task at a time
              </span>
            </h1>
            <p className="text-lg  text-muted-foreground max-w-[600px] mx-auto">
              Elevate your productivity with powerful, intuitive tools designed to help you prioritize, streamline projects, and conquer your tasks effortlessly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
                <Button size="lg" asChild>
                  <Link href="/projects" className="gap-2">
                    View Projects <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/register" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
