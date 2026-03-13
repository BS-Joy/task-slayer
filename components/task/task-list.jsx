"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useTaskStore } from "@/lib/task-store";
// import TaskItem from "@/components/task-item";
// import TaskModal from "@/components/task-modal";
import { Card, CardContent } from "@/components/ui/card";
import TaskItem from "./task-item";
import TaskModal from "./task-modal";
import { formatDate } from "@/utils";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { reArrangeTasks } from "@/app/actions/task/taskActions";

export default function TaskList({ selectedDate }) {
  const { dbTasks, reorderTasks } = useTaskStore();

  const [viewTask, setViewTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const formattedDate = formatDate(selectedDate);
  const tasks = dbTasks
    .slice() // create a shallow copy to avoid mutating store
    .sort((a, b) => {
      if (a.timeIncluded && b.timeIncluded) {
        // Compare timeEnd as "HH:mm" strings
        if (a.timeEnd < b.timeEnd) return -1;
        if (a.timeEnd > b.timeEnd) return 1;
      }

      return 0;
    });

  const handleTaskClick = (task) => {
    setViewTask(task);
    setIsTaskModalOpen(true);
  };

  const orderTasks = async (e) => {
    // console.log(e);
    if (e.canceled) return;

    const { source } = e.operation;
    if (isSortable(source)) {
      const { index, initialIndex } = source;

      // console.log("Db Tasks: ", dbTasks);

      // console.log("Index: ", index, ",InitialIndex: ", initialIndex);

      if (initialIndex !== index) {
        let allTasks = dbTasks.slice().sort((a, b) => a.order - b.order);

        // console.log(allTasks);
        const [removedItem] = allTasks.splice(initialIndex, 1);
        allTasks.splice(index, 0, removedItem);

        // console.log("After reorder: ", allTasks);

        const updatedTasks = allTasks.map((task, index) => ({
          ...task,
          order: index + 1,
        }));

        reorderTasks(updatedTasks);

        const res = await reArrangeTasks(updatedTasks);

        // console.log(res);
      }
    }
  };

  return (
    <div className="space-y-4 max-h-[530px] lg:max-h-[680px] overflow-y-auto task-lists">
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No tasks for {format(selectedDate, "MMMM d, yyyy")}. Click the +
            button to add a new task.
          </CardContent>
        </Card>
      ) : (
        <DragDropProvider onDragEnd={orderTasks}>
          <div className="space-y-2">
            {tasks
              .sort((a, b) => a.order - b.order)
              .map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  selectedDate={formattedDate}
                  index={index}
                  onTaskClick={() => handleTaskClick(task)}
                />
              ))}
          </div>
        </DragDropProvider>
      )}

      {viewTask && (
        <TaskModal
          key={viewTask.id}
          task={viewTask}
          isOpen={isTaskModalOpen}
          closeModal={() => setIsTaskModalOpen(false)}
        />
      )}
    </div>
  );
}
