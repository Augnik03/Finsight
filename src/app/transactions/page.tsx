"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/lib/transaction-context";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/date-range-picker";
import { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Plus,
  FileDown,
  SlidersHorizontal,
  Download
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TransactionsPage() {
  return <TransactionsClient />;
}

function TransactionsClient() {
  const { transactions, deleteTransaction, isLoading, error } = useTransactions();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleDelete = () => {
    if (deleteId) {
      deleteTransaction(deleteId);
      setDeleteId(null);
      setIsDialogOpen(false);
    }
  };

  // Filter and sort transactions based on selected filters
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(transaction => {
        // Filter by category
        if (categoryFilter && transaction.category !== categoryFilter) {
          return false;
        }
        
        // Filter by type
        if (typeFilter && transaction.type !== typeFilter) {
          return false;
        }
        
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            transaction.description.toLowerCase().includes(query) ||
            transaction.category.toLowerCase().includes(query) ||
            transaction.amount.toString().includes(query)
          );
        }
        
        // Filter by date range
        if (dateRange?.from && dateRange?.to) {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
        }
        
        return true;
      })
      .sort((a, b) => {
        if (sortField === "date") {
          return sortDirection === "asc"
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortField === "amount") {
          return sortDirection === "asc"
            ? a.amount - b.amount
            : b.amount - a.amount;
        } else if (sortField === "description") {
          return sortDirection === "asc"
            ? a.description.localeCompare(b.description)
            : b.description.localeCompare(a.description);
        } else if (sortField === "category") {
          return sortDirection === "asc"
            ? a.category.localeCompare(b.category)
            : b.category.localeCompare(a.category);
        }
        return 0;
      });
  }, [transactions, categoryFilter, typeFilter, searchQuery, dateRange, sortField, sortDirection]);

  // Get unique categories from transactions
  const categories = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.category)));
  }, [transactions]);

  // Toggle sort direction or change sort field
  const toggleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Export transactions to CSV
  const exportToCSV = () => {
    const headers = ["Date", "Description", "Category", "Type", "Amount"];
    
    const csvData = filteredTransactions.map(t => [
      t.date,
      t.description,
      t.category,
      t.type,
      t.amount.toString()
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalBalance = totalIncome - totalExpenses;
    
    return {
      totalIncome,
      totalExpenses,
      totalBalance,
      count: filteredTransactions.length
    };
  }, [filteredTransactions]);

  return (
    <div className="container py-4 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Transactions</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/transactions/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Balance
            </CardTitle>
            <span className="text-muted-foreground">
              {summary.count} transactions
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalBalance.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Income
            </CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${summary.totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expenses
            </CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${summary.totalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <div className="p-2">
                  <p className="text-sm font-medium mb-2">Sort by</p>
                  <Select
                    value={`${sortField}-${sortDirection}`}
                    onValueChange={(value) => {
                      const [field, direction] = value.split("-");
                      setSortField(field);
                      setSortDirection(direction as "asc" | "desc");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Date (Newest)</SelectItem>
                      <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                      <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
                      <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                      <SelectItem value="description-asc">Description (A-Z)</SelectItem>
                      <SelectItem value="description-desc">Description (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="h-10">
              <Link href="/transactions/new">
                <Plus className="mr-1 h-4 w-4" />
                <span>Add</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-10" onClick={exportToCSV}>
              <Download className="mr-1 h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          
          <Select
            value={typeFilter || "all"}
            onValueChange={(value) => setTypeFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[100px] sm:w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={categoryFilter || "all"}
            onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[120px] sm:w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-muted-foreground">Loading transactions...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("date")}>
                    <div className="flex items-center">
                      Date
                      {sortField === "date" && (
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hidden sm:table-cell" onClick={() => toggleSort("description")}>
                    <div className="flex items-center">
                      Description
                      {sortField === "description" && (
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => toggleSort("category")}>
                    <div className="flex items-center">
                      Category
                      {sortField === "category" && (
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => toggleSort("amount")}>
                    <div className="flex items-center justify-end">
                      Amount
                      {sortField === "amount" && (
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="whitespace-nowrap">{transaction.date}</TableCell>
                      <TableCell className="max-w-[200px] truncate hidden sm:table-cell">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="font-normal">
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          className={`font-normal ${
                            transaction.type === "income"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                          }`}
                          variant="secondary"
                        >
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <span
                          className={
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {transaction.type === "income" ? "+" : "-"}$
                          {transaction.amount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8"
                          >
                            <Link href={`/transactions/${transaction.id}/edit`}>
                              <span className="sr-only">Edit</span>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => {
                              setDeleteId(transaction.id);
                              setIsDialogOpen(true);
                            }}
                          >
                            <span className="sr-only">Delete</span>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-gray-100 p-3 mb-4">
                          <Search className="h-6 w-6 text-gray-500" />
                        </div>
                        <p className="text-lg font-medium">No transactions found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Try adjusting your filters or add a new transaction.
                        </p>
                        <Button asChild className="mt-4" variant="outline">
                          <Link href="/transactions/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Transaction
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this transaction? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 