import React, { useState } from 'react';
import type { DragEvent, KeyboardEvent } from 'react';
import { ChevronDown, Mail, X, Plus, GripVertical } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface FormData {
  professional_experience: string;
  specialization: string[];
  availability: string;
}

interface TaetirMentorFormProps {
  initialData?: Partial<FormData>;
  onSubmit?: (data: FormData) => void;
}

type FormField = keyof Omit<FormData, 'interests'>;

const TaetirMentorForm: React.FC<TaetirMentorFormProps> = ({ 
  initialData, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<FormData>({
    professional_experience: initialData?.professional_experience || '',
    specialization: initialData?.specialization || [],
    availability: initialData?.availability || '',
  });


  const [newSpecialization, setNewSpecialization] = useState<string>('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleInputChange = (field: FormField, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSpecialization = (): void => {
    const trimmedSpecialization = newSpecialization.trim();
    if (trimmedSpecialization && !formData.specialization.includes(trimmedSpecialization)) {
      setFormData(prev => ({
        ...prev,
        specialization: [...prev.specialization, trimmedSpecialization]
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (indexToRemove: number): void => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number): void => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number): void => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newSpecialization = [...formData.specialization];
    const draggedItem = newSpecialization[draggedIndex];

    newSpecialization.splice(draggedIndex, 1);
    newSpecialization.splice(dropIndex, 0, draggedItem);

    setFormData(prev => ({
      ...prev,
      specialization: newSpecialization
    }));
    
    setDraggedIndex(null);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialization();
    }
  };

  const handleSubmit = (): void => {
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const addSuggestion = (suggestion: string): void => {
    setFormData(prev => ({
      ...prev,
      specialization: [...prev.specialization, suggestion]
    }));
    setNewSpecialization('');
  };

  const interestOptions: string[] = ['Machine Learning', 'Web Development', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'Blockchain', 'AI Ethics', 'DevOps', 'UI/UX Design', 'Mobile App Development', 'Digital Marketing',"Backend Development", "Frontend Development", "Full Stack Development", "Software Testing", "Game Development", "AR/VR Development", "Robotics", "Quantum Computing", "Internet of Things (IoT)"];

  const filteredSuggestions = interestOptions
    .filter(option => 
      option.toLowerCase().includes(newSpecialization.toLowerCase()) &&
      !formData.specialization.includes(option)
    )
    .slice(0, 4);

  return (
    <div className="h-screen lg:w-5xl md:w-2xl bg-gray-50 ">
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
                  name 
                </h2>
                <p className="text-gray-600">example@gmail.com</p>
              </div>
            </div>
            <button 
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                professional_experience
              </Label>
              <input
                type="text"
                placeholder="Your professional experience"
                value={formData.professional_experience}
                onChange={(e) => handleInputChange('professional_experience', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>


            <div>
              <Label className=" text-sm font-medium text-gray-700 mb-2">
                Specialization
              </Label>
              
              {/* Tags Container */}
              <div className="min-h-[120px] p-4 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                {/* Existing Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.specialization.map((interest, index) => (
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
                        onClick={() => removeSpecialization(index)}
                        className="w-4 h-4 rounded-full bg-blue-200 hover:bg-red-200 flex items-center justify-center transition-colors group"
                        type="button"
                        aria-label={`Remove ${interest} specialization`}
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
                      placeholder="Add new Specialization..."
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 outline-none text-sm placeholder-gray-400 bg-transparent"
                    />
                  </div>
                  {newSpecialization && (
                    <button
                      onClick={addSpecialization}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
                      type="button"
                    >
                      Add
                    </button>
                  )}
                </div>

                {/* Suggested Specializations */}
                {newSpecialization && filteredSuggestions.length > 0 && (
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




           

            {/* Bio */}
            <div>
              <Label className=" text-sm font-medium text-gray-700 mb-2">
                Availability
              </Label>
              <textarea
                placeholder="Tell us about yourself"
                rows={3}
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
              />
            </div>



            {/* Interests */}
            
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

export default TaetirMentorForm;