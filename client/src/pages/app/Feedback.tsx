import React, { useState, useEffect, useMemo } from 'react';
import { Star, MessageSquare, ThumbsUp, Calendar, Filter } from 'lucide-react';
import api from '@/utils/axios';
import { useAuth } from '@/hooks/AuthContext';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// --- Type Definition ---
interface Feedback {
    id: number;
    rating: number;
    comment: string;
    date: string;
    sessionTitle: string;
    type: 'given' | 'received';
    participantName: string;
    participantAvatar: string | null;
}

// --- Skeleton Loader ---
const FeedbackSkeleton = () => (
    <div className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0 animate-pulse">
        <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                    <div className="space-y-2">
                        <div className="h-5 w-32 bg-gray-200 rounded"></div>
                        <div className="h-4 w-48 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </div>
        </div>
    </div>
);


export default function Feedbacks() {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'given' | 'received'>('all');

    useEffect(() => {
        const fetchFeedbacks = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const response = await api.get('/feedbacks', {
                    params: { filter }
                });
                setFeedbacks(response.data);
            } catch (error) {
                console.error("Failed to fetch feedbacks:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedbacks();
    }, [user, filter]);

    const renderStars = (rating: number) => {
        return [...Array(5)].map((_, index) => (
            <Star key={index} size={16} className={`${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
        ));
    };

    const stats = useMemo(() => {
        const receivedFeedbacks = feedbacks.filter(f => f.type === 'received');
        const averageRating = receivedFeedbacks.length > 0
            ? receivedFeedbacks.reduce((sum, f) => sum + f.rating, 0) / receivedFeedbacks.length
            : 0;
        
        return {
            total: feedbacks.length,
            averageRating: averageRating.toFixed(1),
            fiveStarCount: receivedFeedbacks.filter(f => f.rating === 5).length,
            thisMonthCount: feedbacks.filter(f => new Date(f.date).getMonth() === new Date().getMonth()).length,
        };
    }, [feedbacks]);

    const ratingDistribution = useMemo(() => {
        const receivedFeedbacks = feedbacks.filter(f => f.type === 'received');
        return [5, 4, 3, 2, 1].map(rating => {
            const count = receivedFeedbacks.filter(f => f.rating === rating).length;
            const percentage = receivedFeedbacks.length > 0 ? (count / receivedFeedbacks.length) * 100 : 0;
            return { rating, count, percentage };
        });
    }, [feedbacks]);

    return (
        <div className="space-y-6 font-sans">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 p-6">
                <h1 className="text-2xl font-bold dark:text-white text-gray-900 mb-2">Feedbacks</h1>
                <p className="dark:text-white text-gray-600">View and manage session feedback and reviews.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Reviews" value={stats.total} icon={<MessageSquare className="text-blue-600" />} />
                <StatCard label="Average Rating" value={stats.averageRating} icon={<Star className="text-yellow-600" />} />
                <StatCard label="5-Star Reviews" value={stats.fiveStarCount} icon={<ThumbsUp className="text-green-600" />} />
                <StatCard label="This Month" value={stats.thisMonthCount} icon={<Calendar className="text-purple-600" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 dark:bg-slate-800 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold dark:text-white text-gray-900">Recent Feedback</h3>
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                            {(['all', 'given', 'received'] as const).map((filterOption) => (
                                <button
                                    key={filterOption}
                                    onClick={() => setFilter(filterOption)}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                        filter === filterOption ? 'dark:bg-slate-800 bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-white/50'
                                    }`}
                                >
                                    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => <FeedbackSkeleton key={i} />)
                        ) : feedbacks.length > 0 ? (
                            feedbacks.map((feedback) => (
                                <div key={feedback.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                                    <div className="flex items-start space-x-4">
                                        <img src={feedback.participantAvatar || `https://i.pravatar.cc/48?u=${feedback.id}`} alt={feedback.participantName} className="w-12 h-12 rounded-full object-cover" />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h4 className="font-semibold dark:text-white dark:text-white text-gray-900">{feedback.participantName}</h4>
                                                    <p className="text-sm dark:text-white text-gray-600">{feedback.sessionTitle}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center space-x-1 mb-1">{renderStars(feedback.rating)}</div>
                                                    <p className="text-sm dark:text-white text-gray-500">{format(new Date(feedback.date), 'MMM d, yyyy')}</p>
                                                </div>
                                            </div>
                                            <p className="dark:text-white text-gray-700">{feedback.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-10 dark:text-white text-gray-500">No feedback to display for this filter.</p>
                        )}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold dark:text-white dark:text-white text-gray-900 mb-4">Rating Distribution</h3>
                    <p className="text-sm text-gray-500 mb-4">Based on feedback you've received.</p>
                    <div className="space-y-3">
                        {ratingDistribution.map(({ rating, count, percentage }) => (
                            <div key={rating} className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1 w-16 text-sm font-medium">
                                    <span>{rating}</span><Star className="text-yellow-400 fill-current" size={14} />
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                    <motion.div
                                        className="bg-yellow-400 h-2.5 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    />
                                </div>
                                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const StatCard = ({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="text-3xl font-bold dark:text-white text-gray-900 mt-1">{value}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
        </div>
    </div>
);
