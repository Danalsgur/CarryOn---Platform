// 비밀번호 강도 계산 함수
export const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  
  // 길이 점수
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  // 복잡성 점수
  if (/[A-Z]/.test(password)) strength += 1; // 대문자
  if (/[a-z]/.test(password)) strength += 1; // 소문자
  if (/[0-9]/.test(password)) strength += 1; // 숫자
  if (/[^A-Za-z0-9]/.test(password)) strength += 1; // 특수문자
  
  return Math.min(strength, 5); // 0-5 범위로 제한
};

// 비밀번호 요구사항 정의
export interface PasswordRequirement {
  text: string;
  validator: (password: string) => boolean;
}

export const passwordRequirements: PasswordRequirement[] = [
  {
    text: '최소 8자 이상',
    validator: (password) => password.length >= 8,
  },
  {
    text: '대문자 포함',
    validator: (password) => /[A-Z]/.test(password),
  },
  {
    text: '소문자 포함',
    validator: (password) => /[a-z]/.test(password),
  },
  {
    text: '숫자 포함',
    validator: (password) => /[0-9]/.test(password),
  },
  {
    text: '특수문자 포함',
    validator: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

// 비밀번호 강도에 따른 색상
export const getStrengthColor = (strength: number): string => {
  if (strength <= 1) return 'bg-red-500';
  if (strength <= 3) return 'bg-yellow-500';
  return 'bg-green-500';
};

// 비밀번호 강도에 따른 텍스트
export const getStrengthText = (strength: number): string => {
  if (strength <= 1) return '매우 약함';
  if (strength <= 2) return '약함';
  if (strength <= 3) return '보통';
  if (strength <= 4) return '강함';
  return '매우 강함';
};
