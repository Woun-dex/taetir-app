import React, { useState, useEffect } from 'react';
import { Users, Star, Clock, MessageCircle, Calendar, MoreVertical, UserPlus, UserCheck, UserX } from 'lucide-react';
import api from '@/utils/axios'; // Your configured axios instance
import { useNavigate } from 'react-router-dom'; 
import MotionCard from '@/components/common/MotionCard';
import DashboardHeader from '@/components/common/DashboardHeader';// Import useNavigate
import { useAuth } from '@/hooks/AuthContext';

// --- Corrected Type Definition ---
// This interface now matches all possible data structures from your backend API
export interface Connection {
  id: number;
  status: 'pending' | 'accepted' | 'refused' | 'terminated';
  role: 'mentor' | 'mentee';
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  title: string | null;
  sessionsCount: string; // Comes from COUNT(*), which is a string
  detailedStatus: 'accepted' | 'pending' | 'requested' | 'refused' | 'terminated';
}

// --- Skeleton Loader Components ---
const StatCardSkeleton = () => <div className="bg-white p-6 rounded-xl shadow-sm animate-pulse"><div className="h-20 bg-gray-200 rounded-md"></div></div>;
const ConnectionItemSkeleton = () => (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
        <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-200"></div>
            <div>
                <div className="h-5 w-32 bg-gray-200 rounded-md"></div>
                <div className="h-4 w-48 bg-gray-200 rounded-md mt-2"></div>
            </div>
        </div>
        <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
    </div>
);


export default function MyConnections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [ notificationCount , setNotificationCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'mentors' | 'mentees' | 'pending'>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null); // To show loading on specific buttons
  const navigate = useNavigate(); 
  const { user , profile } = useAuth();

  const fetchConnections = async () => {
      setLoading(true);
      try {
        const [ConnectionResponse , notification ] = await Promise.all([
          api.get('/connections').catch(()=> null),
          api.get('/dashboard/unread-count').catch(() => null) 
        ]);

        if (ConnectionResponse) setConnections(ConnectionResponse.data);
        if (notification) setNotificationCount(notification.data);
      } catch (error) {
        console.error("Failed to fetch connections:", error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchConnections();
  }, []);

  // Logic to handle accepting/declining requests
  const handleConnectionUpdate = async (connectionId: number, newStatus: 'accepted' | 'refused') => {
      setUpdatingId(connectionId); // Set loading state for this specific connection
      try {
          // Call the backend endpoint to update the status
          await api.put(`/connections/${connectionId}`, { status: newStatus });
          // Refetch the connections to show the updated list
          fetchConnections(); 
      } catch (error) {
          console.error(`Failed to ${newStatus} connection:`, error);
          // Optionally show an error toast to the user
      } finally {
          setUpdatingId(null); // Clear loading state
      }
  };

  const handleNavigateToMessage = (connection: Connection) => {
    // Navigate to the messages page, passing the connection info in the state
    navigate('/messages', { 
        state: { 
            selectedConnectionId: connection.id,
            participantName: `${connection.first_name} ${connection.last_name}`,
            participantAvatar: connection.avatar_url,
            // You can pass the whole connection object if needed
        } 
    });
  };

  const filteredConnections = connections.filter(connection => {
    switch (activeTab) {
      case 'mentors': return connection.role === 'mentor';
      case 'mentees': return connection.role === 'mentee';
      case 'pending': return connection.detailedStatus === 'pending';
      default: return true;
    }
  });

  const getStatusIcon = (status: string) => ({
    accepted: <UserCheck className="text-green-600" size={16} />,
    pending: <Clock className="text-yellow-600" size={16} />,
    requested: <UserPlus className="text-blue-600" size={16} />,
    refused: <UserX className="text-red-600" size={16} />,
    terminated: <UserX className="text-gray-600" size={16} />,
  }[status] || <Users className="text-gray-600" size={16} />);

  const getStatusText = (status: string) => ({
    accepted: 'Connected',
    pending: 'Pending Your Approval',
    requested: 'Request Sent',
    refused: 'Declined',
    terminated: 'Terminated',
  }[status] || 'Unknown');

  const getStatusColor = (status: string) => ({
    accepted: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    requested: 'bg-blue-100 text-blue-800',
    refused: 'bg-red-100 text-red-800',
    terminated: 'bg-gray-100 text-gray-800',
  }[status] || 'bg-gray-100 text-gray-800');

  const stats = {
    mentors: connections.filter(c => c.role === 'mentor' && c.status === 'accepted').length,
    mentees: connections.filter(c => c.role === 'mentee' && c.status === 'accepted').length,
    pending: connections.filter(c => c.detailedStatus === 'pending').length,
    total: connections.filter( c=> c.detailedStatus !== 'requested' && c.detailedStatus !== 'pending').length  ,
  };

  return (
    <div className=" space-y-6 font-sans">
            
      <MotionCard delay={0}>
                <DashboardHeader user={user} profile={profile} notificationCount={notificationCount} />
        </MotionCard>

      <div className='flex flex-col gap-4'>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />) : (
            <>
                <StatCard label="Total Connections" value={stats.total} icon={<Users className="text-blue-600" />} />
                <StatCard label="Active Mentors" value={stats.mentors} icon={<Star className="text-yellow-600" />} />
                <StatCard label="Active Mentees" value={stats.mentees} icon={<UserPlus className="text-green-600" />} />
                <StatCard label="Pending Requests" value={stats.pending} icon={<Clock className="text-orange-600" />} />
            </>
        )}
      </div>

      {/* Tabs & List */}
      <div className="bg-white dark:bg-slate-700  rounded-xl shadow-sm border dark:border-none border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <TabButton id="all" label="All" count={stats.total} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="mentors" label="Mentors" count={stats.mentors} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="mentees" label="Mentees" count={stats.mentees} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="pending" label="Pending" count={stats.pending} activeTab={activeTab} setActiveTab={setActiveTab} />
          </nav>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {loading ? Array.from({ length: 3 }).map((_, i) => <ConnectionItemSkeleton key={i} />) : 
            filteredConnections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50/70 transition-colors">
                <div className="flex items-center space-x-4">
                  <img src={connection.avatar_url || `https://i.pravatar.cc/48?u=${connection.id}`} alt={`${connection.first_name} ${connection.last_name}`} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h3 className="font-semibold dark:text-white text-gray-900">{connection.first_name} {connection.last_name}</h3>
                    <p className="text-sm dark:text-gray-300 text-gray-600">{connection.title}</p>
                    <div className={`mt-2 flex items-center gap-2 px-2 py-1 text-xs rounded-full w-fit ${getStatusColor(connection.detailedStatus)}`}>
                        {getStatusIcon(connection.detailedStatus)}
                        <span className="font-medium">{getStatusText(connection.detailedStatus)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {connection.detailedStatus === 'accepted' && (
                    <>
                      <button onClick={() => handleNavigateToMessage(connection)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><MessageCircle size={18} /></button>
                      <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Calendar size={18} /></button>
                    </>
                  )}
                  {connection.detailedStatus === 'pending' && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleConnectionUpdate(connection.id, 'accepted')} 
                        disabled={updatingId === connection.id}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-blue-300"
                      >
                        {updatingId === connection.id ? '...' : 'Accept'}
                      </button>
                      <button 
                        onClick={() => handleConnectionUpdate(connection.id, 'refused')} 
                        disabled={updatingId === connection.id}
                        className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"><MoreVertical size={18} /></button>
                </div>
              </div>
            ))}
          </div>
          {!loading && filteredConnections.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No connections to display</h3>
              <p className="text-gray-600">Your connections in this category will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

// --- Helper Components ---
const StatCard = ({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) => (
    <div className="bg-white dark:bg-slate-700 dark:border-0 rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium dark:text-gray-200 text-gray-600">{label}</p>
                <p className="text-3xl font-bold dark:text-white text-gray-900 mt-1">{value}</p>
            </div>
            <div className="p-3 dark:bg-slate-700 bg-gray-50 rounded-lg">
                {icon}
            </div>
        </div>
    </div>
);

const TabButton = ({ id, label, count, activeTab, setActiveTab }: any) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === id
                ? 'border-blue-500 dark:text-blue-300 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-white hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        {label} <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>{count}</span>
    </button>
);
