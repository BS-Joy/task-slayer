import localFont from "next/font/local";
import { Work_Sans } from "next/font/google";

import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import MobileNavbar from "@/components/layout/MobileNavbar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  display: "swap",
});

const trajanPro = localFont({
  src: "../public/fonts/TrajanPro-Regular.ttf",
  variable: "--font-trajan-pro",
  display: "swap",
});

export const metadata = {
  title: "Task Slayer",
  description: "Slay your tasks with Task Slayer",
};

export default async function RootLayout({ children }) {
  const supaBase = await createClient();

  const { data, error } = await supaBase.auth.getUser();

  // console.dir(data);
  return (
    <html lang="en">
      <body
        className={` ${trajanPro.variable} ${workSans.variable} font-work-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="todos-theme-preference"
        >
          <div className="relative min-h-screen flex flex-col">
            <Navbar user={data?.user} />
            <div className="md:pb-0 container mx-auto justify-center px-4">
              {children}
            </div>
            <MobileNavbar />
          </div>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
