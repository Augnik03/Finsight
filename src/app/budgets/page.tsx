"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useTransactions, CATEGORIES, Category } from "@/lib/transaction-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Edit2, Plus } from "lucide-react";

export default function BudgetsPage() {
  return <BudgetsClient />;
}

function BudgetsClient() {
  const { transactions, budgets, setBudget, getBudget, getTotalBudget } = useTransactions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | "">("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Calculate spending by category
  const spendingByCategory = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, transaction) => {
      const { category, amount } = transaction;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += amount;
      return acc;
    }, {} as Record<string, number>);

  // Get all categories with budgets
  const categoriesWithBudgets = budgets.map(budget => budget.category);

  // Calculate total spending
  const totalSpending = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0);

  // Handle budget form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCategory && budgetAmount) {
      const amount = parseFloat(budgetAmount);
      if (!isNaN(amount) && amount > 0) {
        setBudget(selectedCategory as Category, amount);
        setIsDialogOpen(false);
        setSelectedCategory("");
        setBudgetAmount("");
        setEditingCategory(null);
      }
    }
  };

  // Open dialog to edit a budget
  const handleEditBudget = (category: Category) => {
    setEditingCategory(category);
    setSelectedCategory(category);
    setBudgetAmount(getBudget(category).toString());
    setIsDialogOpen(true);
  };

  // Open dialog to add a new budget
  const handleAddBudget = () => {
    setEditingCategory(null);
    setSelectedCategory("");
    setBudgetAmount("");
    setIsDialogOpen(true);
  };

  // Get remaining categories (those without budgets)
  const remainingCategories = CATEGORIES.filter(
    category => !categoriesWithBudgets.includes(category)
  );

  return (
    <div className="container py-4 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild className="mr-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Budget Management</h1>
        </div>
        <Button onClick={handleAddBudget}>
          <Plus className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalBudget().toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalSpending.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getTotalBudget() > 0
                ? `${Math.round((totalSpending / getTotalBudget()) * 100)}%`
                : "N/A"}
            </div>
            {getTotalBudget() > 0 && (
              <Progress
                value={(totalSpending / getTotalBudget()) * 100}
                className="h-2 mt-2"
                indicatorClassName={
                  totalSpending > getTotalBudget()
                    ? "bg-red-500"
                    : totalSpending > getTotalBudget() * 0.8
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          {budgets.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead className="hidden sm:table-cell">Spent</TableHead>
                    <TableHead className="hidden md:table-cell">Remaining</TableHead>
                    <TableHead className="hidden lg:table-cell">Usage</TableHead>
                    <TableHead className="w-[60px] sm:w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.map((budget) => {
                    const spent = spendingByCategory[budget.category] || 0;
                    const remaining = budget.amount - spent;
                    const percentage = (spent / budget.amount) * 100;
                    
                    return (
                      <TableRow key={budget.category}>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {budget.category}
                          </Badge>
                        </TableCell>
                        <TableCell>${budget.amount.toFixed(2)}</TableCell>
                        <TableCell className="hidden sm:table-cell">${spent.toFixed(2)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className={remaining < 0 ? "text-red-600" : "text-green-600"}>
                            ${remaining.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={Math.min(percentage, 100)}
                              className="h-2 flex-1"
                              indicatorClassName={
                                percentage > 100
                                  ? "bg-red-500"
                                  : percentage > 80
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }
                            />
                            <span className="text-sm whitespace-nowrap">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditBudget(budget.category)}
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No budgets set yet. Add your first budget to get started.</p>
              <Button onClick={handleAddBudget} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Budget
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Budget" : "Add Budget"}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update your budget for this category."
                : "Set a budget for a spending category."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                {editingCategory ? (
                  <Input
                    id="category"
                    value={selectedCategory}
                    disabled
                    className="bg-muted"
                  />
                ) : (
                  <Select
                    value={selectedCategory}
                    onValueChange={(value: string) => {
                      setSelectedCategory(value as Category);
                    }}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {remainingCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Budget Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!selectedCategory || !budgetAmount}>
                {editingCategory ? "Update Budget" : "Add Budget"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 