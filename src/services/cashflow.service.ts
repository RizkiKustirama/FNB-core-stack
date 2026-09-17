import { prisma } from '@/lib/prisma';

export async function getCashflowLogs(type?: 'IN' | 'OUT', startDate?: string, endDate?: string) {
  const where: any = {};
  if (type) where.type = type;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const logs = await prisma.cashflowLog.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      order: {
        select: { id: true, orderNumber: true, totalAmount: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return logs.map((log) => ({
    ...log,
    amount: Number(log.amount),
  }));
}

export async function createExpense(data: {
  userId?: string;
  category: 'SUPPLIES_PURCHASE' | 'UTILITIES' | 'SALARY' | 'OTHER';
  amount: number;
  description: string;
  proofImageUrl?: string;
}) {
  const expense = await prisma.cashflowLog.create({
    data: {
      type: 'OUT',
      category: data.category,
      amount: data.amount,
      description: data.description,
      proofImageUrl: data.proofImageUrl || null,
      userId: data.userId || null,
    },
  });

  return {
    ...expense,
    amount: Number(expense.amount),
  };
}

export async function getProfitAndLossReport(startDate?: string, endDate?: string) {
  const where: any = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const logs = await prisma.cashflowLog.findMany({ where });

  const totalCashIn = logs
    .filter((l) => l.type === 'IN')
    .reduce((sum, l) => sum + Number(l.amount), 0);

  const totalCashOut = logs
    .filter((l) => l.type === 'OUT')
    .reduce((sum, l) => sum + Number(l.amount), 0);

  const netProfit = totalCashIn - totalCashOut;

  // Breakdown by category
  const expenseByCategory = logs
    .filter((l) => l.type === 'OUT')
    .reduce((acc: Record<string, number>, log) => {
      const amountNum = Number(log.amount);
      acc[log.category] = (acc[log.category] || 0) + amountNum;
      return acc;
    }, {});

  return {
    totalCashIn,
    totalCashOut,
    netProfit,
    expenseByCategory,
    transactionCount: logs.length,
  };
}
