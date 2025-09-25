import React, { useState } from 'react';
import { NavLink, Outlet, useMatch, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext'; // Assuming this is your auth hook

// --- Icon Imports from Tabler Icons ---
import {
    IconLayoutDashboard,
    IconUsers,
    IconPlugConnected,
    IconMessageCircle,
    IconCalendarEvent,
    IconStar,
    IconUserCircle,
    IconSettings,
    IconLogout,
    IconMenu2,
    IconX
} from '@tabler/icons-react';

// --- Type Definitions ---
type NavItemProps = {
    to: string;
    name: string;
    icon: React.ElementType;
    onClick: () => void;
};

type SidebarProps = {
    isOpen: boolean;
};

type MainContentProps = {
    toggleSidebar: () => void;
};

// --- Single Navigation Item Component ---
// This is the correct way to use hooks with a mapped list.
const NavItem: React.FC<NavItemProps> = ({ to, name, icon: Icon, onClick }) => {
    const match = useMatch({ path: to, end: true });
    const isActive = !!match;


    return (
        <li className="px-4">
            <NavLink
                to={to}
                onClick={onClick}
                className={`flex items-center space-x-3 py-3 px-4 rounded-lg transition-all duration-200 ease-in-out font-medium ${
                    isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-400 hover:bg-blue-500/10 hover:text-blue-600'
                }`}
                style={{ textDecoration: 'none' }}
            >
                <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-white'  :' text-gray-300'} `} />
                <span className={`text-sm ${isActive ? 'text-white'  :' text-gray-300'}`}>{name}</span>
            </NavLink>
        </li>
    );
};

// --- Sidebar Component ---
const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const { user, profile, logout } = useAuth();
    const navigate = useNavigate();
    

    const handleLogout = () => {
        logout();
        navigate('/signin'); // Redirect to sign-in page after logout
    };

    const navItems = [
        { to: '/dashboard', name: 'Dashboard', icon: IconLayoutDashboard },
        { to: '/mentors', name: 'Find Mentors', icon: IconUsers },
        { to: '/connections', name: 'My Connections', icon: IconPlugConnected },
        { to: '/messages', name: 'Messages', icon: IconMessageCircle },
        { to: '/calendar', name: 'Calendar', icon: IconCalendarEvent },
        { to: '/feedbacks', name: 'Feedbacks', icon: IconStar },
    ];

     const navMentor = [
        { to: '/dashboard', name: 'Dashboard', icon: IconLayoutDashboard },
        { to: '/connections', name: 'My Connections', icon: IconPlugConnected },
        { to: '/messages', name: 'Messages', icon: IconMessageCircle },
        { to: '/calendar', name: 'Calendar', icon: IconCalendarEvent },
        { to: '/feedbacks', name: 'Feedbacks', icon: IconStar },
    ];

    const settingsItems = [
        { to: '/profile', name: 'Profile', icon: IconUserCircle },
        { to: '/settings', name: 'Settings', icon: IconSettings },
    ];

    return (
        <aside className={`fixed top-0 left-0 h-full w-64 bg-white  text-gray-800 dark:bg-slate-900 dark:text-white shadow-xl transform z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-y-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">
                <div className="flex items-center h-20 px-6 border-b">
                    <h1 className="text-4xl dark:text-white  font-black mx-auto text-blue-700">TAETIR</h1>
                </div>

                <nav className="flex-grow mt-6">
                    <ul className='space-y-2'>
                        {user?.role === 'mentee'
                            ? navItems.map((item: typeof navItems[number]) => (
                                <NavItem key={item.name} {...item} onClick={() => {}} />
                              ))
                            : navMentor.map((item: typeof navMentor[number]) => (
                                <NavItem key={item.name} {...item} onClick={() => {}} />
                              ))
                        }
                    </ul>
                    <hr className="my-6 border-gray-200" />
                    <ul className='space-y-2'>
                        {settingsItems.map((item: typeof settingsItems[number]) => (
                            <NavItem key={item.name} {...item} onClick={() => {}} />
                        ))}
                    </ul>
                    
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="flex items-center justify-center h-full w-full bg-blue-500 text-white font-bold">
                                    {(profile?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{profile?.first_name || user?.username}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <button onClick={handleLogout} className="p-2 text-gray-400 rounded-md hover:bg-red-50 hover:text-red-500 transition-colors">
                            <IconLogout className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

// --- Main Content Area Component ---
const MainContent: React.FC<MainContentProps> = ({ toggleSidebar }) => {
    return (
        <main className="flex-1  dark:bg-slate-900 overflow-y-auto bg-gray-50">
            {/* Header for mobile toggle */}
            <div className="sticky top-0 dark:bg-slate-900 bg-gray-50/80 backdrop-blur-sm z-10 p-4 border-b lg:hidden">
                 <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-md text-gray-600"
                    aria-label="Toggle sidebar"
                >
                    <IconMenu2 className="w-6 h-6" />
                </button>
            </div>
            <div className="p-4   md:p-8">
                <Outlet />
            </div>
        </main>
    );
};

// --- Main Layout Component ---
const DashboardLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(open => !open);

    return (
        <div className="flex h-screen w-full bg-gray-50 font-sans">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-30 transition-opacity lg:hidden"
                    onClick={toggleSidebar}
                    aria-hidden="true"
                ></div>
            )}
            <Sidebar isOpen={isSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MainContent toggleSidebar={toggleSidebar} />
            </div>
        </div>
    );
};

export default DashboardLayout;
