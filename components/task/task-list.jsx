"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useTaskStore } from "@/lib/task-store";
// import TaskItem from "@/components/task-item";
// import TaskModal from "@/components/task-modal";
import { Card, CardContent } from "@/components/ui/card";
import TaskItem from "./task-item";
import TaskModal from "./task-modal";

export default function TaskList({ selectedDate }) {
  const { getTasksByDate } = useTaskStore();
  const [viewTask, setViewTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const tasks = getTasksByDate(formattedDate);

  const handleTaskClick = (task) => {
    setViewTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="space-y-4 max-h-[540px] lg:max-h-[680px] overflow-y-auto task-lists">
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No tasks for {format(selectedDate, "MMMM d, yyyy")}. Click the +
            button to add a new task.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onTaskClick={handleTaskClick} />
          ))}
        </div>
      )}

      {viewTask && (
        <TaskModal
          task={viewTask}
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
        />
      )}
    </div>
  );
}
