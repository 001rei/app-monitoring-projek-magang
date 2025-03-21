import type { Metadata } from "next";

import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProvider } from './AppProvider';
import TopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: "Orchestra.",
  description: "Simple Project Management App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
        )}
      >
        <AppProvider>
          <TopLoader color="#91a1cf" showSpinner={false} />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
