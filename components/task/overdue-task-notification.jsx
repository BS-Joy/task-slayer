"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTaskStore } from "@/lib/task-store";
import OverdueTasksModal from "./overdue-task-modal";

export default function OverdueNotification() {
  const { getOverdueTasks } = useTaskStore();
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check for overdue tasks
    const tasks = getOverdueTasks();
    setOverdueTasks(tasks);

    // Reset dismissed state when overdue tasks change
    if (tasks.length === 0) {
      setIsDismissed(false);
    }
  }, [getOverdueTasks]);

  // Don't show if no overdue tasks or if dismissed
  if (overdueTasks.length === 0 || isDismissed) return null;

  return (
    <>
      <div className="fixed top-16 md:top-20 inset-x-0 z-50 flex justify-center animate-in fade-in slide-in-from-top-5 duration-300">
        <div className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-lg shadow-md p-4 mx-4 max-w-xl w-full flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>
              You have <strong>{overdueTasks.length}</strong> overdue{" "}
              {overdueTasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-amber-100 dark:bg-amber-800 border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-700 text-amber-800 dark:text-amber-200"
              onClick={() => setIsModalOpen(true)}
            >
              Review
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-800"
              onClick={() => setIsDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <OverdueTasksModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        tasks={overdueTasks}
        setTasks={setOverdueTasks}
      />
    </>
  );
}
