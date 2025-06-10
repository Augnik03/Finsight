"use client";

import { useTransactions } from "@/lib/transaction-context";
import { Card } from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useMemo } from "react";
import { Transaction } from "@/lib/transaction-context";

// Array of colors for the pie chart segments
const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", 
  "#FF6B6B", "#4ECDC4", "#FF9F1C", "#6A0572", "#AB83A1"
];

interface CategoryPieChartProps {
  transactions?: Transaction[];
}

export function CategoryPieChart({ transactions: propTransactions }: CategoryPieChartProps) {
  const { transactions: contextTransactions } = useTransactions();
  const transactions = propTransactions || contextTransactions;
  
  // Calculate expenses by category
  const expenseData = useMemo(() => {
    // Filter only expense transactions
    const expenses = transactions.filter(t => t.type === "expense");
    
    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, transaction) => {
      const { category, amount } = transaction;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array format for Recharts
    return Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }, [transactions]);
  
  // If no expense data, show a message
  if (expenseData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No expense data available</p>
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={expenseData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {expenseData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => `$${value.toFixed(2)}`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
} 