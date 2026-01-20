"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  CalendarIcon,
  Clock,
  AlertCircle,
  CalendarDays,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/rich-text-editor";
import { useTaskStore } from "@/lib/task-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { deleteTask } from "@/app/actions/task/taskActions";
import ButtonLoader from "../ButtonLoader";
import { useRouter } from "next/navigation";

export default function TaskModal({ task, isOpen, closeModal }) {
  const { updateTask, rescheduleTask, deleteStateTask } = useTaskStore();
  const [editedTask, setEditedTask] = useState(() => {
    // Initialize with the task data.
    // For repetitive tasks, the 'date' in the modal should reflect the series start date (originalDate).
    // For single tasks, it's just their date.
    // Ensure date and repetitionEndDate are Date objects for the calendar component.
    return {
      ...task,
      date: new Date(task.originalDate || task.date), // Use originalDate for repetitive tasks' series start
      repetitionEndDate: task.repetitionEndDate
        ? new Date(task.repetitionEndDate)
        : null,
    };
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSave = () => {
    updateTask({
      ...editedTask,
      // Ensure date and repetitionEndDate are formatted as strings for storage
      date: format(editedTask.date, "yyyy-MM-dd"),
      repetitionEndDate: editedTask.repetitionEndDate
        ? format(editedTask.repetitionEndDate, "yyyy-MM-dd")
        : undefined,
    });
    setIsEditing(false);
    toast.success("Task updated successfully");
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await deleteTask(task.id);

      if (res?.error) {
        toast.error("Failed to delete task.");
        console.error("Error deleting task:", res.error);
        return;
      }

      if (res?.status === 200 && res?.data) {
        deleteStateTask(task.id);
        toast.success("Task deleted successfully");
        setLoading(false);
        closeModal();
        router.refresh();
        return;
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = () => {
    const newDateKey = format(rescheduleDate, "yyyy-MM-dd");
    rescheduleTask(task.id, newDateKey);
    setIsRescheduling(false);
    closeModal();
    toast.success(
      `Task rescheduled to ${format(rescheduleDate, "MMMM d, yyyy")}`,
    );
  };

  const handleChange = (field, value) => {
    setEditedTask({
      ...editedTask,
      [field]: value,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isRescheduling
              ? "Reschedule Task"
              : isEditing
                ? "Edit Task"
                : "Task Details"}
          </DialogTitle>
          <DialogDescription>
            {isRescheduling
              ? "Select a new date for this task."
              : isEditing
                ? "Make changes to your task here."
                : "View your task details."}
          </DialogDescription>
        </DialogHeader>

        {isRescheduling ? (
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Task: {task.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Current date: {format(new Date(task.date), "MMMM d, yyyy")}
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <Calendar
                  mode="single"
                  selected={rescheduleDate}
                  onSelect={setRescheduleDate}
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
                  <Button className="flex-1" onClick={handleReschedule}>
                    Reschedule to {format(rescheduleDate, "MMM d")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedTask.title}
                onChange={(e) => handleChange("title", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              {isEditing ? (
                <RichTextEditor
                  value={editedTask.description}
                  onChange={(value) => handleChange("description", value)}
                  placeholder="Enter task description with rich formatting..."
                />
              ) : (
                <div className="min-h-[120px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                  {editedTask.description ? (
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{
                        __html: editedTask.description,
                      }}
                    />
                  ) : (
                    <span className="text-muted-foreground">
                      No description
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select
                  value={editedTask.priority}
                  onValueChange={(value) => handleChange("priority", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !editedTask.date && "text-muted-foreground",
                      )}
                      disabled={!isEditing}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedTask.date ? (
                        format(editedTask.date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editedTask.date}
                      onSelect={(date) => handleChange("date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="timeStart">Start Time</Label>
                <div className="flex items-center">
                  {/* <Clock className="mr-2 h-4 w-4 text-muted-foreground" /> */}
                  <Input
                    id="timeStart"
                    type="time"
                    value={editedTask.timeStart || ""}
                    onChange={(e) => handleChange("timeStart", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="timeEnd">End Time</Label>
                <div className="flex items-center">
                  {/* <Clock className="mr-2 h-4 w-4 text-muted-foreground" /> */}
                  <Input
                    id="timeEnd"
                    type="time"
                    value={editedTask.timeEnd || ""}
                    onChange={(e) => handleChange("timeEnd", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {editedTask.isRepetitive && (
              <div className="grid gap-2">
                <Label>Repetition End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !editedTask.repetitionEndDate &&
                          "text-muted-foreground",
                      )}
                      disabled={!isEditing}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedTask.repetitionEndDate ? (
                        format(new Date(editedTask.repetitionEndDate), "PPP")
                      ) : (
                        <span>No end date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        editedTask.repetitionEndDate
                          ? new Date(editedTask.repetitionEndDate)
                          : null
                      }
                      onSelect={(date) =>
                        handleChange("repetitionEndDate", date)
                      } // Pass Date object directly
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {editedTask.rescheduled &&
              !isEditing &&
              editedTask.originalDueDate && (
                <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Rescheduled Task
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        This task was originally due on{" "}
                        {(() => {
                          try {
                            const dateToFormat =
                              typeof editedTask.originalDueDate === "string"
                                ? parseISO(editedTask.originalDueDate)
                                : new Date(editedTask.originalDueDate);

                            if (isNaN(dateToFormat.getTime())) {
                              return "a previous date";
                            }

                            return format(dateToFormat, "MMMM d, yyyy");
                          } catch (error) {
                            console.warn(
                              "Error parsing originalDueDate:",
                              editedTask.originalDueDate,
                              error,
                            );
                            return "a previous date";
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}

        <DialogFooter className="">
          {isRescheduling ? null : isEditing ? (
            <>
              {/* <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button> */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col-reverse md:flex-row justify-between w-full gap-2">
              <Button
                variant="destructive"
                className={`${loading ? "" : ""}`}
                onClick={handleDelete}
              >
                {loading ? (
                  <ButtonLoader />
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
              <div className="flex justify-between md:justify-normal gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setIsRescheduling(true)}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Reschedule
                </Button>
                {/* <Button variant="outline" onClick={closeModal}>
                    Close
                  </Button> */}
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
              </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
