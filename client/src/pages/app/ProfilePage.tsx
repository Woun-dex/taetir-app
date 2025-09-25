import React, { useState } from 'react';
import type { DragEvent, KeyboardEvent } from 'react';
import { ChevronDown, Mail, X, Plus, GripVertical } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/AuthContext';
import { updateProfile } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

interface FormData {
  first_name: string;
  last_name: string;
  bio: string;
  skills: string[];
  experience_level: string;
  interests: string[];
}

interface TaetirProfileFormProps {
  initialData?: Partial<FormData>;
}

type FormField = keyof Omit<FormData, 'interests'>;

const TaetirProfileForm: React.FC<TaetirProfileFormProps> = ({ 
  initialData, 
}) => {
 const [formData, setFormData] = useState<FormData>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    bio: initialData?.bio || '',
    skills: initialData?.skills || ['Programming', 'Design'],
    experience_level: initialData?.experience_level || '',
    interests: initialData?.interests || ['Technology', 'Design']
  });

  const navigate = useNavigate();
  const { user , profile } = useAuth();
  if (!user) {
    navigate('/signin');
    return null;
  }
  if ( profile ){
    navigate('/dashboard');
  }

  const [newInterest, setNewInterest] = useState<string>('');
  const [newSkill, setNewSkill] = useState<string>('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedSkillIndex, setDraggedSkillIndex] = useState<number | null>(null);

  
const handleInputChange = (field: FormField, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addInterest = (): void => {
    const trimmedInterest = newInterest.trim();
    if (trimmedInterest && !formData.interests.includes(trimmedInterest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, trimmedInterest]
      }));
      setNewInterest('');
    }
  };

  const addSkill = (): void => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmedSkill]
      }));
      setNewSkill('');
    }
  };

  const removeInterest = (indexToRemove: number): void => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, index) => index !== indexToRemove)
    }));
  };

  const removeSkill = (indexToRemove: number): void => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number): void => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSkillDragStart = (e: DragEvent<HTMLDivElement>, index: number): void => {
    setDraggedSkillIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number): void => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newInterests = [...formData.interests];
    const draggedItem = newInterests[draggedIndex];
    
    newInterests.splice(draggedIndex, 1);
    newInterests.splice(dropIndex, 0, draggedItem);
    
    setFormData(prev => ({
      ...prev,
      interests: newInterests
    }));
    
    setDraggedIndex(null);
  };

  const handleSkillDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number): void => {
    e.preventDefault();
    if (draggedSkillIndex === null) return;

    const newSkills = [...formData.skills];
    const draggedItem = newSkills[draggedSkillIndex];
    
    newSkills.splice(draggedSkillIndex, 1);
    newSkills.splice(dropIndex, 0, draggedItem);
    
    setFormData(prev => ({
      ...prev,
      skills: newSkills
    }));
    
    setDraggedSkillIndex(null);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log(profile);
      addInterest();
    }
  };

  const handleSkillKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const onSubmit = (data: FormData) => {
    const filedata = { user_id: user?.id, ...data }
    updateProfile(filedata).then(() => console.log("update profile successful"))
  }

  const handleSubmit = (): void => {
    onSubmit(formData)
  };

  const addSuggestion = (suggestion: string): void => {
    setFormData(prev => ({
      ...prev,
      interests: [...prev.interests, suggestion]
    }));
    setNewInterest('');
  };

  const addSkillSuggestion = (suggestion: string): void => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, suggestion]
    }));
    setNewSkill('');
  };

  const experienceLevels: string[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const skillOptions: string[] = ['Programming', 'Design', 'Marketing', 'Writing', 'Business', 'Data Science'];
  const interestOptions: string[] = ['Technology', 'Art', 'Science', 'Business', 'Education', 'Health', 'Sports', 'Music', 'Travel', 'Photography', 'Cooking', 'Reading'];

  const filteredSuggestions = interestOptions
    .filter(option => 
      option.toLowerCase().includes(newInterest.toLowerCase()) &&
      !formData.interests.includes(option)
    )
    .slice(0, 4);

  const filteredSkillSuggestions = skillOptions
    .filter(option => 
      option.toLowerCase().includes(newSkill.toLowerCase()) &&
      !formData.skills.includes(option)
    )
    .slice(0, 4);

  return (
    <div className="h-screen lg:w-5xl md:w-2xl dark:bg-slate-800 bg-gray-50 ">
      <div className="mx-auto">
        <div className=" w-full">
          <div className="bg-gradient-to-r from-gray-700 via-blue-800 to-blue-600 rounded-lg p-8 text-center text-white">
            <h1 className="text-4xl font-bold mb-2">TAETIR</h1>
            <p className="text-blue-100">
              The mentoring platform that connects curious minds with passionate experts.
            </p>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                <div className="text-2xl">👤</div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {formData.first_name || formData.last_name
                    ? `${formData.first_name} ${formData.last_name}`.trim()
                    : 'Your Name'
                  }
                </h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <button 
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Edit
            </button>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* First Name */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                First Name
              </Label>
              <input
                type="text"
                placeholder="Your First Name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            {/* Last Name */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                LastName
              </Label>
              <input
                type="text"
                placeholder="Your Last Name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            {/* Bio */}
            <div>
              <Label className=" text-sm font-medium text-gray-700 mb-2">
                Bio
              </Label>
              <textarea
                placeholder="Tell us about yourself"
                rows={3}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              
              {/* Skills Tags Container */}
              <div className="min-h-[120px] p-4 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                {/* Existing Skills Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.skills.map((skill, index) => (
                    <div
                      key={`${skill}-${index}`}
                      draggable
                      onDragStart={(e) => handleSkillDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleSkillDrop(e, index)}
                      className={`group flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium cursor-move hover:bg-green-200 transition-colors ${
                        draggedSkillIndex === index ? 'opacity-50' : ''
                      }`}
                    >
                      <GripVertical className="w-3 h-3 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill(index)}
                        className="w-4 h-4 rounded-full bg-green-200 hover:bg-red-200 flex items-center justify-center transition-colors group"
                        type="button"
                        aria-label={`Remove ${skill} skill`}
                      >
                        <X className="w-3 h-3 text-green-600 group-hover:text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Skill */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-full hover:border-green-400 transition-colors">
                    <Plus className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Add new skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={handleSkillKeyPress}
                      className="flex-1 outline-none text-sm placeholder-gray-400 bg-transparent"
                    />
                  </div>
                  {newSkill && (
                    <button
                      onClick={addSkill}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded-full hover:bg-green-700 transition-colors"
                      type="button"
                    >
                      Add
                    </button>
                  )}
                </div>

                {/* Suggested Skills */}
                {newSkill && filteredSkillSuggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-2">Suggestions:</div>
                    <div className="flex flex-wrap gap-2">
                      {filteredSkillSuggestions.map(suggestion => (
                        <button
                          key={suggestion}
                          onClick={() => addSkillSuggestion(suggestion)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                          type="button"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <Label className=" text-sm font-medium text-gray-700 mb-2">
                Experience level
              </Label>
              <div className="relative">
                <select
                  value={formData.experience_level}
                  onChange={(e) => handleInputChange('experience_level', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none bg-white"
                >
                  <option value="">Select experience level</option>
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Interests */}
            <div>
              <Label className=" text-sm font-medium text-gray-700 mb-2">
                Interests
              </Label>
              
              {/* Tags Container */}
              <div className="min-h-[120px] p-4 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                {/* Existing Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.interests.map((interest, index) => (
                    <div
                      key={`${interest}-${index}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`group flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-move hover:bg-blue-200 transition-colors ${
                        draggedIndex === index ? 'opacity-50' : ''
                      }`}
                    >
                      <GripVertical className="w-3 h-3 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span>{interest}</span>
                      <button
                        onClick={() => removeInterest(index)}
                        className="w-4 h-4 rounded-full bg-blue-200 hover:bg-red-200 flex items-center justify-center transition-colors group"
                        type="button"
                        aria-label={`Remove ${interest} interest`}
                      >
                        <X className="w-3 h-3 text-blue-600 group-hover:text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Interest */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-full hover:border-blue-400 transition-colors">
                    <Plus className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Add new interest..."
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 outline-none text-sm placeholder-gray-400 bg-transparent"
                    />
                  </div>
                  {newInterest && (
                    <button
                      onClick={addInterest}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
                      type="button"
                    >
                      Add
                    </button>
                  )}
                </div>

                {/* Suggested Interests */}
                {newInterest && filteredSuggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-2">Suggestions:</div>
                    <div className="flex flex-wrap gap-2">
                      {filteredSuggestions.map(suggestion => (
                        <button
                          key={suggestion}
                          onClick={() => addSuggestion(suggestion)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                          type="button"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">My email Address</h3>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div className='flex flex-col items-start'>
                <div className="font-medium text-gray-900">example@gmail.com</div>
                <div className="text-sm text-gray-500">1 minute ago</div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-end">
            <button 
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
              type="button"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaetirProfileForm;