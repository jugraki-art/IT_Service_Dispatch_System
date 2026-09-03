import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface BackendStatus {
  status: string;
  message: string;
  timestamp: string;
  database: string;
}

export interface Item {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: string;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkBackendHealth = async (): Promise<BackendStatus> => {
  const response = await api.get<BackendStatus>('/health');
  return response.data;
};

export const getItems = async (): Promise<Item[]> => {
  const response = await api.get<Item[]>('/items');
  return response.data;
};

export const createItem = async (data: { title: string; description?: string }): Promise<Item> => {
  const response = await api.post<Item>('/items', data);
  return response.data;
};

export const toggleItemStatus = async (id: number): Promise<Item> => {
  const response = await api.patch<Item>(`/items/${id}/toggle`);
  return response.data;
};

export const deleteItem = async (id: number): Promise<void> => {
  await api.delete(`/items/${id}`);
};
