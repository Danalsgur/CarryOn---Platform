import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'

export default function ProfileEdit() {
  const navigate = useNavigate()
  const { user, profile, setProfile, loading } = useAuth()

  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setNickname(profile.nickname || '')
      setPhone(profile.phone || '')
    }
  }, [profile])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary">
        로딩 중입니다...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary">
        로그인 정보가 없습니다.
      </div>
    )
  }

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
      })
      .eq('id', user.id)

    if (error) {
      if (error.code === '23505' || error.message.includes('duplicate')) {
        setError('이미 사용 중인 닉네임입니다.')
      } else {
        setError(`프로필 저장 실패: ${error.message}`)
      }
    } else {
        setProfile({
            id: user.id as string,
            name,
            nickname,
            phone,
            country_code: 'KR',
          })

      navigate('/mypage')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-layout shadow-card border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-text-primary">프로필 수정</h2>

        <div className="space-y-4">
          <Input label="이름" value={name} setValue={setName} />
          <Input label="닉네임" value={nickname} setValue={setNickname} />
          <Input label="전화번호" value={phone} setValue={setPhone} />
        </div>

        {error && <p className="text-danger text-sm mt-4 text-center">{error}</p>}

        <Button onClick={handleSubmit} className="mt-6 w-full">
          저장
        </Button>
      </div>
    </div>
  )
}
