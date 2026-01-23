// Type Definitions for OpenPoints Application
export interface User {
  _id: string;
  id?: string;
  name: string;          // ✅ REQUIRED (matches backend)
  username?: string;     // optional fallback
  email?: string;
  role?: string;
}

export interface TeamMember {
  _id: string;
  username: string;
  role: string;
  user?: User;
}

export interface ProjectStats {
  total: number;
  red: number;
  yellow: number;
  orange: number;
  green: number;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  owner?: User | string;
  team_members?: TeamMember[];
  stats?: ProjectStats;
  myStats?: ProjectStats;
}

export interface OpenPoint {
  _id: string;
  title: string;
  responsibility?: string;
  responsible_person?: string | User;
  level: string;
  gap_action?: string;
  target_date?: string;
  status: string;
  review_date?: string;
  remarks?: string;
  priority: string;
  project_id?: string;
  owner?: string | User;
  reviewer?: string;
}

export interface NewPoint {
  title: string;
  responsibility: string;
  level: string;
  gap_action: string;
  target_date: string;
  status: string;
  review_date: string;
  remarks: string;
  priority: string;
}

export interface DialogConfig {
  open: boolean;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'confirm';
  onConfirm?: () => void | null;
}

export interface Filters {
  status: string;
  priority: string;
  responsibility: string;
}

export interface AnalyticsStats {
  _id: string;
  count: number;
}

export interface Summary {
  name: string;
  total: number;
  green: number;
  yellow: number;
  red: number;
  orange: number;
}