import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppType } from "next/app";
import { Inter } from "next/font/google";
import { bscTestnet } from "viem/chains";
import { WagmiConfig, createConfig, createStorage } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { noopStorage, publicClient } from "~/config/wagmiConfig";
import { SaasProvider } from "@saas-ui/react";

import "~/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const queryClient = new QueryClient();

export const wagmiconfig = createConfig({
  storage: createStorage({
    storage: typeof window !== "undefined" ? window.localStorage : noopStorage,
    key: "wagmi_v1.1",
  }),
  autoConnect: false,
  connectors: [new MetaMaskConnector({ chains: [bscTestnet] })],
  publicClient: publicClient,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <SaasProvider>{children}</SaasProvider>;
}

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={`font-sans ${inter.variable}`}>
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={wagmiconfig}>
          <Providers>
            <Component {...pageProps} />
          </Providers>
        </WagmiConfig>
      </QueryClientProvider>
    </main>
  );
};

export default MyApp;
