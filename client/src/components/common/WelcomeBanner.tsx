import { useNavigate } from 'react-router-dom';

const formatSessionTime = (isoString: string): string => {

    const date = new Date(isoString);
 
    return date.toLocaleString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit' 
    });
};


const WelcomeBanner = ({ name , session }: { name: string , session:any }) => {

    const navigate = useNavigate(); 

    return (
    <div className="relative rounded-2xl p-8 text-white overflow-hidden bg-gradient-to-br dark:from-blue-900 dark:to-blue-950 from-blue-600 to-blue-800 shadow-lg">
        <div className="relative z-10">
            <h2 className="text-3xl font-bold">Welcome back, {name}!</h2>
        {session ? (

            <div>
                <p className="text-blue-100 max-w-md mt-2">
                    Your next session, "{session.title}," with {session.withUser.name} is scheduled for {formatSessionTime(session.startTime)}.
                </p>
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white shadow-sm">
                {session?.avatar_url ? (    
                    <img 
                        src={session.avatar_url} 
                        alt="User Avatar" 
                        className="w-full h-full object-cover" 
                    />
                ) : (
                    <span></span>
                )}
            </div>

            </div>
            
        ) : (
            <p className="text-blue-100 max-w-md mt-2">
                You have no upcoming sessions. Ready to schedule one?
            </p>
        )}
        </div>
        <div className="relative z-10 mt-6 flex gap-4">
            <button className="bg-white dark:text-blue-950 text-blue-800 font-semibold py-2 px-5 rounded-lg hover:bg-opacity-90 transition-all transform hover:scale-105 shadow"
            onClick={()=>{navigate('/connections')}}>
                Go to Connections
            </button>
            <button className="bg-blue-500/50 dark:bg-blue-400/30 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-500/80 transition-all transform hover:scale-105"
            onClick={()=>{navigate('/messages')}}>
                Go to Messages
            </button>
        </div>
    </div>
);
}
export default WelcomeBanner