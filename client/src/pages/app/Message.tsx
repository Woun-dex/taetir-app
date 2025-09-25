import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Phone, MoreVertical, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/AuthContext';
import api from '@/utils/axios';
import io, { Socket } from 'socket.io-client';
import { format, isToday, isYesterday } from 'date-fns';
import MotionCard from '@/components/common/MotionCard';
import DashboardHeader from '@/components/common/DashboardHeader';

// --- Type Definitions ---
interface Conversation {
    connectionId: number;
    participantId: number;
    participantName: string;
    participantAvatar: string | null;
    lastMessage: string | null;
    timestamp: string | null;
    unreadCount: string; // Comes from COUNT(*), which is a string
    isOnline?: boolean;
}

interface Message {
    id: number;
    content: string;
    timestamp: string;
    senderId: number;
    senderName: string;
    senderAvatar: string | null;
}

// --- Main Component ---
export default function MessagesPage() {
    const { user , profile } = useAuth();
    const socket = useRef<Socket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState("");
    const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [notificationCount, setNotificationCount ] = useState<number>(0)

    // --- Socket.io and Data Fetching Effects ---
    useEffect(() => {
        if (user) {
            socket.current = io("http://localhost:5000");
             
            socket.current.emit('add-user', user.id);

            socket.current.on('online-users', (users: number[]) => setOnlineUsers(users));

            socket.current.on('receive-message', (newMessage: any) => {
                if (selectedConversation && newMessage.connectionId === selectedConversation.connectionId) {
                    setMessages(prev => [...prev, { ...newMessage, id: Date.now(), senderId: newMessage.from }]);
                }
                // Always refresh the conversation list to show the new message preview and update order
                fetchConversations();
            });
        }
        return () => {
            socket.current?.disconnect();
        };
    }, [user, selectedConversation]);

    const fetchConversations = async () => {
        try {
             const [response , notification] = await Promise.all([

          api.get('/conversations/').catch(()=>null),
          api.get('/dashboard/unread-count').catch(() => null) 
        ])
        if ( response ) setConversations(response.data);
        if ( notification) setNotificationCount(notification.data);
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        } finally {
            setLoadingConversations(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (selectedConversation) {
                setLoadingMessages(true);
                try {
                    const response = await api.get(`/conversations/${selectedConversation.connectionId}/messages`);
                    setMessages(response.data);
                    // After fetching, the unread count is now 0, so update the sidebar
                    fetchConversations();
                } catch (error) {
                    console.error("Failed to fetch messages:", error);
                } finally {
                    setLoadingMessages(false);
                }
            }
        };
        fetchMessages();
    }, [selectedConversation]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (messageText.trim() && selectedConversation && user) {
            const tempMessage: Message = {
                id: Date.now(), // Temporary ID for UI key
                content: messageText,
                timestamp: new Date().toISOString(),
                senderId: Number(user.id),
                senderName: "You",
                senderAvatar: null 
            };
            
            setMessages(prev => [...prev, tempMessage]);
            const currentMessage = messageText;
            setMessageText("");

            try {
                // Persist message to DB
                await api.post('/conversations/message', {
                    connectionId: selectedConversation.connectionId,
                    content: currentMessage,
                });

                // Send via socket for real-time delivery
                socket.current?.emit('send-message', {
                    to: selectedConversation.participantId,
                    from: user.id,
                    content: currentMessage,
                    connectionId: selectedConversation.connectionId,
                });

                fetchConversations();
            } catch (error) {
                console.error("Failed to send message:", error);
                setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
                setMessageText(currentMessage);
            }
        }
    };

    const updatedConversations = conversations.map(c => ({
        ...c,
        isOnline: onlineUsers.includes(c.participantId)
    }));

    return (
        <div>
            <MotionCard delay={0}>
                <DashboardHeader user={user} profile={profile} notificationCount={notificationCount} />
        </MotionCard>

        
        <div className="h-[calc(100vh-120px)] flex dark:bg-slate-800 dark:border-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden font-sans">
            <div className="w-full md:w-[350px] border-r dark:border-gray-600 border-gray-200 flex flex-col">
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold dark:text-white text-gray-900">Messages</h1>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loadingConversations ? (
                        Array.from({length: 5}).map((_, i) => <ConversationSkeleton key={i} />)
                    ) : (
                        updatedConversations.map((conv) => (
                            <ConversationItem
                                key={conv.connectionId}
                                conversation={conv}
                                isSelected={selectedConversation?.connectionId === conv.connectionId}
                                onClick={() => setSelectedConversation(conv)}
                            />
                        ))
                    )}
                </div>
            </div>

            {selectedConversation ? (
                <div className="flex-1 flex flex-col dark:bg-slate-800 bg-gray-50">
                    <ChatHeader conversation={updatedConversations.find(c => c.connectionId === selectedConversation.connectionId)} />
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {loadingMessages ? <div>Loading messages...</div> : messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} isMe={msg.senderId === Number(user?.id)} />
                        ))}
                        <div ref={scrollRef} />
                    </div>
                    <MessageInput
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onSend={handleSendMessage}
                    />
                </div>
            ) : (
                <div className="flex-1 hidden md:flex items-center justify-center text-center text-gray-500 p-8">
                    <div>
                        <MessageCircle size={48} className="mx-auto text-gray-300" />
                        <h3 className="mt-4 text-lg font-medium text-gray-800">Select a conversation</h3>
                        <p className="mt-1 text-sm text-gray-500">Choose from your existing conversations to start chatting.</p>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
}

// --- Helper: Format Timestamp ---
const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, 'p');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
};

// --- Sub-components for better structure ---
const ConversationSkeleton = () => (
    <div className="p-4 flex items-start space-x-4 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
    </div>
);

const ConversationItem = ({ conversation, isSelected, onClick }: { conversation: Conversation, isSelected: boolean, onClick: () => void }) => (
    <div onClick={onClick} className={`p-4 flex items-start space-x-4 cursor-pointer border-b dark:border-gray-700 border-gray-100 transition-colors ${isSelected ? 'dark:bg-slate-900 bg-blue-50' : 'dark:hover:bg-gray-950 hover:bg-gray-50'}`}>
        <div className="relative flex-shrink-0">
            <img src={conversation.participantAvatar || `https://i.pravatar.cc/48?u=${conversation.participantId}`} alt={conversation.participantName} className="w-12 h-12 rounded-full object-cover" />
            {conversation.isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
                <p className="font-semibold dark:text-white text-gray-800 truncate">{conversation.participantName}</p>
                <p className="text-xs dark:text-gray-200 text-gray-400 flex-shrink-0">{formatTimestamp(conversation.timestamp)}</p>
            </div>
            <div className="flex justify-between items-center mt-1">
                <p className={`text-sm truncate dark:text-gray-200 ${Number(conversation.unreadCount) > 0 ? 'text-gray-800  font-semibold' : 'text-gray-500'}`}>{conversation.lastMessage || 'No messages yet'}</p>
                {Number(conversation.unreadCount) > 0 && <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">{conversation.unreadCount}</div>}
            </div>
        </div>
    </div>
);

const ChatHeader = ({ conversation }: { conversation?: Conversation }) => {
    if (!conversation) return null;
    return (
        <div className="p-4 border-b dark:bg-slate-800 border-gray-200 flex items-center justify-between bg-white shadow-sm">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <img src={conversation.participantAvatar || `https://i.pravatar.cc/48?u=${conversation.participantId}`} alt={conversation.participantName} className="w-10 h-10 rounded-full object-cover" />
                    {conversation.isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>}
                </div>
                <div>
                    <h3 className="font-semibold dark:text-white text-gray-900">{conversation.participantName}</h3>
                    <p className={`text-sm ${conversation.isOnline ? 'text-green-600' : 'text-gray-500'}`}>{conversation.isOnline ? "Online" : "Offline"}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Phone size={20} /></button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><MoreVertical size={20} /></button>
            </div>
        </div>
    );
};

const MessageBubble = ({ message, isMe }: { message: Message, isMe: boolean }) => (
    <div className={`flex items-end gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && <img src={message.senderAvatar || `https://i.pravatar.cc/48?u=${message.senderId}`} alt={message.senderName} className="w-8 h-8 rounded-full object-cover self-start" />}
        <div className={`max-w-lg p-3 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-white dark:bg-slate-600 dark:text-white text-gray-800 rounded-bl-lg shadow-sm'}`}>
            <p className="text-sm">{message.content}</p>
            <p className={`text-xs mt-1.5 ${isMe ? 'text-blue-100' : 'dark:text-white text-gray-500'} text-right`}>{format(new Date(message.timestamp), 'p')}</p>
        </div>
    </div>
);

const MessageInput = ({ value, onChange, onSend }: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onSend: () => void }) => (
    <div className="p-4 border-t dark:bg-slate-800 dark:border-gray-600 border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
            <input
                type="text"
                placeholder="Type a message..."
                value={value}
                onChange={onChange}
                onKeyPress={(e) => e.key === "Enter" && onSend()}
                className="w-full px-4 py-2 dark:text-white dark:bg-slate-600 bg-gray-100 border-transparent rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            />
            <button onClick={onSend} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex-shrink-0 shadow-sm">
                <Send size={20} />
            </button>
        </div>
    </div>
);