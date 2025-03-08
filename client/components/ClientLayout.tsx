'use client';

import NavBar from "@/components/ui/navbar";
import { Toaster } from 'sonner';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative flex min-h-svh flex-col bg-background">
        <div data-wrapper="" className="border-grid flex flex-1 flex-col">
          <NavBar />
          <main className="flex flex-1 flex-col">{children}</main>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </>
  );
}