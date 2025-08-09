"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useTaskStore } from "@/lib/task-store";
import { toast } from "sonner";

export default function OverdueTasksModal({
  isOpen,
  closeModal,
  tasks,
  setTasks,
}) {
  const { updateTask, rescheduleTask } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [taskToReschedule, setTaskToReschedule] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [remainingTasks, setRemainingTasks] = useState(tasks);

  // Update remaining tasks when tasks prop changes
  useState(() => {
    setRemainingTasks(tasks);
  }, [tasks]);

  // Handle marking a task as complete
  const handleMarkComplete = (task) => {
    updateTask({
      ...task,
      completed: true,
    });

    const remTasks = remainingTasks.filter((t) => t.id !== task.id);

    // Remove task from the list
    setRemainingTasks(remTasks);

    toast.success(`"${task.title}" marked as complete`);

    // Close modal if no tasks left
    if (remTasks.length < 1) {
      closeModal();
      setTasks(remTasks);
    }
  };

  // Handle rescheduling a task to today
  const handleRescheduleToday = (task) => {
    const today = format(new Date(), "yyyy-MM-dd");
    rescheduleTask(task.id, today);

    const remTasks = remainingTasks.filter((t) => t.id !== task.id);

    // Remove task from the list
    setRemainingTasks(remainingTasks.filter((t) => t.id !== task.id));

    toast.success(`"${task.title}" rescheduled to today`);

    // Close modal if no tasks left
    if (remTasks.length < 1) {
      closeModal();
      setTasks(remTasks);
    }
  };

  // Open date picker for rescheduling
  const handleOpenReschedule = (task) => {
    setTaskToReschedule(task);
    setIsRescheduling(true);
  };

  // Confirm rescheduling to selected date
  const handleConfirmReschedule = () => {
    if (!taskToReschedule) return;

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    rescheduleTask(taskToReschedule.id, formattedDate);

    const remTasks = remainingTasks.filter((t) => t.id !== taskToReschedule.id);
    // Remove task from the list
    setRemainingTasks(remTasks);

    toast.success(
      `"${taskToReschedule.title}" rescheduled to ${format(
        selectedDate,
        "MMMM d, yyyy"
      )}`
    );

    // Reset state
    setTaskToReschedule(null);
    setIsRescheduling(false);

    // Close modal if no tasks left
    if (remTasks.length < 1) {
      closeModal();
      setTasks(remTasks);
    }
  };

  // Handle dismissing a task (keep as is)
  const handleDismiss = (task) => {
    // Just remove from the list without changing the task
    setRemainingTasks(remainingTasks.filter((t) => t.id !== task.id));

    toast.info(`"${task.title}" dismissed - will remain on original date`);

    // Close modal if no tasks left
    if (remainingTasks.length === 1) {
      closeModal();
    }
  };

  // Handle closing the modal
  const handleClose = () => {
    console.log("Closing modal");
    setTaskToReschedule(null);
    setIsRescheduling(false);
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            Overdue Tasks
          </DialogTitle>
          <DialogDescription>
            Review your overdue tasks and decide what to do with them.
          </DialogDescription>
        </DialogHeader>

        {isRescheduling ? (
          <div className="py-4">
            <h3 className="font-medium mb-2">
              Reschedule "{taskToReschedule?.title}"
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select a new date for this task:
            </p>

            <div className="flex flex-col items-center space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                disabled={(date) =>
                  date < new Date() &&
                  format(date, "yyyy-MM-dd") !==
                    format(new Date(), "yyyy-MM-dd")
                }
              />

              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setIsRescheduling(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleConfirmReschedule}>
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {remainingTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <p className="text-muted-foreground">
                  All overdue tasks have been handled!
                </p>
              </div>
            ) : (
              remainingTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700"
                      >
                        Due {format(parseISO(task.date), "MMM d")}
                      </Badge>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Clock className="mr-1 h-3 w-3" />
                      {task.timeStart} - {task.timeEnd}
                    </div>

                    {task.description && (
                      <div className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        <div
                          className="prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: task.description }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[120px] bg-transparent"
                      onClick={() => handleMarkComplete(task)}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Complete
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[120px] bg-transparent"
                      onClick={() => handleRescheduleToday(task)}
                    >
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      Today
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[120px] bg-transparent"
                      onClick={() => handleOpenReschedule(task)}
                    >
                      <CalendarDays className="mr-1 h-4 w-4" />
                      Pick Date
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 min-w-[120px]"
                      onClick={() => handleDismiss(task)}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
