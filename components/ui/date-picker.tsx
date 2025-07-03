"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DatePickerProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
  initialFocus?: boolean;
  mode?: "single" | "range" | "multiple";
  min?: string;
  max?: string;
}

export function DatePicker({
  selected,
  onSelect,
  disabled,
  className,
  initialFocus,
  mode = "single",
  min,
  max,
  ...props
}: DatePickerProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onSelect">) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const selectedDate = new Date(e.target.value);
      if (onSelect) {
        onSelect(selectedDate);
      }
    } else {
      if (onSelect) {
        onSelect(undefined);
      }
    }
  };

  return (
    <div className={cn("p-3", className)}>
      <input
        type="date"
        className={cn(
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        )}
        value={selected ? format(selected, "yyyy-MM-dd") : ""}
        onChange={handleChange}
        autoFocus={initialFocus}
        min={min}
        max={max}
        {...props}
      />
    </div>
  );
}

DatePicker.displayName = "DatePicker"; 