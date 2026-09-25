import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from "@/components/layout/AppHeader";
import { NodeSwapDrawer } from "@/components/drawer/NodeSwapDrawer";

export const metadata: Metadata = {
  title: "Apex Forge — The Local-First Modding Canvas for Track & Street Builds",
  description:
    "Apex Forge — The Local-First Modding Canvas for Track & Street Builds. BUILT, NOT BOUGHT. Высокоточный модульный симулятор свапа двигателей, трансмиссий и узлов с интерактивным 2D CAD чертежом шасси и расчётом физической телеметрии.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-black">
        {/* Top App Header */}
        <AppHeader />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Global Node Swap Slide-Over Drawer */}
        <NodeSwapDrawer />

        {/* Footer */}
        <footer className="w-full border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">APEX FORGE</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
                BUILT, NOT BOUGHT
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              «Apex Forge — The Local-First Modding Canvas for Track & Street Builds» · Next.js 16 + React 19 + Tailwind v4
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
