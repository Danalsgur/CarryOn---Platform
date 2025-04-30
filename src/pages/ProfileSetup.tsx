import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'

export default function ProfileSetup() {
  const navigate = useNavigate()
  const { user, setProfile } = useAuth()

  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
  
    if (!name || !nickname || !phone) {
      setError('모든 정보를 입력해주세요.')
      return
    }
  
    const { error } = await supabase
      .from('profiles')
      .update({
        name,
        nickname,
        phone,
        country_code: 'KR',
      })
      .eq('id', user?.id)
  
    if (error) {
      if (error.code === '23505' || error.message.includes('duplicate')) {
        setError('이미 사용 중인 닉네임입니다.')
      } else {
        setError(`프로필 저장 실패: ${error.message}`)
      }
    } else {
      const updatedProfile = {
        id: user!.id,
        name,
        nickname,
        phone,
        country_code: 'KR',
      }

      setProfile(updatedProfile)

      // ✅ 타이밍 보장용 setTimeout
      setTimeout(() => {
        navigate('/mypage')
      }, 0)
    }
  }  

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-layout shadow-card border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-text-primary">
          추가 정보 입력
        </h2>

        <div className="space-y-4">
          <Input label="이름" value={name} setValue={setName} />
          <Input label="닉네임" value={nickname} setValue={setNickname} />
          <Input label="전화번호" value={phone} setValue={setPhone} />
        </div>

        {error && <p className="text-danger text-sm mt-4 text-center">{error}</p>}

        <Button onClick={handleSubmit} className="mt-6 w-full">
          저장하고 시작하기
        </Button>
      </div>
    </div>
  )
}
