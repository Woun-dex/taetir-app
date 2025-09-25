import u from "/src/assets/User.png";


export const RECENT_SESSIONS = [
  {
    id: "1",
    mentorName: "MOHAMED",
    title: "Leadership Session",
    time: "2h ago",
    type: "completed" as const,
  },
  {
    id: "2",
    mentorName: "Omar",
    title: "CYBERSECURITY SESSION",
    time: "4h ago",
    type: "scheduled" as const,
  },
  {
    id: "3",
    mentorName: "HASSAN",
    title: "DEVOPS SESSION",
    time: "2 day ago",
    type: "review" as const,
    rating: 5,
  },
];

export const USER_STATS = {
  activeMentors: { current: 2, total: 3 },
  completedSessions: 11,
  averageSessionDuration: "34m",
  rating: 4.2,
};

export const SAMPLE_MENTORS = [
  {
    id: "1",
    name: "MOHAMED",
    title: "Senior Product Manager",
    company: "Google",
    rating: 4.9,
    reviewCount: 127,
    avatar: u,
    skills: ["Product Strategy", "Leadership", "Data Analysis"],
    experience: "8+ years",
    availability: "available" as const,
    bio: "Experienced product manager with a passion for mentoring the next generation of product leaders.",
  },
  {
    id: "2",
    name: "OMAR",
    title: "Tech Lead",
    company: "Microsoft",
    rating: 4.8,
    reviewCount: 89,
    avatar: u,
    skills: ["Software Architecture", "React"],
    experience: "6+ years",
    availability: "busy" as const,
    bio: "Full-stack developer turned tech lead, helping developers grow their technical and leadership skills.",
  },
  {
    id: "3",
    name: "WALID",
    title: "UX Design Director",
    company: "Adobe",
    rating: 4.7,
    reviewCount: 156,
    avatar: u,
    skills: ["User Research", "Design Systems", "Prototyping"],
    experience: "10+ years",
    availability: "available" as const,
    bio: "Design leader passionate about creating user-centered experiences and mentoring design talent.",
  },
];

export const SAMPLE_CONNECTIONS = [
  {
    id: "1",
    name: "Mohamed",
    role: "mentor" as const,
    avatar: u,
    status: "connected" as const,
    lastActive: "2 hours ago",
    sessionsCount: 8,
    rating: 4.9,
  },
  {
    id: "2",
    name: "OMAR",
    role: "mentor" as const,
    avatar: u,
    status: "connected" as const,
    lastActive: "1 day ago",
    sessionsCount: 3,
    rating: 4.8,
  },
  {
    id: "3",
    name: " Khaled",
    role: "mentee" as const,
    avatar: u,
    status: "pending" as const,
    lastActive: "5 minutes ago",
    sessionsCount: 0,
  },
];

export const SAMPLE_CONVERSATIONS = [
  {
    id: "1",
    participantName: "MOHAMED",
    participantAvatar: u,
    lastMessage: "Great session today! Let's schedule our next meeting.",
    timestamp: "2 hours ago",
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "2",
    participantName: "OMAR",
    participantAvatar: u,
    lastMessage: "I've shared the resources we discussed.",
    timestamp: "1 day ago",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "3",
    participantName: "Hassan",
    participantAvatar: u,
    lastMessage: "Looking forward to our design review session!",
    timestamp: "3 days ago",
    unreadCount: 1,
    isOnline: true,
  },
];

export const SAMPLE_CALENDAR_EVENTS = [
  {
    id: "1",
    title: "DEVELOPMENT SESSION",
    mentorName: "YOUSSEF",
    date: "2025-01-15",
    time: "14:00",
    duration: 60,
    type: "session" as const,
    status: "confirmed" as const,
  },
  {
    id: "2",
    title: "Code Review Meeting",
    mentorName: "Omar",
    date: "2025-01-16",
    time: "10:30",
    duration: 45,
    type: "meeting" as const,
    status: "pending" as const,
  },
  {
    id: "3",
    title: "Design Feedback Session",
    mentorName: "WALID",
    date: "2025-01-17",
    time: "16:00",
    duration: 90,
    type: "review" as const,
    status: "confirmed" as const,
  },
];

export const SAMPLE_FEEDBACKS = [
  {
    id: "1",
    mentorName: "YOUSSEF",
    mentorAvatar: u,
    sessionTitle: "DEVELOPMENT SESSION",
    rating: 5,
    comment: "Excellent session!.",
    date: "2025-01-10",
    response:
      "Thank you for the feedback! I'm glad our session was helpful. Keep applying those strategies!",
  },
  {
    id: "2",
    mentorName: "Omar",
    mentorAvatar: u,
    sessionTitle: "React Architecture Review",
    rating: 5,
    comment:
      "Omar's technical expertise is outstanding. He helped me refactor my code and taught me best practices.",
    date: "2025-01-08",
  },
  {
    id: "3",
    mentorName: "WALID",
    mentorAvatar: u,
    sessionTitle: "UX Design Principles",
    rating: 4,
    comment:
      "Great introduction to design systems. Would love more hands-on exercises in future sessions.",
    date: "2025-01-05",
    response:
      "Thanks for the suggestion! I'll include more practical exercises in our next session.",
  },
];