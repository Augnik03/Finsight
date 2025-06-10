"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { useTransactions } from "@/lib/transaction-context";
import { useMemo } from "react";

export function BudgetComparisonChart() {
  const { transactions, budgets } = useTransactions();

  const comparisonData = useMemo(() => {
    // Only consider expenses for budget comparison
    const expenses = transactions.filter(t => t.type === "expense");
    
    // Calculate actual expenses by category
    const categoryExpenses = expenses.reduce((acc, transaction) => {
      const { category, amount } = transaction;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Create comparison data with budget and actual amounts
    return budgets.map(budget => {
      const actual = categoryExpenses[budget.category] || 0;
      const remaining = budget.amount - actual;
      const status = actual > budget.amount ? "over" : "under";
      
      return {
        category: budget.category,
        budget: budget.amount,
        actual,
        remaining: remaining > 0 ? remaining : 0,
        overspent: remaining < 0 ? Math.abs(remaining) : 0,
        status,
      };
    });
  }, [transactions, budgets]);

  if (comparisonData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No budget data available</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={comparisonData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]}
          />
          <Legend />
          <Bar dataKey="budget" name="Budget" fill="#8884d8" />
          <Bar dataKey="actual" name="Actual" fill="#82ca9d" />
          <Bar dataKey="overspent" name="Overspent" fill="#ff8042" stackId="actual" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 