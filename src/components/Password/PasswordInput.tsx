import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from '../Input';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import PasswordRequirementsList from './PasswordRequirementsList';
import { calculatePasswordStrength } from '../../utils/passwordUtils';

interface PasswordInputProps {
  label?: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  showRequirements?: boolean;
  showStrengthMeter?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label = '비밀번호',
  value,
  setValue,
  placeholder = '••••••••',
  showRequirements = true,
  showStrengthMeter = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // 비밀번호 변경 시 강도 계산
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(value));
  }, [value]);

  return (
    <div>
      <Input
        label={label}
        type={showPassword ? 'text' : 'password'}
        value={value}
        setValue={setValue}
        placeholder={placeholder}
        rightElement={
          showPassword ? (
            <EyeOff
              size={18}
              onClick={() => setShowPassword(false)}
              className="text-gray-500 cursor-pointer hover:text-gray-700"
            />
          ) : (
            <Eye
              size={18}
              onClick={() => setShowPassword(true)}
              className="text-gray-500 cursor-pointer hover:text-gray-700"
            />
          )
        }
      />
      
      {value && showStrengthMeter && (
        <PasswordStrengthMeter strength={passwordStrength} />
      )}
      
      {value && showRequirements && (
        <PasswordRequirementsList password={value} />
      )}
    </div>
  );
};

export default PasswordInput;
