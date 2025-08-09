"use client";
import { useEffect, useState } from "react";
import Header from "./Header";
import TaskList from "../task/task-list";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useTaskStore } from "@/lib/task-store";
import AddTaskModal from "../task/add-task-modal";

const HomeContainer = () => {
  const [date, setDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState("single");

  const { initializeTasks } = useTaskStore();

  useEffect(() => {
    initializeTasks();
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [initializeTasks]);

  const handleAddTask = (type) => {
    setModalType(type);
    setIsAddModalOpen(true);
  };
  return (
    <>
      <Header date={date} setDate={setDate} />

      <TaskList selectedDate={date} />

      {!isMobile && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg transition-all hover:scale-105 add-button"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="end">
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
        </div>
      )}

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        type={modalType}
        selectedDate={date}
      />
    </>
  );
};

export default HomeContainer;
