import React, { useState, useEffect } from 'react';
import {
  Search,
  Star,
  Users,
  X,
  Send
} from 'lucide-react';
import api from '@/utils/axios'; // Your configured axios instance
import type { Mentor } from "@/utils/types"; // Assuming you have a Mentor type
import { motion, AnimatePresence } from 'framer-motion';
import MotionCard from '@/components/common/MotionCard';
import { useAuth } from '@/hooks/AuthContext';
import DashboardHeader from '@/components/common/DashboardHeader';

// --- API Service Function ---
// This function calls the backend endpoint to create a new connection request.
const sendConnectionRequest = async (mentorId: number, message: string) => {
    const response = await api.post('/connections', { mentorId, message });
    return response.data;
};

// --- Connection Request Modal Component ---
const ConnectionRequestModal = ({ mentor, onClose, onSend }: { mentor: Mentor, onClose: () => void, onSend: (message: string) => void }) => {
    const [message, setMessage] = useState(`Hi ${mentor.first_name}, I'd like to connect with you regarding your experience in [mention a skill or topic].`);
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async () => {
        setIsSending(true);
        try {
            await onSend(message);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            >
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Send Connection Request</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <img src={mentor.avatar_url || `https://i.pravatar.cc/48?u=${mentor.id}`} alt={mentor.first_name} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                            <h3 className="font-semibold text-gray-900">{mentor.first_name} {mentor.last_name}</h3>
                            <p className="text-sm text-gray-600">{mentor.title}</p>
                        </div>
                    </div>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Include a personal message..."
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    />
                </div>
                <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end">
                    <button 
                        onClick={handleSubmit} 
                        disabled={isSending}
                        className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-blue-300"
                    >
                        <Send size={16} />
                        <span>{isSending ? 'Sending...' : 'Send Request'}</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};


// --- Main FindMentors Component ---
export default function FindMentors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All Skills");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount ] = useState<number>(0)
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const { user , profile } = useAuth();

  const skills = ["All Skills", "Product Strategy", "Leadership", "Software Architecture", "UX Design", "Data Analysis"];

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      try {
        const [response , notification] = await Promise.all([

          api.get('/mentors', { params: { search: searchTerm, skill: selectedSkill } }).catch(()=>null),
          api.get('/dashboard/unread-count').catch(() => null) 
        ])
        if ( response ) setMentors(response.data);
        if ( notification) setNotificationCount(notification.data);

      } catch (error) {
        console.error("Failed to fetch mentors:", error);
        setMentors([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => fetchMentors(), 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedSkill]);

  const handleSendRequest = async (message: string) => {
    if (!selectedMentor) return;
    try {
        await sendConnectionRequest(Number(selectedMentor.id), message);
        alert(`Connection request sent to ${selectedMentor.first_name}!`);
        setSelectedMentor(null); 
    } catch (error: any) {
        console.error("Failed to send connection request:", error);
        alert(`Error: ${error.response?.data?.message || 'Could not send request.'}`);
    }
  };

  return (
    <div className="space-y-6 font-sans">

      <MotionCard delay={0}>
                <DashboardHeader user={user} profile={profile} notificationCount={notificationCount} />
        </MotionCard>

      <div className="bg-white dark:bg-slate-700 dark:border-0 rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 dark: text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search mentors by name, title, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border dark:text-white dark:border-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-slate-700 dark:text-white dark:border-gray-500 bg-white"
          >
            {skills.map((skill) => (<option key={skill} value={skill}>{skill}</option>))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
            Array.from({ length: 6 }).map((_, index) => <MentorCardSkeleton key={index} />)
        ) : mentors.length > 0 ? (
            mentors.map((mentor) => (
                <div key={mentor.id} className="bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-start space-x-4">
                        <img src={mentor.avatar_url || `https://i.pravatar.cc/48?u=${mentor.id}`} alt={mentor.first_name} className="w-12 h-12 rounded-full object-cover" />
                        <div className="flex-1">
                            <h3 className="font-semibold dark:text-white text-gray-900">{mentor.first_name} {mentor.last_name}</h3>
                            <p className="text-sm dark:text-gray-300 text-gray-600">{mentor.title}</p>
                        </div>
                    </div>
                    <p className="text-sm dark:text-gray-300 text-gray-600 my-4 line-clamp-2 flex-grow">{mentor.bio}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {mentor.skills?.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">{skill}</span>
                        ))}
                    </div>
                    <button onClick={() => setSelectedMentor(mentor)} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold">Connect</button>
                </div>
            ))
        ) : (
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedMentor && (
            <ConnectionRequestModal 
                mentor={selectedMentor} 
                onClose={() => setSelectedMentor(null)} 
                onSend={handleSendRequest}
            />
        )}
      </AnimatePresence>
    </div>
  );
}

// A simple skeleton loader for the mentor cards
const MentorCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded-md"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded-md"></div>
            </div>
        </div>
        <div className="h-4 w-full bg-gray-200 rounded-md mt-4"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded-md mt-2"></div>
        <div className="h-8 w-full bg-gray-200 rounded-lg mt-6"></div>
    </div>
);
