"use client";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ListTodo, Plus } from "lucide-react";
import Image from "next/image";
import pagperSword from "@/public/swordpaper.png";

const Header = ({ date, setDate }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    if (selectedDate) setPopoverOpen(false);
  };

  return (
    <header className="flex flex-col-reverse gap-2 mb-3 md:flex-row md:justify-between items-center md:mb-6 mt-14 md:mt-0">
      <div className="flex items-center justify-start w-full gap-2">
        {/* <Image
          src={pagperSword}
          // className="rotate-90"
          alt="pager sword"
          width={20}
          height={10}
        /> */}
        {/* <ListTodo size="44px" /> */}
        <span className="rotate-[225deg] text-lg md:text-2xl relative bottom-1">
          🗡️
        </span>
        <h1 className="text-lg md:text-2xl font-bold font-trajan-pro">
          Tasks To Slay:
        </h1>
      </div>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal w-full md:w-auto",
              !date && "text-muted-foreground"
            )}
            onClick={() => setPopoverOpen(true)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </header>
  );
};

export default Header;
