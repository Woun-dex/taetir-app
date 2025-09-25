import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, User, MapPin, X, Star } from 'lucide-react';
import api from '@/utils/axios';
import { useAuth } from '@/hooks/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { isToday, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// --- Type Definitions ---
interface CalendarEvent {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    format: 'virtual' | 'in_person';
    participantName: string;
    hasReviewed: boolean; 
    meet_link?: string | null;
}

interface Connection {
    connectionId: number;
    participantName: string;
}

// --- Helper Functions ---
const getEventColor = (title: string) => {
    const colors = [
        'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700',
        'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-700',
        'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700',
        'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700',
        'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/50 dark:text-pink-200 dark:border-pink-700',
        'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/50 dark:text-indigo-200 dark:border-indigo-700',
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

// --- Modal Components ---

const NewSessionModal = ({ connections, onClose, onSessionCreated }: { connections: Connection[], onClose: () => void, onSessionCreated: () => void }) => {
    const [formData, setFormData] = useState({
        connectionId: '',
        title: '',
        objectives: '',
        date: '',
        startTime: '',
        endTime: '',
        format: 'virtual' as 'virtual' | 'in_person',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
            const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

            if (endDateTime <= startDateTime) {
                setError("End time must be after start time.");
                setIsSubmitting(false);
                return;
            }

            await api.post('/sessions', {
                ...formData,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
            });
            onSessionCreated();
            onClose();
        } catch (error: any) {
            console.error("Failed to create session:", error);
            setError(error.response?.data?.message || "Failed to create session.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg"
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b dark:border-slate-700">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Schedule a New Session</h2>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <input type="text" placeholder="Session Title (e.g., React Hooks Deep Dive)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <select value={formData.connectionId} onChange={e => setFormData({...formData, connectionId: e.target.value})} required className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="">Select a Connection</option>
                            {connections.map(c => <option key={c.connectionId} value={c.connectionId}>{c.participantName}</option>)}
                        </select>
                        <textarea placeholder="Objectives for the session..." value={formData.objectives} onChange={e => setFormData({...formData, objectives: e.target.value})} className="w-full p-2 border rounded-md min-h-[80px] bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"></textarea>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="p-2 border rounded-md bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} required className="p-2 border rounded-md bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} required className="p-2 border rounded-md bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>
                        <select value={formData.format} onChange={e => setFormData({...formData, format: e.target.value as any})} required className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="virtual">Virtual</option>
                            <option value="in_person">In-Person</option>
                        </select>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 border dark:border-slate-600 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold disabled:bg-blue-400 dark:disabled:bg-blue-800 hover:bg-blue-700 transition-colors">
                            {isSubmitting ? 'Scheduling...' : 'Schedule Session'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const ReviewModal = ({ session, onClose, onReviewSubmitted }: { session: CalendarEvent, onClose: () => void, onReviewSubmitted: () => void }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/reviews', { 
                sessionId: session.id, 
                rating, 
                comment 
            });
            onReviewSubmitted();
            onClose();
        } catch (error: any) {
            console.error("Failed to submit review:", error);
            alert(error.response?.data?.message || "Failed to submit review.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md"
            >
                <div className="p-6 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Leave a Review</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">How was your session "{session.title}"?</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex justify-center space-x-2">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={32}
                                className={`cursor-pointer transition-colors ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-slate-600 hover:text-yellow-200'}`}
                                onClick={() => setRating(i + 1)}
                            />
                        ))}
                    </div>
                    <textarea
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-2 border rounded-md min-h-[100px] bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                </div>
                <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 border dark:border-slate-600 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">Skip</button>
                    <button onClick={handleSubmit} disabled={isSubmitting || rating === 0} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold disabled:bg-blue-400 dark:disabled:bg-blue-800 hover:bg-blue-700 transition-colors">
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// --- Upcoming Events Component ---
const UpcomingEvents = ({ events, onUpdateStatus, onReview }: { events: CalendarEvent[], onUpdateStatus: (id: number, status: 'completed' | 'cancelled') => void, onReview: (session: CalendarEvent) => void }) => {
    const getStatusColor = (status: string) => ({
        scheduled: "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700",
        completed: "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700",
        cancelled: "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700",
    }[status] || "border-gray-300 bg-gray-50 dark:bg-slate-700 dark:border-slate-600");

    const navigate = useNavigate();
    const [joiningId, setJoiningId] = useState<number | null>(null);
    const now = new Date();

    const handleJoinSession = async (event: CalendarEvent) => {
        setJoiningId(event.id);
        try {
            if (event.meet_link) {
                window.open(event.meet_link, '_blank');
                return;
            }
            
            // FIX: Call the correct endpoint
            const response = await api.post(`/sessions/${event.id}/meetLink`);
            const { meetLink } = response.data;
            
            if (meetLink) {
                window.open(meetLink, '_blank');
            } else {
                alert("Could not generate a Google Meet link.");
            }
        } catch (error) {
            console.error("Failed to join session:", error);
            alert("An error occurred while creating the session link.");
        } finally {
            setJoiningId(null);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Upcoming & Recent Events</h3>
            <div className="space-y-4">
                {events.length > 0 ? events.map(event => {
                    const startTime = new Date(event.startTime);
                    const endTime = new Date(event.endTime);
                    const isJoinable = now >= new Date(startTime.getTime() - 30 * 60 * 1000) && now <= endTime;
                    const isCompletable = now > endTime && event.status === 'scheduled';
                    const isCancellable = now < startTime && event.status === 'scheduled';

                    return (
                        <div key={event.id} className={`p-4 rounded-xl border-l-4 ${getStatusColor(event.status)}`}>
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <h4 className={`font-medium text-gray-900 dark:text-gray-100 ${event.status === 'cancelled' && 'line-through'}`}>{event.title}</h4>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1.5"><User size={14} /> {event.participantName}</div>
                                        <div className="flex items-center gap-1.5"><Clock size={14} /> {format(startTime, 'p')}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                    {isJoinable && (
                                        <button 
                                            onClick={() => handleJoinSession(event)} 
                                            disabled={joiningId === event.id}
                                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                                        >
                                            {joiningId === event.id ? 'Joining...' : 'Join'}
                                        </button>
                                    )}
                                    {isCompletable && <button onClick={() => { onUpdateStatus(event.id, 'completed'); onReview(event); }} className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Mark as Completed</button>}
                                    {isCancellable && <button onClick={() => onUpdateStatus(event.id, 'cancelled')} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"><X size={16} /></button>}
                                    {event.status === 'completed' && !event.hasReviewed && <button onClick={() => onReview(event)} className="px-3 py-1 text-sm bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600">Leave Review</button>}
                                    {event.status === 'completed' && event.hasReviewed && <span className="px-3 py-1 text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-lg font-medium">Reviewed</span>}
                                    {event.status === 'cancelled' && <span className="px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-lg font-medium">Cancelled</span>}
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No events scheduled for this month.</p>
                )}
            </div>
        </div>
    );
};


// --- Main Calendar Component ---
export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [reviewSession, setReviewSession] = useState<CalendarEvent | null>(null);

    const fetchEvents = async (date: Date) => {
        setLoading(true);
        try {
            const response = await api.get('/sessions', {
                params: { year: date.getFullYear(), month: date.getMonth() + 1 },
            });
            setEvents(response.data);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchConnections = async () => {
        try {
            const response = await api.get('/connections');
            const formattedConnections = response.data
                .filter((c: any) => c.status === 'accepted')
                .map((c: any) => ({
                    connectionId: c.id,
                    participantName: `${c.first_name} ${c.last_name}`
                }));
            setConnections(formattedConnections);
        } catch (error) {
            console.error("Failed to fetch connections:", error);
        }
    };

    const handleUpdateStatus = async (sessionId: number, status: 'completed' | 'cancelled') => {
        try {
            await api.put(`/sessions/${sessionId}/status`, { status });
            fetchEvents(currentDate);
        } catch (error) {
            console.error(`Failed to mark session as ${status}:`, error);
        }
    };

    useEffect(() => {
        fetchEvents(currentDate);
    }, [currentDate]);

    useEffect(() => {
        fetchConnections();
    }, []);
    
    const listEvents = useMemo(() => {
        return events
            .filter(event => new Date(event.endTime) > new Date(Date.now() - 24 * 60 * 60 * 1000) || event.status === 'scheduled')
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [events]);

    const daysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
        for (let day = 1; day <= lastDay.getDate(); day++) days.push(new Date(year, month, day));
        return days;
    };

    const navigateMonth = (direction: "prev" | "next") => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(1);
            newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
            return newDate;
        });
    };

    const days = daysInMonth(currentDate);

    return (
        <div className="space-y-6 font-sans">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 p-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Calendar</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track and schedule your mentorship sessions.</p>
                </div>
                <button onClick={() => setShowSessionModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
                    <Plus size={18} /><span>New Session</span>
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigateMonth("prev")} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"><ChevronLeft size={20} /></button>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 w-48 text-center">{format(currentDate, 'MMMM yyyy')}</h2>
                    <button onClick={() => navigateMonth("next")} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-sm">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-gray-500 dark:text-gray-400 font-medium py-2">{day}</div>
                ))}
                {days.map((day, index) => (
                    <div key={index} className={`min-h-[120px] p-2 border dark:border-slate-700 rounded-lg ${day ? "bg-white dark:bg-slate-800" : "bg-gray-50/50 dark:bg-slate-800/50"}`}>
                        {day && (
                            <>
                                <div className={`font-semibold mb-1 ${isToday(day) ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-800 dark:text-gray-200'}`}>{day.getDate()}</div>
                                <div className="space-y-1">
                                    {events.filter(e => new Date(e.startTime).toDateString() === day.toDateString()).map(event => (
                                        <div key={event.id} className={`group relative p-1.5 rounded text-xs truncate font-medium border ${getEventColor(event.title)} ${event.status === 'cancelled' && 'opacity-50'}`} title={`${event.title} with ${event.participantName}`}>
                                            <span className={`${event.status === 'cancelled' && 'line-through'}`}>{format(new Date(event.startTime), 'p')} {event.title}</span>
                                            {new Date() < new Date(event.startTime) && event.status === 'scheduled' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(event.id, 'cancelled')} 
                                                    className="absolute top-1 right-1 p-0.5 bg-white/50 dark:bg-slate-600/50 rounded-full text-gray-500 dark:text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-red-500 dark:hover:bg-slate-500 transition-opacity"
                                                    aria-label="Cancel session"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            
            <UpcomingEvents events={listEvents} onUpdateStatus={handleUpdateStatus} onReview={setReviewSession} />
            
            <AnimatePresence>
                {showSessionModal && <NewSessionModal connections={connections} onClose={() => setShowSessionModal(false)} onSessionCreated={() => fetchEvents(currentDate)} />}
                {reviewSession && <ReviewModal session={reviewSession} onClose={() => setReviewSession(null)} onReviewSubmitted={() => fetchEvents(currentDate)} />}
            </AnimatePresence>
        </div>
    );
}
