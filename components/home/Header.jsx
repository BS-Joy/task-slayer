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
import { CalendarIcon, Plus } from "lucide-react";
import Image from "next/image";
import pagperSword from "@/public/swordpaper.png";

const Header = ({ date, setDate }) => {
  return (
    <header className="flex justify-between items-center mb-6 mt-14 md:mt-0">
      <div className="flex items-center gap-2">
        <Image
          src={pagperSword}
          // className="rotate-90"
          alt="pager sword"
          width={20}
          height={10}
        />
        <h1 className="text-2xl font-bold font-trajan-pro">Tasks To Slay:</h1>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </header>
  );
};

export default Header;
