// Types for the API response data
export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  isArchived: boolean;
  background: string;
  isTemplate: boolean;
  isFavorite: boolean;
  members: BoardMember[];
}

export interface BoardMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
}

export interface List {
  id: string;
  boardId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  listId: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  labels?: string[];
  attachments?: Attachment[];
  checklist?: Checklist[];
  comments?: Comment[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface ApiError {
  error: string;
}

// Types for application state
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface BoardsState {
  boards: Board[];
  currentBoard: Board | null;
  isLoading: boolean;
  error: string | null;
}

export interface ListsState {
  lists: List[];
  isLoading: boolean;
  error: string | null;
}

export interface CardsState {
  cards: Record<string, Card[]>; // Map listId to array of cards
  isLoading: boolean;
  error: string | null;
}
