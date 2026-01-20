"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Clock, Flag, AlertCircle, Repeat, CalendarSync } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useTaskStore } from "@/lib/task-store";
import { useTheme } from "next-themes";
import { updateTaskCompletion } from "@/app/actions/task/taskActions";
import { toast } from "sonner";
import ButtonLoader from "../ButtonLoader";

export default function TaskItem({ task, onTaskClick }) {
  // const { updateTask } = useTaskStore();
  const [checked, setChecked] = useState(task.completed);
  const [loading, setLoading] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleCheckboxChange = async () => {
    try {
      setLoading(true);

      const res = await updateTaskCompletion(task, checked);

      if (res?.error) {
        toast.error("Failed to update task status.");
        console.error("Error updating task completion:", res.error);
        return;
      }

      if (res?.status === 200 && res?.data) {
        setChecked(res.data.completed);
        toast.success("Task status updated.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return isDark
          ? "bg-red-700 hover:bg-red-600"
          : "bg-red-500 hover:bg-red-600";
      case "medium":
        return isDark
          ? "bg-yellow-600 hover:bg-yellow-500"
          : "bg-yellow-500 hover:bg-yellow-600";
      case "low":
        return isDark
          ? "bg-green-700 hover:bg-green-600"
          : "bg-green-500 hover:bg-green-600";
      default:
        return isDark
          ? "bg-slate-700 hover:bg-slate-600"
          : "bg-slate-500 hover:bg-slate-600";
    }
  };

  // Function to strip HTML tags and get plain text for preview
  const getPlainTextPreview = (html) => {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
  };

  return (
    <div
      className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md task-item relative overflow-hidden ${
        checked ? "bg-muted" : "bg-card"
      } ${loading ? "opacity-70 pointer-events-none" : ""}`}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={handleCheckboxChange}
          className="h-5 w-5 mt-0.5"
        />

        <div
          className="flex-1 cursor-pointer"
          onClick={() => onTaskClick(task)}
        >
          <div className="flex items-center justify-between">
            <h3
              className={`font-medium ${
                checked ? "line-through text-muted-foreground" : ""
              }`}
            >
              {task.title}
            </h3>
            <Badge
              className={`${getPriorityColor(
                task.priority,
              )} text-white absolute top-0 right-0 px-1 py-0 md:relative`}
            >
              <Flag className="mr-1 h-3 w-3" />
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
          </div>

          {/* {task.description && (
            <p
              className={`text-sm mt-1 ${
                checked ? "text-muted-foreground" : "text-muted-foreground"
              }`}
            >
              {getPlainTextPreview(task.description)}
            </p>
          )} */}

          <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
            <div className="flex items-center">
              {task.timeStart ? (
                <>
                  <Clock className="mr-1 h-3 w-3" />
                  {task.timeStart} - {task.timeEnd}
                </>
              ) : (
                ""
              )}
            </div>
            {task.isRepetitive && (
              <Badge variant="outline" className="ml-2 text-xs">
                <span className="hidden md:inline">Repetitive</span>
                <Repeat />
              </Badge>
            )}
            {task.rescheduled && task.originalDueDate && (
              <Badge
                variant="outline"
                className="ml-2 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700"
              >
                <CalendarSync className="block md:hidden" />
                <div className="hidden md:flex items-center">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Rescheduled from{" "}
                  {(() => {
                    try {
                      // Handle both string dates and already parsed dates
                      const dateToFormat =
                        typeof task.originalDueDate === "string"
                          ? parseISO(task.originalDueDate)
                          : new Date(task.originalDueDate);

                      // Check if the date is valid
                      if (isNaN(dateToFormat.getTime())) {
                        return "previous date";
                      }

                      return format(dateToFormat, "MMM d");
                    } catch (error) {
                      console.warn(
                        "Error parsing originalDueDate:",
                        task.originalDueDate,
                        error,
                      );
                      return "previous date";
                    }
                  })()}
                </div>
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
