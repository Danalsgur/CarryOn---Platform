import React from 'react';
import { Check } from 'lucide-react';
import { passwordRequirements, PasswordRequirement } from '../../utils/passwordUtils';

interface PasswordRequirementsListProps {
  password: string;
  customRequirements?: PasswordRequirement[];
}

const PasswordRequirementsList: React.FC<PasswordRequirementsListProps> = ({ 
  password,
  customRequirements
}) => {
  const requirements = customRequirements || passwordRequirements;
  
  return (
    <ul className="mt-2 text-xs text-text-secondary space-y-1">
      {requirements.map((requirement, index) => (
        <li 
          key={index} 
          className={`flex items-center ${requirement.validator(password) ? 'text-green-600' : ''}`}
        >
          {requirement.validator(password) ? (
            <Check size={12} className="mr-1 flex-shrink-0" />
          ) : (
            <span className="w-3 h-3 mr-1 flex-shrink-0"></span>
          )}
          {requirement.text}
        </li>
      ))}
    </ul>
  );
};

export default PasswordRequirementsList;
