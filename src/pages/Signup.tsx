import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import Input from '../components/Input'
import Button from '../components/Button'
import Header from '../components/Layout/Header' // ✅ 헤더 추가
import { Eye, EyeOff, Check } from 'lucide-react'

// 비밀번호 강도 계산 함수
const calculatePasswordStrength = (password: string): number => {
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

interface PasswordRequirement {
  text: string;
  validator: (password: string) => boolean;
}

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  // 비밀번호 요구사항 정의
  const passwordRequirements: PasswordRequirement[] = [
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

  // 비밀번호 변경 시 강도 계산
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  // 비밀번호 강도에 따른 색상 및 텍스트
  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getStrengthText = () => {
    if (passwordStrength <= 1) return '매우 약함';
    if (passwordStrength <= 2) return '약함';
    if (passwordStrength <= 3) return '보통';
    if (passwordStrength <= 4) return '강함';
    return '매우 강함';
  };

  const handleSignup = async () => {
    setError(null)
    setMessage(null)

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setMessage(`인증 이메일이 ${email} 주소로 전송되었습니다.\n메일을 확인하고 로그인해주세요.`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header /> {/* ✅ 헤더 삽입 */}
      <div className="flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-surface p-8 rounded-layout shadow-card border border-gray-200 mt-12">
          <h2 className="text-2xl font-bold text-center mb-6 text-text-primary">
            회원가입
          </h2>

          <div className="space-y-4">
            <Input
              label="이메일"
              type="email"
              value={email}
              setValue={setEmail}
              placeholder="you@example.com"
            />
            <Input
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              value={password}
              setValue={setPassword}
              placeholder="••••••••"
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
            
            {/* 비밀번호 강도 표시기 */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getStrengthColor()}`} 
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="ml-2 text-xs text-text-secondary">{getStrengthText()}</span>
                </div>
                
                {/* 비밀번호 요구사항 목록 */}
                <ul className="mt-2 text-xs text-text-secondary space-y-1">
                  {passwordRequirements.map((requirement, index) => (
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
              </div>
            )}
            <Input
              label="비밀번호 확인"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              setValue={setConfirmPassword}
              placeholder="••••••••"
              rightElement={
                showConfirmPassword ? (
                  <EyeOff
                    size={18}
                    onClick={() => setShowConfirmPassword(false)}
                    className="text-gray-500 cursor-pointer hover:text-gray-700"
                  />
                ) : (
                  <Eye
                    size={18}
                    onClick={() => setShowConfirmPassword(true)}
                    className="text-gray-500 cursor-pointer hover:text-gray-700"
                  />
                )
              }
            />
          </div>

          {error && <p className="mt-4 text-danger text-sm text-center">{error}</p>}
          {message && (
            <p className="mt-4 text-green-600 text-sm text-center whitespace-pre-line">
              {message}
            </p>
          )}

          <Button onClick={handleSignup} disabled={loading} className="mt-6 w-full">
            {loading ? '가입 중...' : '가입하기'}
          </Button>

          <p className="text-sm text-center mt-4 text-text-secondary">
            이미 계정이 있나요?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-brand cursor-pointer hover:underline"
            >
              로그인
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
