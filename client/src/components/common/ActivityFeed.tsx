import { Star, Video, MessageSquare, Users, CheckCircle, Clock } from 'lucide-react'; 
import { timeAgo } from '@/utils/utils';

const ActivityFeed = ({ activities }: { activities: any[] }) => {
  
    const renderActivity = (activity: any) => {
        const { actor, type, details, timestamp, id } = activity;
        let icon, text, iconBgClass;

        switch (type) {
            case 'review':
                icon = <Star className="w-4 h-4 text-white" />;
                iconBgClass = 'bg-yellow-400';
                text = <><span className="font-semibold">{actor.name}</span> left a {details.rating}-star review.</>;
                break;
            case 'session':
                icon = <Video className="w-4 h-4 text-white" />;
                iconBgClass = 'bg-green-500';
                text = <><span className="font-semibold">{actor.name}</span> updated the session "{details.title}" to <span className="font-semibold">{details.status}</span>.</>;
                break;
            case 'message':
                icon = <MessageSquare className="w-4 h-4 text-white" />;
                iconBgClass = 'bg-blue-500';
                text = <><span className="font-semibold">{actor.name}</span> sent you a new message.</>;
                break;
            default:
                return null;
        }

        return (
            <div key={`${type}-${id}`} className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${iconBgClass}`}>
                    {icon}
                </div>
                <div className="flex-grow">
                    <p className="text-sm dark:text-white text-gray-700">{text}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(timestamp)}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-sm h-full">
            <h3 className="text-lg font-bold dark:text-white text-gray-800 mb-6">Activity Feed</h3>
            {activities && activities.length > 0 ? (
                <div className="space-y-6">
                    {activities.map(renderActivity)}
                </div>
            ) : (
                <p className="text-sm dark:text-white text-gray-500 text-center py-8">No recent activity to show.</p>
            )}
        </div>
    );
};

export default ActivityFeed ;