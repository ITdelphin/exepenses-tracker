export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  type: 'expense' | 'income';
  isDefault: boolean;
}

export interface Receipt {
  id: string;
  imageUrl: string;
  ocrText?: string;
  amount?: number;
  date?: string;
  merchant?: string;
}

export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  categoryId: string;
  category: Category;
  date: string;
  paymentMethod: string;
  notes?: string;
  isImportant: boolean;
  isRecurring: boolean;
  recurringInterval?: string;
  receiptId?: string;
  receipt?: Receipt;
  createdAt: string;
}

export interface Income {
  id: string;
  source: string;
  description?: string;
  amount: number;
  categoryId: string;
  category: Category;
  date: string;
  isRecurring: boolean;
  recurringInterval?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  month: number;
  year: number;
  limit: number;
  spent: number;
  categoryId?: string;
  category?: Category;
  usagePercent?: number;
  remaining?: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category?: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  budgetStatus: {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    usagePercent: number;
  };
}

export interface AIAnalysis {
  insights: string[];
  savingsRate: number;
  avgMonthlySpending: number;
  avgMonthlyIncome: number;
  predictedNextMonth: number;
  trend: string;
  unusualTransactions: Expense[];
  topCategories: { category: string; amount: number }[];
  recommendations: string[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
