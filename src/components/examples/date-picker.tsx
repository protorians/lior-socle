"use client"

import * as React from "react"
import { format } from "date-fns"
import {Button} from "@liorian/sdk/presentation/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@liorian/sdk/presentation/ui/popover";
import {CalendarIcon} from "lucide-react";
import {Calendar} from "@liorian/sdk/presentation/ui/calendar";

export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>()

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant="outline"
          data-empty={!date}
          className="justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
        />
        <CalendarIcon />
        {date ? format(date, "PPP") : <span>Pick a date</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  )
}