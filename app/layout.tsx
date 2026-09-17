import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono, Inter, Roboto_Slab, Public_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const publicSansHeading = Public_Sans({subsets:['latin'],variable:'--font-heading'});

const robotoSlab = Roboto_Slab({subsets:['latin'],variable:'--font-serif'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "논문탐색기",
  description: "동형암호 연구자가 지금 하려는 일에 쓸모 있는 논문을 골라 한국어 카드로 남깁니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, inter.variable, "font-sans", robotoSlab.variable, publicSansHeading.variable)}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-foreground/10">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="font-heading text-base font-semibold">
              논문탐색기
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                찾기
              </Link>
              <Link href="/note" className="text-muted-foreground hover:text-foreground">
                노트
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
