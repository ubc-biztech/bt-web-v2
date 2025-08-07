import { Event } from "@/constants/companion-events"
import { BiztechEvent } from "@/types"

export function sortEventsByDate(events: BiztechEvent[], order: 'asc' | 'desc' = 'asc'): BiztechEvent[] {
  return events.sort((a, b) => {
    const dateA = new Date(a.startDate).getTime()
    const dateB = new Date(b.startDate).getTime()

    return order === 'asc' ? dateA - dateB : dateB - dateA
  })
}