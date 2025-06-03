import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import { supabase } from '../supabase'
import Button from '../components/Button'
import { Pencil } from 'lucide-react'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [nickname, setNickname] = useState(profile?.nickname || '')
  const [updateLoading, setUpdateLoading] = useState(false)

  // 프로필 업데이트 함수
  const handleUpdateProfile = async () => {
    if (!user) return
    
    setUpdateLoading(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({
        name,
        nickname
      })
      .eq('id', user.id)
    
    setUpdateLoading(false)
    
    if (error) {
      alert('프로필 업데이트 실패: ' + error.message)
    } else {
      alert('프로필이 업데이트되었습니다.')
      setIsEditing(false)
      // 페이지 새로고침하여 AuthContext에서 프로필 정보 다시 가져오기
      window.location.reload()
    }
  }

  // 세션 or 프로필 로딩 중
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        프로필 정보 불러오는 중...
      </div>
    )
  }

  // 로그인되지 않은 경우
  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">프로필</h1>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
          로그인이 필요합니다.
        </div>
        <Button onClick={() => navigate('/login')}>로그인하기</Button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">회원 정보</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/mypage')}
        >
          마이페이지로 돌아가기
        </Button>
      </div>

      <div className="relative border rounded-lg p-5 bg-white shadow-sm">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input 
                type="text" 
                value={user.email} 
                disabled 
                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
              <input 
                type="text" 
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleUpdateProfile}
                loading={updateLoading}
              >
                저장
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false)
                  setName(profile?.name || '')
                  setNickname(profile?.nickname || '')
                }}
              >
                취소
              </Button>
            </div>
          </div>
        ) : (
          <>
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Pencil size={16} className="text-gray-500" />
            </button>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">이메일</div>
                <div className="font-medium">{user.email}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">이름</div>
                <div className="font-medium">{profile?.name || '이름 없음'}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">닉네임</div>
                <div className="font-medium">{profile?.nickname || '닉네임 없음'}</div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="border-t pt-6 space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">계정 관리</h2>
        
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => navigate('/reset-password')}
          >
            비밀번호 변경
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-gray-700 border-gray-200 hover:bg-gray-50"
            onClick={async () => {
              const { error } = await supabase.auth.signOut()
              if (!error) navigate('/')
            }}
          >
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  )
}
