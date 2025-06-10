"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionForm } from "@/components/transaction-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { useTransactions } from "@/lib/transaction-context";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Dummy data for now - this will be replaced with actual data fetching
const transactions = [
  {
    id: "1",
    amount: 250.0,
    type: "expense" as const,
    description: "Groceries",
    date: "2023-06-15",
  },
  {
    id: "2",
    amount: 1000.0,
    type: "income" as const,
    description: "Salary",
    date: "2023-06-01",
  },
  {
    id: "3",
    amount: 45.0,
    type: "expense" as const,
    description: "Dinner",
    date: "2023-06-10",
  },
];

interface TransactionParams {
  id: string;
}

// Since this is a client component, we can use useParams instead
export default function EditTransactionPage() {
  return <EditTransactionClient />;
}

function EditTransactionClient() {
  const { getTransactionById, updateTransaction, isLoading } = useTransactions();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const transaction = getTransactionById(id);

  // If the transaction doesn't exist, return a 404
  if (!transaction) {
    notFound();
  }

  const handleSubmit = async (data: any) => {
    try {
      setError(null);
      await updateTransaction(id, data);
      router.push("/transactions");
    } catch (err) {
      console.error("Failed to update transaction:", err);
      setError("Failed to update transaction. Please try again.");
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit Transaction</h1>
        <Button variant="outline" asChild>
          <Link href="/transactions">Cancel</Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm
            transaction={transaction}
            onSubmit={handleSubmit}
            isSubmitting={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
} 