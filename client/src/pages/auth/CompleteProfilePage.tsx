import React, { useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';
import { X } from 'lucide-react';
import { completeUserProfile } from '@/services/authService'

// --- Type Definitions for robust TSX ---

interface FormData {
    first_name: string;
    last_name: string;
    bio: string;
    title: string;
    location: string;
    languages: string[];
    professional_experience: string;
    company: string;
    skills: string[];
    availability: any;
    learning_objectives: string;
    experience_level: string;
    mentoring_preferences: string;
}

interface StepProps {
    formData: Partial<FormData>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleTagsChange: (name: keyof FormData, tags: string[]) => void;
}

interface Step1Props extends StepProps {
    nextStep: () => void;
}

interface Step2Props extends StepProps {
    role: string;
    prevStep: () => void;
    handleSubmit: () => void;
}

// --- NEW: Reusable Tag Input Component ---
const TagInput: React.FC<{
    name: keyof FormData;
    value: string[];
    placeholder: string;
    onChange: (name: keyof FormData, tags: string[]) => void;
}> = ({ name, value, placeholder, onChange }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim() !== '') {
            e.preventDefault();
            if (!value.includes(inputValue.trim())) {
                onChange(name, [...value, inputValue.trim()]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(name, value.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-white">
                {value.map(tag => (
                    <div key={tag} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-blue-600 hover:text-blue-800">
                            <X size={14} />
                        </button>
                    </div>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-grow p-1 outline-none bg-transparent"
                />
            </div>
        </div>
    );
};


// --- Main Component: Manages the steps and data ---

export const CompleteProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, refetchUser } = useAuth();
    
    const [role, setRole] = useState<string>('');

    useEffect(() => {
        if (location.state?.role) {
            setRole(location.state.role);
        } else {
            navigate('/choose-role');
        }
    }, [location, navigate]);

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        first_name: '', last_name: '', bio: '', title: '', location: '', languages: [],
        professional_experience: '', company: '', skills: [], availability: {},
        learning_objectives: '', experience_level: '', mentoring_preferences: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleTagsChange = (name: keyof FormData, tags: string[]) => {
        setFormData(prev => ({ ...prev, [name]: tags }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!user && !location.state?.user) return;

        const profileData = {
            first_name: formData.first_name, last_name: formData.last_name, bio: formData.bio,
            title: formData.title, location: formData.location, languages: formData.languages,
        };

        const roleSpecificData = role === 'mentor' ? {
            professional_experience: formData.professional_experience, company: formData.company,
            skills: formData.skills, availability: formData.availability,
        } : {
            learning_objectives: formData.learning_objectives, experience_level: formData.experience_level,
            mentoring_preferences: formData.mentoring_preferences,
        };

        try {
            const res = await completeUserProfile({ role, profileData, roleSpecificData });
            if ( res){
                refetchUser();
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Failed to complete profile:", error);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <Step1_CommonInfo formData={formData} handleChange={handleChange} handleTagsChange={handleTagsChange} nextStep={nextStep} />;
            case 2:
                return <Step2_RoleSpecificInfo role={role} formData={formData} handleChange={handleChange} handleTagsChange={handleTagsChange} prevStep={prevStep} handleSubmit={handleSubmit} />;
            default:
                return <div>Unknown Step</div>;
        }
    };

    if (!role) return <div>Loading...</div>;

    return (
        <div className="w-3xl rounded-2xl bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl">
                <div className="mb-8">
                    <h3 className="text-center text-lg font-semibold text-gray-700 mb-2">Step {step} of 2</h3>
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                        <div
                            className="h-2 bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${(step / 2) * 100}%` }}
                        ></div>
                    </div>
                </div>
                {renderStep()}
            </div>
        </div>
    );
};


// --- Step 1 Component: Common Profile Information ---

const Step1_CommonInfo: React.FC<Step1Props> = ({ formData, handleChange, handleTagsChange, nextStep }) => (
    <div className="bg-white p-8 rounded-lg shadow-md animate-fade-in">
        <h2 className="text-2xl font-bold mb-1 text-gray-800">Tell us about yourself</h2>
        <p className="text-gray-500 mb-6">This information will be visible on your public profile.</p>
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="e.g., Jane" className="p-2 border rounded w-full" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="e.g., Doe" className="p-2 border rounded w-full" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Title</label>
                <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Senior Software Engineer" className="p-2 border rounded w-full" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="A short introduction about yourself..." className="p-2 border rounded w-full min-h-[100px]" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input name="location" value={formData.location} onChange={handleChange} placeholder="e.g., New York, NY" className="p-2 border rounded w-full" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                <TagInput name="languages" value={formData.languages || []} onChange={handleTagsChange} placeholder="Add a language and press Enter" />
            </div>
        </div>
        <div className="flex justify-end mt-8">
            <button onClick={nextStep} className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Next</button>
        </div>
    </div>
);

// --- Step 2 Component: Role-Specific Information ---

const Step2_RoleSpecificInfo: React.FC<Step2Props> = ({ role, formData, handleChange, handleTagsChange, prevStep, handleSubmit }) => (
    <div className="bg-white p-8 rounded-lg shadow-md animate-fade-in">
        <h2 className="text-2xl font-bold mb-1 text-gray-800">
            {role === 'mentor' ? 'Your Mentoring Profile' : 'Your Learning Goals'}
        </h2>
        <p className="text-gray-500 mb-6">{role === 'mentor' ? 'Detail your expertise and experience.' : 'Help us understand what you want to achieve.'}</p>
        
        {role === 'mentor' && (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Experience</label>
                    <textarea name="professional_experience" value={formData.professional_experience} onChange={handleChange} placeholder="Describe your professional journey..." className="p-2 border rounded w-full min-h-[120px]" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Company</label>
                    <input name="company" value={formData.company} onChange={handleChange} placeholder="e.g., Google" className="p-2 border rounded w-full" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                    <TagInput name="skills" value={formData.skills || []} onChange={handleTagsChange} placeholder="Add a skill and press Enter" />
                </div>
            </div>
        )}

        {role === 'mentee' && (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Learning Objectives</label>
                    <textarea name="learning_objectives" value={formData.learning_objectives} onChange={handleChange} placeholder="What do you want to learn?" className="p-2 border rounded w-full min-h-[120px]" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Experience Level</label>
                    <input name="experience_level" value={formData.experience_level} onChange={handleChange} placeholder="e.g., Beginner, Intermediate" className="p-2 border rounded w-full" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mentoring Preferences</label>
                    <textarea name="mentoring_preferences" value={formData.mentoring_preferences} onChange={handleChange} placeholder="What are you looking for in a mentor?" className="p-2 border rounded w-full min-h-[100px]" />
                </div>
            </div>
        )}

        <div className="flex justify-between mt-8">
            <button onClick={prevStep} className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Back</button>
            <button onClick={handleSubmit} className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Complete Profile</button>
        </div>
    </div>
);
