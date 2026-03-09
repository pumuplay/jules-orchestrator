"use client";

import { SessionProvider } from "next-auth/react";
import { UIProvider } from "@/components/layout/UIContext";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <UIProvider>{children}</UIProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}