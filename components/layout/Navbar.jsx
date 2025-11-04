"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import ThemeSwitcher from "@/components/theme-switcher";

import ProfileModal from "../profile/profile-modal";
import Logo from "../Logo";
import { createClient } from "@/utils/supabase/client";
import { id } from "date-fns/locale";

export default function Navbar({ userData }) {
  const [user, setUser] = useState(userData);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    setUser(userData);
  }, [userData]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async () => {
    // In a real app, you would handle logout logic here
    const supaBase = await createClient();
    const { error } = await supaBase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    setUser(null);
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const getInitials = () => {
    return user?.user_metadata?.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Hide on mobile screens - mobile navbar is shown instead
  if (isMobile) return null;

  return (
    <>
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex h-14 items-center px-4 container mx-auto max-w-5xl">
          <Logo />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeSwitcher variant="ghost" />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          user?.user_metadata?.picture ||
                          "/placeholder.svg?height=32&width=32"
                        }
                        alt="PP"
                      />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={handleProfileClick}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="focus:text-red-500 focus:bg-red-100"
                  >
                    <LogOut className="mr-2 h-4 w-4 focus:text-red-500" />
                    <span className="font-medium">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              ""
            )}
          </div>
        </div>
      </nav>
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={handleLogout}
        user={{ id: user?.id, ...user?.user_metadata }}
        setUser={setUser}
      />
    </>
  );
}
