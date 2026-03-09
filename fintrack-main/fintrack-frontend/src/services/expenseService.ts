import api from './api';

export interface Expense {
  id: number;
  categoryId: number;
  categoryName?: string;
  amount: number;
  description: string;
  date: string;
  paymentMode: string;
}

export interface ExpenseRequest {
  categoryId: number;
  amount: number;
  description: string;
  date: string;
  paymentMode: string;
}

export const expenseService = {
  getAll: async (): Promise<Expense[]> => {
    const response = await api.get('/expenses');
    return response.data;
  },

  getById: async (id: number): Promise<Expense> => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  create: async (data: ExpenseRequest): Promise<Expense> => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  update: async (id: number, data: ExpenseRequest): Promise<Expense> => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  }
};



