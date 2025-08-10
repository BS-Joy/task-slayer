"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { toast } from "sonner";
import AddTaskModal from "../task/add-task-modal";
import ProfileModal from "../profile/profile-modal";
import ThemeSwitcher from "../theme-switcher";
import Logo from "../Logo";

export default function MobileNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [modalType, setModalType] = useState("single");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleAddTask = (type) => {
    setModalType(type);
    setIsAddModalOpen(true);
  };

  const handleLogout = () => {
    // In a real app, you would handle logout logic here
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  // Only show on mobile screens
  if (!isMobile) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex h-full items-center justify-between px-4">
          <Logo />
          <ThemeSwitcher variant="ghost" size="sm" />
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex h-16 items-center justify-around px-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => router.push("/")}
          >
            <Home className="h-5 w-5" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg -translate-y-4 transition-all hover:scale-105"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="center">
              <div className="flex flex-col gap-2">
                <Button onClick={() => handleAddTask("single")}>
                  Add Single Task
                </Button>
                <Button onClick={() => handleAddTask("repetitive")}>
                  Add Repetitive Task
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={handleProfileClick}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </nav>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        type={modalType}
        selectedDate={new Date()}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
}
