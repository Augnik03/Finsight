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
} from "recharts";
import { useTransactions } from "@/lib/transaction-context";
import { processTransactionsForChart } from "@/lib/utils";
import { Transaction } from "@/lib/transaction-context";

interface ExpenseChartProps {
  transactions?: Transaction[];
}

export function ExpenseChart({ transactions: propTransactions }: ExpenseChartProps) {
  const { transactions: contextTransactions } = useTransactions();
  const transactions = propTransactions || contextTransactions;
  const chartData = processTransactionsForChart(transactions);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip 
          formatter={(value) => [`$${value.toFixed(2)}`, undefined]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#4ade80" />
        <Bar dataKey="expense" name="Expense" fill="#f87171" />
      </BarChart>
    </ResponsiveContainer>
  );
} 