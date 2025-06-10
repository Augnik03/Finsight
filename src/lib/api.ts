import { Transaction } from './transaction-context';

// Type for transaction without ID (for creation)
type TransactionInput = Omit<Transaction, 'id'>;

// Function to format transaction for API
const formatTransactionForApi = (transaction: TransactionInput) => {
  return {
    ...transaction,
    // Convert date string to ISO format for the API
    date: new Date(transaction.date).toISOString(),
  };
};

// Function to fetch all transactions
export async function fetchTransactions(): Promise<Transaction[]> {
  const response = await fetch('/api/transactions');
  
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  
  return response.json();
}

// Function to fetch a single transaction
export async function fetchTransaction(id: string): Promise<Transaction> {
  const response = await fetch(`/api/transactions/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch transaction');
  }
  
  return response.json();
}

// Function to create a new transaction
export async function createTransaction(data: TransactionInput): Promise<Transaction> {
  const formattedData = formatTransactionForApi(data);
  
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formattedData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create transaction');
  }
  
  return response.json();
}

// Function to update a transaction
export async function updateTransaction(id: string, data: TransactionInput): Promise<Transaction> {
  const formattedData = formatTransactionForApi(data);
  
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formattedData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update transaction');
  }
  
  return response.json();
}

// Function to delete a transaction
export async function deleteTransaction(id: string): Promise<void> {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete transaction');
  }
} 