// 🔹 Redesigned RequestManage.tsx with cleaner card UI

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import dayjs from 'dayjs'
import { ShoppingBag, Briefcase, AlertCircle, Check, X, Pencil } from 'lucide-react'

// 타입 정의

interface Match {
  id: string
  status: string
  created_at: string
  user_id: string
  trip: { departure_date: string } | null
  profiles: { nickname: string } | null
}

interface Request {
  id: string
  user_id: string
  title: string
  destination_city: string
  reward: number
  currency: string
  receive_start: string
  receive_end: string
}

export default function RequestManage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [request, setRequest] = useState<Request | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const isEditable = matches.every(
    (m) =>
      m.status === 'rejected' ||
      m.status === 'cancelled' ||
      m.status === 'expired'
  )

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: requestData, error: requestError } = await supabase
        .from('requests')
        .select('*')
        .eq('id', id)
        .single()

      if (requestError || !requestData || requestData.deleted) {
        navigate('/mypage?tab=buyer')
        return
      }

      if (requestData.user_id !== user?.id) {
        navigate('/mypage?tab=buyer')
        return
      }

      setRequest(requestData)

      const { data: matchData } = await supabase
        .from('matches')
        .select(`
          id,
          status,
          created_at,
          user_id,
          trip:trips!trip_id (departure_date),
          profiles:profiles!user_id (nickname)
        `)
        .eq('request_id', id)

      const formatted = (matchData ?? []).map((m) => ({
        ...m,
        profiles: Array.isArray(m.profiles)
          ? m.profiles[0] ?? null
          : m.profiles ?? null,
        trip: Array.isArray(m.trip)
          ? m.trip[0] ?? null
          : m.trip ?? null,
      }))

      setMatches(formatted)
      setLoading(false)
    }

    if (user) fetchData()
  }, [id, user, navigate])

  const handleAccept = async (selectedId: string) => {
    try {
      // 선택된 매치 정보 가져오기
      const selectedMatch = matches.find(m => m.id === selectedId);
      if (!selectedMatch) {
        alert('선택한 캐리어 정보를 찾을 수 없습니다.')
        return
      }
      
      // First update the selected match to 'accepted'
      const { error: acceptError } = await supabase
        .from('matches')
        .update({ status: 'accepted' })
        .eq('id', selectedId)
      
      if (acceptError) {
        console.error('Error accepting match:', acceptError)
        alert('선택한 캐리어를 수락하는 중 오류가 발생했습니다.')
        return
      }
      
      // 다른 매치들을 개별적으로 업데이트 (upsert 대신 개별 update 사용)
      let hasRejectionError = false;
      
      // 선택되지 않은 매치들만 필터링
      const otherMatches = matches.filter(m => m.id !== selectedId);
      
      // 각 매치를 개별적으로 업데이트
      for (const match of otherMatches) {
        const { error } = await supabase
          .from('matches')
          .update({ status: 'rejected' })
          .eq('id', match.id);
          
        if (error) {
          console.error(`Error rejecting match ${match.id}:`, error);
          hasRejectionError = true;
        }
      }
      
      if (hasRejectionError) {
        console.warn('일부 매치 거부 중 오류가 발생했습니다. 선택된 캐리어는 정상적으로 수락되었습니다.');
        // Continue anyway since the main selection succeeded
      }
      
      // Update local state
      setMatches((prev) =>
        prev.map((m) => ({
          ...m,
          status: m.id === selectedId ? 'accepted' : 'rejected',
        }))
      )
      
      // 알림 생성 코드 제거 - 데이터베이스 트리거로 대체됨
      
      alert('캐리어가 성공적으로 선택되었습니다.')
    } catch (error) {
      console.error('Error in handleAccept:', error)
      alert('처리 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  const handleDelete = async () => {
    setDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ deleted: true })
        .eq('id', id)

      if (error) throw error
      alert('요청이 삭제되었습니다.')
      navigate('/mypage?tab=buyer')
    } catch (error) {
      console.error('Error deleting request:', error)
      alert('요청 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleteConfirm(false)
    }
  }

  const handleEdit = () => {
    navigate(`/request/edit/${request?.id}`)
  }

  if (loading || !request) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-pulse text-blue-500">로딩 중...</div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-3xl space-y-8">
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={() => navigate('/mypage?tab=buyer')} 
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          마이페이지로 돌아가기
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-xl p-5 sm:p-6 border border-gray-200 transition-shadow hover:shadow-lg">
        <h2 className="text-xl sm:text-2xl font-semibold mb-5 text-gray-800 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-blue-500" />
          요청 정보
        </h2>
        <div className="space-y-3 text-gray-700 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center">
            <span className="w-24 text-gray-500 font-medium">제목</span>
            <span className="font-medium text-gray-800">{request.title}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 text-gray-500 font-medium">목적지</span>
            <span className="font-medium text-gray-800 bg-blue-50 px-2 py-1 rounded">{request.destination_city}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 text-gray-500 font-medium">수고비</span>
            <span className="font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
              {request.reward.toLocaleString()} {request.currency}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-24 text-gray-500 font-medium">수령 기간</span>
            <span className="font-medium text-gray-800">
              {dayjs(request.receive_start, 'YYYY-MM-DD').format('YYYY-MM-DD')} ~{' '}
              {dayjs(request.receive_end, 'YYYY-MM-DD').format('YYYY-MM-DD')}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {!isEditable && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <p className="text-sm text-yellow-700">매칭 지원자가 있어 요청 수정이 불가능합니다</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleEdit}
              disabled={!isEditable}
              className={`flex-1 py-2.5 px-4 rounded-md text-white transition flex items-center justify-center gap-2 ${
                isEditable ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <Pencil className="h-4 w-4" />
              수정
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 px-4 rounded-md bg-red-500 hover:bg-red-600 text-white transition flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              삭제
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2 mt-8 mb-4">
          <Briefcase className="h-5 w-5 text-blue-500" />
          지원자 목록 ({matches.length})
        </h3>
        {matches.map((m) => {
          const isAccepted = m.status === 'accepted';
          const isRejected = m.status === 'rejected';
          
          return (
            <div
              key={m.id}
              className={`border rounded-xl p-5 transition-all ${isAccepted ? 'bg-green-50 border-green-300 shadow-md' : isRejected ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isAccepted && (
                    <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      선택됨
                    </span>
                  )}
                  {isRejected && (
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      미선택
                    </span>
                  )}
                  {!isAccepted && !isRejected && (
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      대기중
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{dayjs(m.created_at).format('YYYY-MM-DD HH:mm')}</span>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-100 mb-3">
                <div className="flex items-center mb-2">
                  <span className="font-medium text-gray-800 mr-2">캐리어:</span>
                  <span className="font-medium flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {m.profiles?.nickname ?? '알 수 없음'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-800 mr-2">비행일:</span>
                  <span className="bg-blue-50 px-2 py-1 rounded text-sm">
                    {m.trip?.departure_date ? dayjs(m.trip.departure_date).format('YYYY-MM-DD') : '정보 없음'}
                  </span>
                </div>
              </div>
              <div className="flex justify-end">
                {!isAccepted && !isRejected ? (
                  <button
                    onClick={() => handleAccept(m.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    이 캐리어 선택하기
                  </button>
                ) : isAccepted ? (
                  <div className="text-green-700 font-medium flex items-center gap-2 bg-green-50 px-4 py-2 rounded-md border border-green-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    캐리어 선택 완료
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm bg-gray-100 px-3 py-1.5 rounded-md">미선택됨</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 삭제 확인 모달 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">요청 삭제 확인</h3>
            </div>
            <p className="mb-6 text-gray-700">정말 이 요청을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                취소
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}