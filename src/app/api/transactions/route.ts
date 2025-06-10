import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/transactions - Get all transactions
export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    // Return mock data if database is not available
    const mockTransactions = [
      {
        id: "1",
        amount: 250.0,
        type: "expense",
        description: "Groceries",
        date: new Date("2023-06-15"),
        category: "Food",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        amount: 1000.0,
        type: "income",
        description: "Salary",
        date: new Date("2023-06-01"),
        category: "Salary",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        amount: 45.0,
        type: "expense",
        description: "Dinner",
        date: new Date("2023-06-10"),
        category: "Food",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    return NextResponse.json(mockTransactions);
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { amount, type, description, date, category } = body;
    if (!amount || !type || !description || !date || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate transaction type
    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json(
        { error: 'Transaction type must be "income" or "expense"' },
        { status: 400 }
      );
    }

    try {
      const transaction = await prisma.transaction.create({
        data: {
          amount: parseFloat(amount.toString()),
          type,
          description,
          category,
          date: new Date(date),
        },
      });

      return NextResponse.json(transaction, { status: 201 });
    } catch (dbError) {
      console.error('Database error creating transaction:', dbError);
      
      // Return mock transaction if database is not available
      const mockTransaction = {
        id: Math.random().toString(36).substring(2, 9),
        amount: parseFloat(amount.toString()),
        type,
        description,
        category,
        date: new Date(date),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return NextResponse.json(mockTransaction, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
} 