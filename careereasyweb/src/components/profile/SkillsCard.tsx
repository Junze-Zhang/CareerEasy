'use client';

import { KeyboardEvent } from 'react';

interface SkillsCardProps {
  skills: string[] | undefined;
  isOwnProfile: boolean;
  hasChanges: boolean;
  showSkillInput: boolean;
  newSkillInput: string;
  onSave: () => void;
  onCancel: () => void;
  onAddSkill: (skill: string) => void;
  onDeleteSkill: (skill: string) => void;
  onShowSkillInput: (show: boolean) => void;
  onSkillInputChange: (value: string) => void;
  onSkillInputKeyPress: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export default function SkillsCard({
  skills,
  isOwnProfile,
  hasChanges,
  showSkillInput,
  newSkillInput,
  onSave,
  onCancel,
  onAddSkill,
  onDeleteSkill,
  onShowSkillInput,
  onSkillInputChange,
  onSkillInputKeyPress
}: SkillsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col group hover:shadow-2xl transition-shadow mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Skills
        </h3>
        
        {isOwnProfile && hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="text-green-600 hover:text-green-800 p-1"
              title="Save changes"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={onCancel}
              className="text-red-600 hover:text-red-800 p-1"
              title="Cancel changes"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1">
        {skills && skills.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 group/skill">
                {skill}
                {isOwnProfile && (
                  <button
                    onClick={() => onDeleteSkill(skill)}
                    className="ml-1 text-blue-600 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 mb-4">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-gray-500">No skills listed yet</p>
          </div>
        )}

        {isOwnProfile && (
          <div className="space-y-2">
            {showSkillInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => onSkillInputChange(e.target.value)}
                  onKeyPress={onSkillInputKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a skill"
                  autoFocus
                />
                <button
                  onClick={() => onAddSkill(newSkillInput)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => onShowSkillInput(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => onShowSkillInput(true)}
                className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border-2 border-dashed border-purple-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Skill
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}