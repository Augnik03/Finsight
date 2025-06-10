"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import * as api from './api';

// Predefined categories
export const CATEGORIES = [
  "Food",
  "Rent",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Education",
  "Travel",
  "Salary",
  "Investment",
  "Other"
] as const;

export type Category = typeof CATEGORIES[number];

export interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  description: string;
  date: string;
  category: Category;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, transaction: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
  isLoading: boolean;
  error: string | null;
}

// Budget data
export interface Budget {
  category: Category;
  amount: number;
}

interface BudgetContextType {
  budgets: Budget[];
  setBudget: (category: Category, amount: number) => void;
  getBudget: (category: Category) => number;
  getTotalBudget: () => number;
}

// Initial budget data
const initialBudgets: Budget[] = [
  { category: "Food", amount: 500 },
  { category: "Rent", amount: 1000 },
  { category: "Utilities", amount: 200 },
  { category: "Transportation", amount: 150 },
  { category: "Entertainment", amount: 300 },
];

const TransactionContext = createContext<TransactionContextType & BudgetContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.fetchTransactions();
        
        // Format the date from ISO string to YYYY-MM-DD
        const formattedData = data.map(transaction => ({
          ...transaction,
          date: new Date(transaction.date).toISOString().split('T')[0],
          // Ensure category is one of the predefined categories
          category: CATEGORIES.includes(transaction.category as Category) 
            ? transaction.category as Category 
            : "Other"
        }));
        
        setTransactions(formattedData);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
        // Load dummy data if API fails
        setTransactions([
          {
            id: "1",
            amount: 250.0,
            type: "expense",
            description: "Groceries",
            date: "2023-06-15",
            category: "Food",
          },
          {
            id: "2",
            amount: 1000.0,
            type: "income",
            description: "Salary",
            date: "2023-06-01",
            category: "Salary",
          },
          {
            id: "3",
            amount: 45.0,
            type: "expense",
            description: "Dinner",
            date: "2023-06-10",
            category: "Food",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTransaction = await api.createTransaction(transaction);
      // Format the date from ISO string to YYYY-MM-DD
      const formattedTransaction = {
        ...newTransaction,
        date: new Date(newTransaction.date).toISOString().split('T')[0]
      };
      setTransactions([...transactions, formattedTransaction]);
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Failed to add transaction');
      // Add locally if API fails
      const newTransaction = {
        ...transaction,
        id: Math.random().toString(36).substring(2, 9), // Simple ID generation
      };
      setTransactions([...transactions, newTransaction]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (id: string, transaction: Omit<Transaction, "id">) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTransaction = await api.updateTransaction(id, transaction);
      // Format the date from ISO string to YYYY-MM-DD
      const formattedTransaction = {
        ...updatedTransaction,
        date: new Date(updatedTransaction.date).toISOString().split('T')[0]
      };
      setTransactions(
        transactions.map((t) => (t.id === id ? formattedTransaction : t))
      );
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError('Failed to update transaction');
      // Update locally if API fails
      setTransactions(
        transactions.map((t) => (t.id === id ? { ...transaction, id } : t))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.deleteTransaction(id);
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction');
      // Delete locally if API fails
      setTransactions(transactions.filter((t) => t.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionById = (id: string) => {
    return transactions.find((t) => t.id === id);
  };

  // Budget functions
  const setBudget = (category: Category, amount: number) => {
    const existingBudgetIndex = budgets.findIndex(b => b.category === category);
    
    if (existingBudgetIndex >= 0) {
      const newBudgets = [...budgets];
      newBudgets[existingBudgetIndex].amount = amount;
      setBudgets(newBudgets);
    } else {
      setBudgets([...budgets, { category, amount }]);
    }
  };

  const getBudget = (category: Category) => {
    return budgets.find(b => b.category === category)?.amount || 0;
  };

  const getTotalBudget = () => {
    return budgets.reduce((total, budget) => total + budget.amount, 0);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTransactionById,
        isLoading,
        error,
        budgets,
        setBudget,
        getBudget,
        getTotalBudget,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
} 