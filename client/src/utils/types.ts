export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'mentor' | 'mentee';
}

export interface Session {
  id: string;
  mentorName: string;
  title: string;
  time: string;
  type: 'completed' | 'scheduled' | 'review';
  rating?: number;
}

export interface Stats {
  activeMentors: {
    current: number;
    total: number;
  };
  completedSessions: number;
  averageSessionDuration: string;
  rating: number;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}

export interface Mentor {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  company: string;
  rating: number;
  reviewCount: number;
  avatar_url: string;
  skills: string[];
  experience: string;
  availability: 'available' | 'busy' | 'offline';
  bio: string;
}

export interface Connection {
  id: string;
  name: string;
  role: 'mentor' | 'mentee';
  avatar: string;
  status: 'connected' | 'pending' | 'requested';
  lastActive: string;
  sessionsCount: number;
  rating?: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  mentorName: string;
  date: string;
  time: string;
  duration: number;
  type: 'session' | 'meeting' | 'review';
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface Feedback {
  id: string;
  mentorName: string;
  mentorAvatar: string;
  sessionTitle: string;
  rating: number;
  comment: string;
  date: string;
  response?: string;
}