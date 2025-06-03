// 🔹 Redesigned RequestManage.tsx with cleaner card UI

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import dayjs from 'dayjs'

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
    // 삭제 확인 대화상자 표시
    const isConfirmed = window.confirm('정말 이 요청을 삭제하시겠습니까? 삭제된 요청은 목록에서 사라집니다.')
    
    // 사용자가 취소를 누른 경우
    if (!isConfirmed) return
    
    const { error } = await supabase
      .from('requests')
      .update({ deleted: true })
      .eq('id', request?.id)

    if (!error) {
      alert('요청이 성공적으로 삭제되었습니다.')
      navigate('/mypage?tab=buyer')
    } else {
      alert('요청 삭제 중 오류가 발생했습니다. 다시 시도해주세요.')
      console.error('Delete error:', error)
    }
  }

  const handleEdit = () => {
    navigate(`/request/edit/${request?.id}`)
  }

  if (loading || !request) return <div className="p-4">Loading...</div>

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">요청 정보</h2>
        <div className="space-y-2 text-gray-700">
          <p><strong>제목:</strong> {request.title}</p>
          <p><strong>목적지:</strong> {request.destination_city}</p>
          <p><strong>수고비:</strong> {request.reward.toLocaleString()} {request.currency}</p>
          <p>
            <strong>수령 기간:</strong>{' '}
            {dayjs(request.receive_start, 'YYYY-MM-DD').format('YYYY-MM-DD')} ~{' '}
            {dayjs(request.receive_end, 'YYYY-MM-DD').format('YYYY-MM-DD')}
          </p>
        </div>

        <div className="mt-6 space-y-1">
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              disabled={!isEditable}
              className={`flex-1 py-2 rounded text-white transition ${
                isEditable ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
            >
              삭제
            </button>
          </div>
          {!isEditable && (
            <p className="text-sm text-gray-500 mt-1">매칭 지원자가 있어 요청 수정이 불가능합니다</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">지원자 목록 ({matches.length})</h3>
        {matches.map((m) => {
          const isAccepted = m.status === 'accepted';
          const isRejected = m.status === 'rejected';
          
          return (
            <div
              key={m.id}
              className={`border shadow-sm rounded-lg p-4 flex justify-between items-center ${isAccepted ? 'bg-green-50 border-green-300' : isRejected ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'}`}
            >
              <div className="text-gray-700 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {isAccepted && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      선택됨
                    </span>
                  )}
                  {isRejected && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      미선택
                    </span>
                  )}
                </div>
                <p><strong>닉네임:</strong>{' '}
                  <a href={`/profile/${m.user_id}`} className="text-blue-600 hover:underline">
                    {m.profiles?.nickname ?? '알 수 없음'}
                  </a>
                </p>
                <p><strong>비행일:</strong> {m.trip?.departure_date ? dayjs(m.trip.departure_date).format('YYYY-MM-DD') : '정보 없음'}</p>
                <p><strong>매칭 시간:</strong> {dayjs(m.created_at).format('YYYY-MM-DD HH:mm')}</p>
              </div>
              {!isAccepted && !isRejected ? (
                <button
                  onClick={() => handleAccept(m.id)}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  선택
                </button>
              ) : isAccepted ? (
                <div className="text-green-700 font-medium flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  캐리어 선택 완료
                </div>
              ) : (
                <span className="text-gray-500 text-sm">미선택됨</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}