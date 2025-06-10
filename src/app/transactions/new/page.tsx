"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionForm } from "@/components/transaction-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/lib/transaction-context";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTransactionPage() {
  const { addTransaction, isLoading } = useTransactions();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      setError(null);
      await addTransaction(data);
      router.push("/transactions");
    } catch (err) {
      console.error("Failed to add transaction:", err);
      setError("Failed to add transaction. Please try again.");
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Add Transaction</h1>
        <Button variant="outline" asChild>
          <Link href="/transactions">Cancel</Link>
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm
            onSubmit={handleSubmit}
            isSubmitting={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
} 