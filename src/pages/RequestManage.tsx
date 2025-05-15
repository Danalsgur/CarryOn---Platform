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
    const selectedMatch = matches.find((m) => m.id === selectedId)

    if (!selectedMatch) return

    // 1. 선택된 캐리어: accepted
    const { error: acceptError } = await supabase
      .from('matches')
      .update({ status: 'accepted' })
      .eq('id', selectedId)

    // 2. 나머지 캐리어들: rejected
    const rejectedIds = matches.filter((m) => m.id !== selectedId).map((m) => m.id)
    const { error: rejectError } = await supabase
      .from('matches')
      .update({ status: 'rejected' })
      .in('id', rejectedIds)

    // 3. 요청 상태 matched로 변경
    const { error: requestError } = await supabase
      .from('requests')
      .update({ status: 'matched' })
      .eq('id', request?.id)

    if (!acceptError && !rejectError && !requestError) {
      setMatches((prev) =>
        prev.map((m) => ({
          ...m,
          status: m.id === selectedId ? 'accepted' : 'rejected',
        }))
      )
    }
  }

  const handleDelete = async () => {
    const { error } = await supabase
      .from('requests')
      .update({ deleted: true })
      .eq('id', request?.id)

    if (!error) navigate('/mypage?tab=buyer')
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
        {matches.map((m) => (
          <div
            key={m.id}
            className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 flex justify-between items-center"
          >
            <div className="text-gray-700">
              <p><strong>닉네임:</strong>{' '}
                <a href={`/profile/${m.user_id}`} className="text-blue-600 hover:underline">
                  {m.profiles?.nickname ?? '알 수 없음'}
                </a>
              </p>
              <p><strong>출국일:</strong> {m.trip?.departure_date ? dayjs(m.trip.departure_date).format('YYYY-MM-DD') : '정보 없음'}</p>
              <p><strong>매칭 시간:</strong> {dayjs(m.created_at).format('YYYY-MM-DD HH:mm')}</p>
            </div>
            <button
              onClick={() => handleAccept(m.id)}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              선택
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
