"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type ProvidersProps = {
  children: React.ReactNode;
};

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
