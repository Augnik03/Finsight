"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { CATEGORIES, Category } from "@/lib/transaction-context";

interface Transaction {
  id?: string;
  amount: number;
  type: "income" | "expense";
  description: string;
  category: Category;
  date: string;
}

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: Transaction) => void;
  isSubmitting?: boolean;
}

export function TransactionForm({
  transaction,
  onSubmit,
  isSubmitting = false,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<Transaction>({
    amount: transaction?.amount || 0,
    type: transaction?.type || "expense",
    description: transaction?.description || "",
    category: transaction?.category || "Other",
    date: transaction?.date || new Date().toISOString().split("T")[0],
  });

  const handleChange = (field: keyof Transaction, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="amount"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Amount
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              $
            </span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="pl-7"
              value={formData.amount}
              onChange={(e) =>
                handleChange("amount", parseFloat(e.target.value) || 0)
              }
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="type"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Type
          </label>
          <Select
            value={formData.type}
            onValueChange={(value) =>
              handleChange("type", value as "income" | "expense")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Description
        </label>
        <Input
          id="description"
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="category"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Category
        </label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleChange("category", value as Category)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="date"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Date
        </label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : transaction ? "Update" : "Add"} Transaction
        </Button>
      </div>
    </form>
  );
} 