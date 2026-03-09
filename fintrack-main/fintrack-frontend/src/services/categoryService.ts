import api from './api';

export interface Category {
  id: number;
  name: string;
  description: string;
  userId?: number;
}

export interface CategoryRequest {
  name: string;
  description: string;
}

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  create: async (data: CategoryRequest): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
};



