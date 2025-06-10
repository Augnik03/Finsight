import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/transactions/[id] - Get a single transaction
export async function GET(request: Request, { params }: Params) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/[id] - Update a transaction
export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    const { amount, type, description, date, category } = body;

    // Check if transaction exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Validate required fields
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

    const updatedTransaction = await prisma.transaction.update({
      where: {
        id: params.id,
      },
      data: {
        amount: parseFloat(amount.toString()),
        type,
        description,
        category,
        date: new Date(date),
      },
    });

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Delete a transaction
export async function DELETE(request: Request, { params }: Params) {
  try {
    // Check if transaction exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    await prisma.transaction.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
} 