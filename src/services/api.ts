import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { 
  Board, 
  Card, 
  List, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  User
} from '../types';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/sessions', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    await api.post('/sessions/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Board services
export const boardService = {
  getBoards: async (): Promise<Board[]> => {
    const response = await api.get<Board[]>('/boards');
    return response.data;
  },
  
  getBoard: async (boardId: string): Promise<Board> => {
    const response = await api.get<Board>(`/boards/${boardId}`);
    return response.data;
  },
  
  createBoard: async (name: string, background?: string): Promise<Board> => {
    const response = await api.post<Board>('/boards', { name, background });
    return response.data;
  },
  
  updateBoard: async (boardId: string, data: Partial<Board>): Promise<Board> => {
    const response = await api.put<Board>(`/boards/${boardId}`, data);
    return response.data;
  },
  
  deleteBoard: async (boardId: string): Promise<void> => {
    await api.delete(`/boards/${boardId}`);
  },
  
  toggleFavorite: async (boardId: string, favorite: boolean): Promise<void> => {
    await api.post(`/boards/${boardId}/favorites`, { favorite });
  },
  
  toggleArchive: async (boardId: string, archived: boolean): Promise<void> => {
    await api.post(`/boards/${boardId}/archives`, { archived });
  },
  
  shareBoard: async (boardId: string, userId: string, role: 'admin' | 'member'): Promise<void> => {
    await api.post(`/boards/${boardId}/shares`, { userId, role });
  },
  
  duplicateBoard: async (boardId: string, name: string, keepMembers = false): Promise<Board> => {
    const response = await api.post<Board>(`/boards/${boardId}/duplicates`, { name, keepMembers });
    return response.data;
  },
  
  getBoardTemplates: async (): Promise<Board[]> => {
    const response = await api.get<Board[]>('/board-templates');
    return response.data;
  },
};

// List services
export const listService = {
  getLists: async (boardId: string): Promise<List[]> => {
    const response = await api.get<List[]>(`/boards/${boardId}/lists`);
    return response.data;
  },
  
  createList: async (boardId: string, title: string): Promise<List> => {
    const response = await api.post<List>(`/boards/${boardId}/lists`, { title });
    return response.data;
  },
  
  updateList: async (listId: string, title: string): Promise<List> => {
    const response = await api.put<List>(`/lists/${listId}`, { title });
    return response.data;
  },
  
  deleteList: async (listId: string): Promise<void> => {
    await api.delete(`/lists/${listId}`);
  },
};

// Card services
export const cardService = {
  getCards: async (listId: string): Promise<Card[]> => {
    const response = await api.get<Card[]>(`/lists/${listId}/cards`);
    return response.data;
  },
  
  getCard: async (cardId: string): Promise<Card> => {
    const response = await api.get<Card>(`/cards/${cardId}`);
    return response.data;
  },
  
  createCard: async (listId: string, title: string, description?: string): Promise<Card> => {
    const response = await api.post<Card>(`/lists/${listId}/cards`, { title, description });
    return response.data;
  },
  
  updateCard: async (cardId: string, data: Partial<Card>): Promise<Card> => {
    const response = await api.put<Card>(`/cards/${cardId}`, data);
    return response.data;
  },
  
  deleteCard: async (cardId: string): Promise<void> => {
    await api.delete(`/cards/${cardId}`);
  },
  
  moveCard: async (cardId: string, listId: string): Promise<Card> => {
    const response = await api.patch<Card>(`/cards/${cardId}/move`, { listId });
    return response.data;
  },
  
  addComment: async (cardId: string, text: string): Promise<void> => {
    await api.post(`/cards/${cardId}/comments`, { text });
  },
  
  addAttachment: async (cardId: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    await api.post(`/cards/${cardId}/attachments`, formData, config);
  },
  
  addChecklist: async (cardId: string, title: string): Promise<void> => {
    await api.post(`/cards/${cardId}/checklist`, { title });
  },
};

export default api;
