"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Clock, Flag, AlertCircle, Repeat } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useTaskStore } from "@/lib/task-store";
import { useTheme } from "next-themes";

export default function TaskItem({ task, onTaskClick }) {
  const { updateTask } = useTaskStore();
  const [checked, setChecked] = useState(task.completed);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleCheckboxChange = (value) => {
    setChecked(value);
    updateTask({
      ...task,
      completed: value,
    });
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
      className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md task-item ${
        checked ? "bg-muted" : "bg-card"
      }`}
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
            <Badge className={`${getPriorityColor(task.priority)} text-white`}>
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

          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <Clock className="mr-1 h-3 w-3" />
            {task.timeStart} - {task.timeEnd}
            {task.isRepetitive && (
              <Badge variant="outline" className="ml-2 text-xs">
                Repetitive
                <Repeat />
              </Badge>
            )}
            {task.rescheduled && task.originalDueDate && (
              <Badge
                variant="outline"
                className="ml-2 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700"
              >
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
                      error
                    );
                    return "previous date";
                  }
                })()}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
