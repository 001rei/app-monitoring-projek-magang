"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "../components/ui/toaster";
import { ThemeProvider } from "../components/ThemeProvider";
import Header from "../components/Header";
import { usePathname } from "next/navigation";

const queryClient = new QueryClient();

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isProjectPage = /^\/projects\/[a-zA-Z0-9-]+(\/.*)?$/.test(pathname);  

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {!isProjectPage && (
          <div className="h-16">
            <Header />
          </div>
        )}
        {children}
      </ThemeProvider>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
