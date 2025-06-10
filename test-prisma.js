// Simple script to test Prisma client
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Test connection
    console.log('Testing database connection...');
    
    // Create a test transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: 100,
        type: 'expense',
        description: 'Test transaction',
        category: 'Food',
        date: new Date(),
      },
    });
    
    console.log('Created transaction:', transaction);
    
    // Fetch all transactions
    const transactions = await prisma.transaction.findMany();
    console.log(`Found ${transactions.length} transactions`);
    
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Error testing database connection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 