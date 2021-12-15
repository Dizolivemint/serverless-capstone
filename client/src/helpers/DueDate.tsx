import dateFormat from 'dateformat'

export function calculateDueDate(): Date {
  const date = new Date()
  date.setDate(date.getDate() + 7)

  return date as Date
}

export function stringifyDueDate(date: Date): string {
  return dateFormat(date, 'yyyy-mm-dd') as string
}