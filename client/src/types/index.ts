export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'analyst' | 'viewer';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'immediate' | 'high' | 'medium' | 'low';
  dueDate: string | null;
  sourceId: string | null;
  stockId: string | null;
  assigneeId: string | null;
  createdBy: string;
  source?: Source;
  stock?: Stock;
  assignee?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Source {
  id: string;
  title: string;
  url: string | null;
  type: 'article' | 'report' | 'filing' | 'news' | 'analysis' | 'other';
  summary: string | null;
  content: string | null;
  createdBy: string;
  attachments?: Attachment[];
  stocks?: Stock[];
  todos?: Todo[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  sourceId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface Stock {
  id: string;
  ticker: string;
  name: string;
  sector: string | null;
  description: string | null;
  currentPrice: number | null;
  createdBy: string;
  sources?: Source[];
  decisions?: Decision[];
  createdAt: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  stockId: string;
  stock?: Stock;
  decision: 'buy' | 'sell' | 'hold' | 'watching' | 'none';
  targetPrice: number | null;
  notes: string | null;
  confidence: number | null;
  createdBy: string;
  creator?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  sourceId: string | null;
  stockId: string | null;
  parentId: string | null;
  content: string;
  createdBy: string;
  creator?: User;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Analysis {
  id: string;
  stockId: string;
  title: string;
  content: string;
  createdBy: string;
  creator?: User;
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
