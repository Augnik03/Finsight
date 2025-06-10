"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/use-media-query";

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (date: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Predefined date ranges
  const predefinedRanges = [
    {
      name: "Today",
      range: {
        from: new Date(),
        to: new Date(),
      },
    },
    {
      name: "Last 7 days",
      range: {
        from: addDays(new Date(), -6),
        to: new Date(),
      },
    },
    {
      name: "Last 30 days",
      range: {
        from: addDays(new Date(), -29),
        to: new Date(),
      },
    },
    {
      name: "This month",
      range: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
      },
    },
  ];

  // Handle date change
  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    onChange(newDate);
  };

  // Handle predefined range selection
  const handlePredefinedRange = (range: DateRange) => {
    setDate(range);
    onChange(range);
    setOpen(false);
  };

  // Clear the date range
  const handleClear = () => {
    setDate(undefined);
    onChange(undefined);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "h-10 justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  <span className="hidden sm:inline">
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </span>
                  <span className="sm:hidden">
                    {format(date.from, "MM/dd")} - {format(date.to, "MM/dd")}
                  </span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">{format(date.from, "LLL dd, y")}</span>
                  <span className="sm:hidden">{format(date.from, "MM/dd/yy")}</span>
                </>
              )
            ) : (
              <span>Date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="grid grid-cols-2 md:flex md:gap-2 p-3 border-b overflow-x-auto">
            {predefinedRanges.map((predefinedRange) => (
              <Button
                key={predefinedRange.name}
                variant="outline"
                size="sm"
                className="text-xs md:text-sm"
                onClick={() => handlePredefinedRange(predefinedRange.range)}
              >
                {predefinedRange.name}
              </Button>
            ))}
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={isDesktop ? 2 : 1}
            className="p-3"
          />
          <div className="flex items-center justify-end gap-2 p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!date}
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (date) onChange(date);
                setOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 