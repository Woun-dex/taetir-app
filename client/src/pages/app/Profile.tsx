import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/AuthContext';
import api from '@/utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Camera, MapPin, Star, BookOpen, Users, Clock, X, Briefcase, Target, Globe, Award, GraduationCap, Building, Zap, FeatherIcon } from 'lucide-react';

// --- API Service Function (To be moved to a service file) ---
const updateUserProfile = async (
    profileData: any,
    roleSpecificData: any,
    avatarFile: File | null,
    role: string
) => {
    const formData = new FormData();
    formData.append('profileData', JSON.stringify(profileData));
    formData.append('roleSpecificData', JSON.stringify(roleSpecificData));
    if (avatarFile) {
        formData.append('avatar_file', avatarFile);
    }
    // The backend endpoint should know the role from the authenticated user session
    const response = await api.put('/profile/change', formData);
    return response.data;
};

// --- Type Definitions ---
interface EditableData {
    first_name: string;
    last_name: string;
    title: string;
    location: string;
    bio: string;
    languages: string[];
    avatar_url: string;
    avatar_file?: File | null;
    // Mentee specific
    experience_level: string;
    education: string;
    learning_hours: number;
    learning_objectives: string;
    // Mentor specific
    professional_experience: string;
    company: string;
    skills: string[];
}

// --- Reusable Components ---
const TagInput = ({ value, onChange, placeholder }: { value: string[], onChange: (newValue: string[]) => void, placeholder: string }) => {
    const [inputValue, setInputValue] = useState('');
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            if (!value.includes(inputValue.trim())) {
                onChange([...value, inputValue.trim()]);
            }
            setInputValue('');
        }
    };
    const removeTag = (tagToRemove: string) => {
        onChange(value.filter(tag => tag !== tagToRemove));
    };
    return (
        <div className="flex flex-wrap gap-2 p-3 border-2 dark:bg-slate-800 border-gray-200 rounded-xl bg-gray-50 focus-within:border-blue-300 focus-within:bg-white transition-all duration-200">
            <AnimatePresence>
                {value.map(tag => (
                    <motion.div 
                        key={tag} 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center dark:bg-slate-800 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full shadow-sm"
                    >
                        {tag}
                        <button 
                            type="button" 
                            onClick={() => removeTag(tag)} 
                            className="ml-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
            <input 
                type="text" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                onKeyDown={handleKeyDown} 
                placeholder={placeholder} 
                className="flex-grow p-1 outline-none bg-transparent min-w-32 text-gray-700 dark:text-white placeholder-gray-400" 
            />
        </div>
    );
};

const ProfileHeader = ({ isEditing, onEdit, onSave, onCancel, isSaving }: { isEditing: boolean, onEdit: () => void, onSave: () => void, onCancel: () => void, isSaving: boolean }) => (
    <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }}
    >
        <div className="bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 dark:text-white from-white to-blue-50 rounded-2xl shadow-lg border border-gray-100 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32  bg-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
            <div className="relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <motion.h1 
                            className="text-3xl font-bold dark:text-white text-gray-900 mb-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            My Profile
                        </motion.h1>
                        <motion.p 
                            className="text-gray-600 dark:text-gray-300 text-lg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Manage your profile information and preferences.
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {!isEditing ? (
                            <button 
                                onClick={onEdit} 
                                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <Edit size={20} />
                                <span>Edit Profile</span>
                            </button>
                        ) : (
                            <div className="flex space-x-3">
                                <button 
                                    onClick={onCancel} 
                                    className="px-6 py-3 border-2 dark:text-gray-300 border-gray-300 text-gray-700 dark:text-white rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold" 
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={onSave} 
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50" 
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Saving...</span>
                                        </div>
                                    ) : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    </motion.div>
);

const ProfileInfoCard = ({ isEditing, data, setData }: { isEditing: boolean, data: Partial<EditableData>, setData: React.Dispatch<React.SetStateAction<Partial<EditableData>>> }) => {
    const name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
    const initials = name.split(" ").map((n) => n[0]).join("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData(prev => ({ ...prev, avatar_file: file, avatar_url: URL.createObjectURL(file) }));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white  dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 p-8 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br dark:from-gray-800 from-blue-100 to-blue-200 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
            <div className="relative z-10">
                <div className="flex items-start space-x-8">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br dark:from-gray-800 dark:to-slate-900  from-blue-100 to-blue-200 flex items-center justify-center shadow-lg ring-4 ring-white">
                            {data.avatar_url ? (
                                <img src={data.avatar_url} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-blue-600">{initials}</span>
                            )}
                        </div>
                        {isEditing && (
                            <>
                                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                                <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => fileInputRef.current?.click()} 
                                    className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg group-hover:shadow-xl"
                                >
                                    <Camera size={18} />
                                </motion.button>
                            </>
                        )}
                    </div>
                    <div className="flex-1 pt-2">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-sm font-medium dark:text-gray-300 text-gray-600 mb-1 block">First Name</label>
                                        <input 
                                            type="text" 
                                            value={data.first_name} 
                                            onChange={(e) => setData({ ...data, first_name: e.target.value })} 
                                            placeholder="First Name" 
                                            className="w-full dark:text-white px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200" 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-medium  dark:text-gray-300 text-gray-600 mb-1 block">Last Name</label>
                                        <input 
                                            type="text" 
                                            value={data.last_name} 
                                            onChange={(e) => setData({ ...data, last_name: e.target.value })} 
                                            placeholder="Last Name" 
                                            className="w-full dark:text-white px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium dark:text-gray-300 text-gray-600 mb-1 block">Title</label>
                                    <input 
                                        type="text" 
                                        value={data.title} 
                                        onChange={(e) => setData({ ...data, title: e.target.value })} 
                                        placeholder="Your Title" 
                                        className="w-full dark:text-white px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200" 
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium dark:text-gray-300 text-gray-600 mb-1 block">Location</label>
                                    <input 
                                        type="text" 
                                        value={data.location} 
                                        onChange={(e) => setData({ ...data, location: e.target.value })} 
                                        placeholder="Location" 
                                        className="w-full dark:text-white px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200" 
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold dark:text-white text-gray-900">{name}</h2>
                                <div className="flex items-center space-x-2">
                                    <Briefcase size={18} className="text-blue-600" />
                                    <p className="text-xl dark:text-gray-300 dae text-gray-700  font-medium">{data.title || 'No title set'}</p>
                                </div>
                                <div className="flex items-center space-x-2 dark:text-white text-gray-500">
                                    <MapPin size={16} className="text-blue-500" />
                                    <span className="text-base dark:text-gray-300">{data.location || 'No location set'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const ProfileSectionCard = ({ title, children, icon, delay = 0 }: { title: string, children: React.ReactNode, icon?: React.ReactNode, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300"
    >
        <div className="flex items-center space-x-3 mb-6">
            {icon && <div className="text-blue-600">{icon}</div>}
            <h3 className="text-xl font-bold dark:text-white text-gray-900">{title}</h3>
        </div>
        {children}
    </motion.div>
);

const SkeletonLoader = () => (
    <div className="space-y-6 animate-pulse p-6">
        <div className="h-32 bg-gray-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-8">
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
                <div className="h-56 bg-gray-200 rounded-2xl"></div>
            </div>
            <div className="space-y-8">
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
            </div>
        </div>
    </div>
);

// --- Role-Specific Sections ---
const MenteeProfileSection = ({ isEditing, data, setData }: { isEditing: boolean, data: Partial<EditableData>, setData: React.Dispatch<React.SetStateAction<Partial<EditableData>>> }) => (
    <ProfileSectionCard title="My Learning Journey" icon={<Target size={24} />} delay={0.3}>
        <div className="space-y-6">
            <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-white mb-3">
                    <BookOpen size={16} className="text-blue-600" />
                    <span>Learning Objectives</span>
                </label>
                {isEditing ? (
                    <textarea 
                        value={data.learning_objectives} 
                        onChange={(e) => setData({ ...data, learning_objectives: e.target.value })} 
                        className="w-full p-4 border-2 dark:text-white border-gray-200 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none" 
                        rows={4}
                        placeholder="Describe your learning goals..."
                    />
                ) : (
                    <p className="text-gray-700  dark:bg-slate-700 dark:text-gray-300 leading-relaxed bg-gray-50 p-4 rounded-xl">{data.learning_objectives || 'Not set'}</p>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-white mb-3">
                        <Star size={16} className="text-blue-600" />
                        <span>Experience Level</span>
                    </label>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={data.experience_level} 
                            onChange={(e) => setData({ ...data, experience_level: e.target.value })} 
                            className="w-full p-3 border-2 dark:text-white border-gray-200 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200" 
                            placeholder="e.g., Beginner, Intermediate"
                        />
                    ) : (
                        <p className="text-gray-900 font-medium dark:bg-slate-700 dark:text-gray-300 bg-blue-50 p-3 rounded-xl">{data.experience_level || 'Not set'}</p>
                    )}
                </div>
                <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-white mb-3">
                        <GraduationCap size={16} className="text-blue-600" />
                        <span>Education</span>
                    </label>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={data.education} 
                            onChange={(e) => setData({ ...data, education: e.target.value })} 
                            className="w-full p-3 border-2 dark:text-white border-gray-200 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200" 
                            placeholder="Your education background"
                        />
                    ) : (
                        <p className="text-gray-900 font-medium dark:bg-slate-700 dark:text-gray-300 bg-blue-50 p-3 rounded-xl">{data.education || 'Not set'}</p>
                    )}
                </div>
            </div>
        </div>
    </ProfileSectionCard>
);

const MentorProfileSection = ({ isEditing, data, setData }: { isEditing: boolean, data: Partial<EditableData>, setData: React.Dispatch<React.SetStateAction<Partial<EditableData>>> }) => (
    <ProfileSectionCard title="My Mentoring Details" icon={<Users size={24} />} delay={0.3}>
        <div className="space-y-6">
            <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-white mb-3">
                    <Briefcase size={16} className="text-blue-600" />
                    <span>Professional Experience</span>
                </label>
                {isEditing ? (
                    <textarea 
                        value={data.professional_experience} 
                        onChange={(e) => setData({ ...data, professional_experience: e.target.value })} 
                        className="w-full p-4 border-2 dark:text-white border-gray-200 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none" 
                        rows={4}
                        placeholder="Describe your professional background..."
                    />
                ) : (
                    <p className="text-gray-700 dark:text-white leading-relaxed dark:bg-slate-700 bg-gray-50 p-4 rounded-xl">{data.professional_experience || 'Not set'}</p>
                )}
            </div>
            <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-white mb-3">
                    <Building size={16} className="text-blue-600" />
                    <span>Company</span>
                </label>
                {isEditing ? (
                    <input 
                        type="text" 
                        value={data.company} 
                        onChange={(e) => setData({ ...data, company: e.target.value })} 
                        className="w-full p-3 border-2 dark:text-white border-gray-200 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200" 
                        placeholder="Your current company"
                    />
                ) : (
                    <p className="text-gray-900 font-semibold text-lg dark:bg-slate-700 bg-blue-50 p-3 rounded-xl">{data.company || 'Not set'}</p>
                )}
            </div>
            <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-white mb-3">
                    <Zap size={16} className="text-blue-600" />
                    <span>Skills & Expertise</span>
                </label>
                {isEditing ? (
                    <TagInput 
                        value={data.skills || []} 
                        onChange={(tags) => setData({ ...data, skills: tags })} 
                        placeholder="Add a skill and press Enter" 
                    />
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {(data.skills || []).map((skill, index) => (
                            <motion.span 
                                key={skill}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="px-4 py-2 bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 from-blue-100 to-blue-200 text-blue-800 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                {skill}
                            </motion.span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </ProfileSectionCard>
);

// --- Main Profile Page Component ---
export default function ProfilePage() {
    const { user, profile, roleProfile, loading, refetchUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editableData, setEditableData] = useState<Partial<EditableData>>({});

    useEffect(() => {
        if (!loading && user && profile) {
            const combinedData = {
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                title: (profile as any).title || '',
                location: (profile as any).location || '',
                bio: profile.bio || '',
                languages: (profile as any).languages || [],
                avatar_url: profile.avatar_url || '',
                // Role-specific data
                experience_level: (roleProfile as any)?.experience_level || '',
                education: (roleProfile as any)?.education || '',
                learning_hours: (roleProfile as any)?.learning_hours || 0,
                learning_objectives: (roleProfile as any)?.learning_objectives || '',
                professional_experience: (roleProfile as any)?.professional_experience || '',
                company: (roleProfile as any)?.company || '',
                skills: (roleProfile as any)?.skills || [],
                avatar_file: null,
            };
            setEditableData(combinedData);
        }
    }, [loading, user, profile, roleProfile]);

    const separateDataForAPI = (data: Partial<EditableData>) => {
        const profileData = {
            first_name: data.first_name,
            last_name: data.last_name,
            title: data.title,
            location: data.location,
            bio: data.bio,
            languages: data.languages,
        };
        
        let roleSpecificData = {};
        if (user?.role === 'mentee') {
            roleSpecificData = {
                experience_level: data.experience_level,
                education: data.education,
                learning_hours: data.learning_hours,
                learning_objectives: data.learning_objectives,
            };
        } else if (user?.role === 'mentor') {
            roleSpecificData = {
                professional_experience: data.professional_experience,
                company: data.company,
                skills: data.skills,
            };
        }
        return { profileData, roleSpecificData };
    };

    const handleSave = async () => {
        setIsSaving(true);
        const { profileData, roleSpecificData } = separateDataForAPI(editableData);
        const avatarFile = editableData.avatar_file ?? null;
        
        try {
            await updateUserProfile(profileData, roleSpecificData, avatarFile, user!.role!);
            await refetchUser();
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (user && profile) {
             const combinedData = {
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                title: (profile as any).title || '',
                location: (profile as any).location || '',
                bio: profile.bio || '',
                languages: (profile as any).languages || [],
                avatar_url: profile.avatar_url || '',
                experience_level: (roleProfile as any)?.experience_level || '',
                education: (roleProfile as any)?.education || '',
                learning_hours: (roleProfile as any)?.learning_hours || 0,
                learning_objectives: (roleProfile as any)?.learning_objectives || '',
                professional_experience: (roleProfile as any)?.professional_experience || '',
                company: (roleProfile as any)?.company || '',
                skills: (roleProfile as any)?.skills || [],
                avatar_file: null,
            };
            setEditableData(combinedData);
        }
        setIsEditing(false);
    };

    if (loading) {
        return <SkeletonLoader />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 from-gray-50 to-blue-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <ProfileHeader 
                    isEditing={isEditing} 
                    onEdit={() => setIsEditing(true)} 
                    onSave={handleSave} 
                    onCancel={handleCancel} 
                    isSaving={isSaving} 
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        <ProfileInfoCard 
                            isEditing={isEditing} 
                            data={editableData} 
                            setData={setEditableData} 
                        />
                        
                        <ProfileSectionCard title="About Me" icon={<FeatherIcon size={24} />} delay={0.2}>
                            {isEditing ? (
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-white mb-3 block">Tell us about yourself</label>
                                    <textarea 
                                        value={editableData.bio} 
                                        onChange={(e) => setEditableData({ ...editableData, bio: e.target.value })} 
                                        rows={6} 
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none" 
                                        placeholder="Share your story, interests, and what makes you unique..."
                                    />
                                </div>
                            ) : (
                                <div className="prose prose-gray max-w-none">
                                    <p className="text-gray-700 dark:text-white leading-relaxed text-lg dark:bg-slate-700 bg-gray-50 p-6 rounded-xl border-l-4 border-blue-500">
                                        {editableData.bio || 'No bio provided yet. Click edit to add your story!'}
                                    </p>
                                </div>
                            )}
                        </ProfileSectionCard>
                        
                        {/* Role-Specific Section */}
                        {user?.role === 'mentee' && (
                            <MenteeProfileSection 
                                isEditing={isEditing} 
                                data={editableData} 
                                setData={setEditableData} 
                            />
                        )}
                        {user?.role === 'mentor' && (
                            <MentorProfileSection 
                                isEditing={isEditing} 
                                data={editableData} 
                                setData={setEditableData} 
                            />
                        )}
                    </div>
                    
                    <div className="space-y-8">
                        {/* Languages Card */}
                        <ProfileSectionCard title="Languages" icon={<Globe size={24} />} delay={0.1}>
                            {isEditing ? (
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-white mb-3 block">Languages you speak</label>
                                    <TagInput 
                                        value={editableData.languages || []} 
                                        onChange={(tags) => setEditableData({ ...editableData, languages: tags })} 
                                        placeholder="Add a language and press Enter" 
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {(editableData.languages || []).length > 0 ? (
                                        <div className="flex flex-wrap gap-3">
                                            {editableData.languages?.map((lang, index) => (
                                                <motion.div
                                                    key={lang}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 from-gray-100 to-gray-200 text-gray-700 dark:text-white rounded-xl text-sm font-medium shadow-sm"
                                                >
                                                    <Globe size={16} className="text-blue-600" />
                                                    <span>{lang}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic text-center py-6">No languages added yet</p>
                                    )}
                                </div>
                            )}
                        </ProfileSectionCard>
                    </div>
                </div>

                {/* Action Buttons for Mobile */}
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:hidden fixed bottom-6 left-6 right-6 z-50"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 p-4">
                            <div className="flex space-x-3">
                                <button 
                                    onClick={handleCancel} 
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 dark:text-white rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold" 
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave} 
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50" 
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Saving...</span>
                                        </div>
                                    ) : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
