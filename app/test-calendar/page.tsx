"use client"

import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"

export default function TestCalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Calendar Test</h1>
      <div className="max-w-sm">
        <Calendar
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </div>
      {date && (
        <p className="mt-4 text-muted-foreground">
          Selected date: {date.toLocaleDateString()}
        </p>
      )}
    </div>
  )
}