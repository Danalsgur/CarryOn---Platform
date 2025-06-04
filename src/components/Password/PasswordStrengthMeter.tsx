import React from 'react';
import { getStrengthColor, getStrengthText } from '../../utils/passwordUtils';

interface PasswordStrengthMeterProps {
  strength: number;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ strength }) => {
  return (
    <div className="mt-2">
      <div className="flex items-center">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getStrengthColor(strength)}`} 
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span className="ml-2 text-xs text-text-secondary">{getStrengthText(strength)}</span>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
