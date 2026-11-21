import { prisma } from '@/lib/prisma';

function parseDateRange(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return undefined;
  const createdAt: any = {};
  if (startDate) {
    const [y, m, d] = startDate.split('-').map(Number);
    createdAt.gte = new Date(y, m - 1, d, 0, 0, 0, 0);
  }
  if (endDate) {
    const [y, m, d] = endDate.split('-').map(Number);
    createdAt.lte = new Date(y, m - 1, d, 23, 59, 59, 999);
  } else if (startDate) {
    // If only startDate is given, filter that whole day
    const [y, m, d] = startDate.split('-').map(Number);
    createdAt.lte = new Date(y, m - 1, d, 23, 59, 59, 999);
  }
  return createdAt;
}

export async function getCashflowLogs(type?: 'IN' | 'OUT', startDate?: string, endDate?: string) {
  const where: any = {};
  if (type) where.type = type;
  const dateRange = parseDateRange(startDate, endDate);
  if (dateRange) {
    where.createdAt = dateRange;
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
  const dateRange = parseDateRange(startDate, endDate);
  if (dateRange) {
    where.createdAt = dateRange;
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
