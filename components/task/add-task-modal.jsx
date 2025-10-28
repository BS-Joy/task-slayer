"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";

export default function AddTaskModal({ isOpen, onClose, type, selectedDate }) {
  const { addTask } = useTaskStore(); // Corrected: addTask is now destructured here

  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [repetitionPopoverOpen, setRepetitionPopoverOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    date: selectedDate,
    timeStart: "09:00",
    timeEnd: "10:00",
    completed: false,
    isRepetitive: type === "repetitive", // Initial value based on prop
    repetitionEndDate: type === "repetitive" ? null : undefined, // Initial value based on prop
  });
  const [includeTime, setIncludeTime] = useState(false);

  // Update isRepetitive and repetitionEndDate when the 'type' prop changes
  useEffect(() => {
    setNewTask((prevTask) => ({
      ...prevTask,
      isRepetitive: type === "repetitive",
      // Reset repetitionEndDate if type changes from single to repetitive or vice-versa
      repetitionEndDate:
        type === "repetitive" ? prevTask.repetitionEndDate || null : undefined,
    }));
  }, [type]); // Dependency array includes 'type'

  const handleChange = (field, value) => {
    setNewTask({
      ...newTask,
      [field]: value,
    });
  };

  const handleSubmit = () => {
    // Validate form
    if (!newTask.title) {
      alert("Please enter a task title");
      return;
    }

    addTask({
      ...newTask,
      id: Date.now().toString(),
      date: format(newTask.date, "yyyy-MM-dd"),
      timeStart: includeTime ? newTask.timeStart : null,
      timeEnd: includeTime ? newTask.timeEnd : null,
      // Ensure repetitionEndDate is formatted correctly for storage, only if it's a repetitive task
      repetitionEndDate:
        newTask.isRepetitive && newTask.repetitionEndDate
          ? format(newTask.repetitionEndDate, "yyyy-MM-dd")
          : undefined,
    });

    // Reset form and close modal
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      date: selectedDate, // Reset to the currently selected date in the main view
      timeStart: "09:00",
      timeEnd: "10:00",
      completed: false,
      isRepetitive: type === "repetitive", // Reset based on current type prop
      repetitionEndDate: type === "repetitive" ? null : undefined, // Reset based on current type prop
    });
    setIncludeTime(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {type === "repetitive" ? "Add Repetitive Task" : "Add Task"}
          </DialogTitle>
          <DialogDescription>
            {type === "repetitive"
              ? "Create a new repetitive task that will appear on multiple days."
              : "Add a new task to your agenda."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={newTask.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <RichTextEditor
              value={newTask.description}
              onChange={(value) => handleChange("description", value)}
              placeholder="Enter task description with rich formatting..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* priority */}
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) => handleChange("priority", value)}
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

            {/* date */}
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !newTask.date && "text-muted-foreground"
                    )}
                    onClick={() => setDatePopoverOpen(true)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTask.date ? (
                      format(newTask.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTask.date}
                    onSelect={(date) => {
                      handleChange("date", date);
                      if (date) setDatePopoverOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* New: Include Time Toggle */}
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="includeTime"
              checked={includeTime}
              onCheckedChange={setIncludeTime}
            />
            <Label
              htmlFor="includeTime"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Include Time
            </Label>
          </div>

          {includeTime && ( // Conditionally render time inputs
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="timeStart">Start Time</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="timeStart"
                    type="time"
                    value={newTask.timeStart}
                    onChange={(e) => handleChange("timeStart", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="timeEnd">End Time</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="timeEnd"
                    type="time"
                    value={newTask.timeEnd}
                    onChange={(e) => handleChange("timeEnd", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {newTask.isRepetitive && (
            <div className="grid gap-2">
              <Label>Repetition End Date</Label>
              <Popover
                open={repetitionPopoverOpen}
                onOpenChange={setRepetitionPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !newTask.repetitionEndDate && "text-muted-foreground"
                    )}
                    onClick={() => setRepetitionPopoverOpen(true)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTask.repetitionEndDate ? (
                      format(new Date(newTask.repetitionEndDate), "PPP")
                    ) : (
                      <span>No end date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      newTask.repetitionEndDate
                        ? new Date(newTask.repetitionEndDate)
                        : null
                    }
                    onSelect={(date) => {
                      handleChange("repetitionEndDate", date);
                      if (date) setRepetitionPopoverOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
