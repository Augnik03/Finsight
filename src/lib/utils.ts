import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Transaction } from "./transaction-context"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to process transactions for the monthly chart
export function processTransactionsForChart(transactions: Transaction[]) {
  // Create a map to store monthly data
  const monthlyData = new Map()
  
  // Define month names
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]
  
  // Initialize the map with all months
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  
  // Initialize with the last 6 months
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentDate.getMonth() - i + 12) % 12
    const monthName = monthNames[monthIndex]
    monthlyData.set(monthName, { month: monthName, income: 0, expense: 0 })
  }
  
  // Process each transaction
  transactions.forEach(transaction => {
    const date = new Date(transaction.date)
    const month = monthNames[date.getMonth()]
    
    // Only process transactions from the current year and last 6 months
    if (date.getFullYear() === currentYear && monthlyData.has(month)) {
      const monthData = monthlyData.get(month)
      
      if (transaction.type === "income") {
        monthData.income += transaction.amount
      } else {
        monthData.expense += transaction.amount
      }
      
      monthlyData.set(month, monthData)
    }
  })
  
  // Convert map to array and sort by month order
  return Array.from(monthlyData.values()).sort((a, b) => {
    return monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
  })
}
