import { BellIcon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import {Moon, Sun } from "lucide-react";

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const DashboardHeader = ({ user, profile , notificationCount }: { user: any, profile: any , notificationCount: number }) => {
    const { theme , toggleTheme } = useTheme();

    return ( 

     <div className="flex  flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold dark:text-amber-50 text-gray-800">{getGreeting()}, {profile?.first_name || user?.username || 'Guest'}!</h1>
            <p className="text-md dark:text-gray-300 text-gray-500">{getCurrentDate()}</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
                onClick={toggleTheme}
                className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
            </button>
            <button className="relative p-3 rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors">
                <BellIcon className="w-6 h-6 text-gray-600" />
                {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">
                            {notificationCount}
                        </span>
                    </span>
                )}
            </button>
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white shadow-sm">
                {profile?.avatar_url ? 
                    <img src={profile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" /> :
                    <span className="flex items-center justify-center h-full w-full bg-blue-500 text-white font-bold text-lg">
                        {(profile?.first_name?.[0] || user?.username?.[0] || 'G').toUpperCase()}
                    </span>
                }
            </div>
        </div>
    </div>
);

}

export default DashboardHeader ;
   