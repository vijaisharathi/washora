"use client";

import React, { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/query/client";
import { AuthProvider } from "@/providers/AuthProvider";
import { OrganizationProvider } from "@/providers/OrganizationProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClientInstance] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <OrganizationProvider>
          {children}
        </OrganizationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
