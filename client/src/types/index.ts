export interface User {
  id: string;
  username: string;
  displayName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'done';
  priority: number;
  assignedTo: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Source {
  id: string;
  title: string;
  url: string | null;
  sourceType: 'article' | 'video' | 'podcast' | 'report' | 'tweet' | 'other';
  summary: string | null;
  notes: string | null;
  createdBy: string;
  attachments?: Attachment[];
  stocks?: LinkedStock[];
  todos?: LinkedTodo[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface LinkedStock {
  id: string;
  ticker: string;
  companyName: string;
}

export interface LinkedTodo {
  id: string;
  title: string;
  status: string;
}

export interface Attachment {
  id: string;
  sourceId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
  createdAt: string;
}

export interface Stock {
  id: string;
  ticker: string;
  companyName: string;
  sector: string | null;
  notes: string | null;
  decisionStatus: 'researching' | 'considering' | 'bought' | 'passed' | 'sold' | 'watching';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  stockId: string;
  userId: string;
  status: 'researching' | 'considering' | 'bought' | 'passed' | 'sold' | 'watching';
  reasoning: string | null;
  createdAt: string;
}

export interface Comment {
  id: string;
  entityType: 'source' | 'stock' | 'todo';
  entityId: string;
  parentId: string | null;
  body: string;
  createdBy: string;
  authorName: string;
  authorUsername: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Analysis {
  id: string;
  stockId: string;
  userId: string;
  thesis: string | null;
  bullCase: string | null;
  bearCase: string | null;
  notes: string | null;
  targetPrice: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalStocks: number;
  totalSources: number;
  totalTodos: number;
  pendingTodos: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'source_added' | 'todo_created' | 'decision_made' | 'comment_added' | 'stock_added';
  description: string;
  createdAt: string;
  userId: string;
  user?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
