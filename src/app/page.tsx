"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExpenseChart } from "@/components/expense-chart";
import { useTransactions } from "@/lib/transaction-context";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { CategoryPieChart } from "@/components/category-pie-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMemo, useState } from "react";
import { DateRangePicker } from "@/components/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  BarChart3, 
  PieChart, 
  Calendar, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock
} from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, Pie, Cell, Legend } from "recharts";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { processTransactionsForChart } from "@/lib/utils";

// Define color palette for charts
const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#fbbf24', '#a78bfa', '#f472b6', '#34d399', '#fb923c'];

export default function Home() {
  return <HomeClient />;
}

function HomeClient() {
  const { transactions, budgets, isLoading, error } = useTransactions();
  const { currencySymbol, formatAmount } = useCurrency();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined);
  
  // Filter transactions by date range if selected
  const filteredTransactions = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return transactions;
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
    });
  }, [transactions, dateRange]);
  
  // Process data for charts
  const monthlyData = useMemo(() => {
    return processTransactionsForChart(filteredTransactions);
  }, [filteredTransactions]);
  
  // Create category data for pie chart
  const categoryData = useMemo(() => {
    const expensesByCategory = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((acc, transaction) => {
        const { category, amount } = transaction;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += amount;
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value
    }));
  }, [filteredTransactions]);
  
  // Calculate total balance, income, and expenses
  const financialSummary = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalBalance = totalIncome - totalExpenses;
    
    // Calculate month-over-month change
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthTransactions = filteredTransactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const lastMonthTransactions = filteredTransactions.filter(t => {
      const date = new Date(t.date);
      return (date.getMonth() === currentMonth - 1 || (currentMonth === 0 && date.getMonth() === 11)) && 
             (currentMonth > 0 ? date.getFullYear() === currentYear : date.getFullYear() === currentYear - 1);
    });
    
    const thisMonthIncome = thisMonthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const thisMonthExpenses = thisMonthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate percentage changes
    const incomeChange = lastMonthIncome === 0 
      ? thisMonthIncome > 0 ? 100 : 0
      : ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;
      
    const expensesChange = lastMonthExpenses === 0
      ? thisMonthExpenses > 0 ? 100 : 0
      : ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    
    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      thisMonthIncome,
      thisMonthExpenses,
      incomeChange,
      expensesChange
    };
  }, [filteredTransactions]);
  
  // Get recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [filteredTransactions]);

  // Calculate spending insights
  const insights = useMemo(() => {
    // Calculate expenses by category
    const expensesByCategory = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((acc, transaction) => {
        const { category, amount } = transaction;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += amount;
        return acc;
      }, {} as Record<string, number>);

    // Find top spending category
    let topCategory = "";
    let topAmount = 0;
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      if (amount > topAmount) {
        topCategory = category;
        topAmount = amount;
      }
    });

    // Find categories over budget
    const overBudgetCategories = budgets
      .filter(budget => {
        const actual = expensesByCategory[budget.category] || 0;
        return actual > budget.amount;
      })
      .map(budget => ({
        category: budget.category,
        budget: budget.amount,
        actual: expensesByCategory[budget.category] || 0,
        overspent: (expensesByCategory[budget.category] || 0) - budget.amount,
        percentage: ((expensesByCategory[budget.category] || 0) / budget.amount) * 100
      }));
    
    // Calculate upcoming bills (dummy data for now)
    const upcomingBills = [
      { name: "Rent", amount: 1200, dueDate: new Date(new Date().setDate(new Date().getDate() + 5)) },
      { name: "Electricity", amount: 85, dueDate: new Date(new Date().setDate(new Date().getDate() + 8)) },
      { name: "Internet", amount: 60, dueDate: new Date(new Date().setDate(new Date().getDate() + 12)) }
    ];

    return {
      topCategory,
      topAmount,
      overBudgetCategories,
      upcomingBills
    };
  }, [filteredTransactions, budgets]);

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Financial Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
          <DateRangePicker 
            value={dateRange}
            onChange={setDateRange}
          />
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="h-10">
              <Link href="/budgets">
                <DollarSign className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Manage Budgets</span>
                <span className="sm:hidden">Budgets</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="h-10">
              <Link href="/transactions/new">
                <ArrowUpCircle className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Add Transaction</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currencySymbol}{formatAmount(financialSummary.totalBalance)}</div>
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
              <div className="flex flex-col">
                <div className="text-2xl font-bold text-green-600">{currencySymbol}{formatAmount(financialSummary.totalIncome)}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <span className={financialSummary.incomeChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {financialSummary.incomeChange >= 0 ? "+" : ""}{financialSummary.incomeChange.toFixed(1)}%
                  </span>
                  <span className="ml-1">vs last month</span>
                </p>
              </div>
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
              <div className="flex flex-col">
                <div className="text-2xl font-bold text-red-600">{currencySymbol}{formatAmount(financialSummary.totalExpenses)}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <span className={financialSummary.expensesChange <= 0 ? "text-green-500" : "text-red-500"}>
                    {financialSummary.expensesChange >= 0 ? "+" : ""}{financialSummary.expensesChange.toFixed(1)}%
                  </span>
                  <span className="ml-1">vs last month</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>Insights</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Recent</span>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>Upcoming</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
                <CardDescription>Monthly comparison for the selected period</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px]">
                  {/* Chart component */}
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <XAxis 
                        dataKey="month" 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${currencySymbol}${value}`}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${currencySymbol}${value}`, '']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Bar dataKey="income" name="Income" fill="#4ade80" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>By category for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${currencySymbol}${value}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="insights">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Top Spending Category */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Top Spending Category
                </CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {insights.topCategory ? (
                  <>
                    <div className="text-2xl font-bold">{insights.topCategory}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {currencySymbol}{formatAmount(insights.topAmount)} spent
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">No expense data available</p>
                )}
              </CardContent>
            </Card>
            
            {/* Budget Alerts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Budget Alerts
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                {insights.overBudgetCategories.length > 0 ? (
                  <div className="space-y-4">
                    {insights.overBudgetCategories.map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.category}</span>
                          <span className="text-red-600 text-sm">
                            {currencySymbol}{formatAmount(item.overspent)} over
                          </span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">All budgets are on track</p>
                )}
              </CardContent>
            </Card>
            
            {/* Upcoming Bills */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Bills
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {insights.upcomingBills.length > 0 ? (
                  <div className="space-y-4">
                    {insights.upcomingBills.map((bill, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{bill.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Due {format(bill.dueDate, "MMM d")}
                          </p>
                        </div>
                        <span>{currencySymbol}{formatAmount(bill.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No upcoming bills</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest 5 transactions</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                        }`}>
                          {transaction.type === "income" ? (
                            <ArrowUpCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[150px] sm:max-w-none">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.category} • {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm font-medium whitespace-nowrap ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}
                        {currencySymbol}{transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No transactions found</p>
                )}
              </div>
              <div className="mt-4 text-center">
                <Button asChild variant="outline" size="sm">
                  <Link href="/transactions">View all transactions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bills</CardTitle>
              <CardDescription>Bills due in the next 30 days</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="space-y-4">
                {insights.upcomingBills.length > 0 ? (
                  insights.upcomingBills.map((bill, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-blue-100">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{bill.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Due {format(bill.dueDate, "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {currencySymbol}{bill.amount.toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No upcoming bills</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
