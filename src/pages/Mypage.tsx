import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import Button from '../components/Button'
import { Pencil } from 'lucide-react'

type MatchItem = {
  id: string
  status?: string
  request: {
    id: string
    title: string
    reward: number
    currency: string
  } | null
}

type Request = {
  id: string
  title: string
  reward: number
  currency: string
  status?: string
  matches: { id: string }[]
}

type Trip = {
  id: string
  to_city: string
  departure_date: string
  reservation_code?: string
  status: string
  deleted?: boolean
  matches: MatchItem[]
}

export default function Mypage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const initialTab = tabParam === 'carrier' || tabParam === 'buyer' ? tabParam : 'buyer' // ✅ 기본값 지정

  const { user, profile, loading } = useAuth()
  const [tab, setTab] = useState<'buyer' | 'carrier'>(initialTab)
  const [requests, setRequests] = useState<Request[]>([])
  const [trips, setTrips] = useState<Trip[]>([])

  const fetchData = async (tab: 'buyer' | 'carrier', userId: string) => {
    if (tab === 'buyer') {
      const { data } = await supabase
        .from('requests')
        .select('id, title, reward, currency, status, matches(id)')
        .eq('user_id', userId)
        .eq('deleted', false)
        .order('created_at', { ascending: false })

      if (data) setRequests(data)
    }

    if (tab === 'carrier') {
      const { data } = await supabase
        .from('trips')
        .select(`
          id,
          to_city,
          departure_date,
          reservation_code,
          status,
          deleted,
          matches (
            id,
            status,
            request:request_id (
              id,
              title,
              reward,
              currency
            )
          )
        `)
        .eq('user_id', userId)
        .eq('deleted', false)
        .order('created_at', { ascending: false })

      if (data) {
        const normalized: Trip[] = data.map((trip): Trip => ({
          ...trip,
          matches: trip.matches.map((match): MatchItem => ({
            ...match,
            request: Array.isArray(match.request) ? match.request[0] : match.request,
          })),
        }))
        setTrips(normalized)
      }
    }
  }

  useEffect(() => {
    if (!user?.id || !tab) return
    fetchData(tab, user.id)
  }, [tab, user?.id])

  // ✅ 세션 or 프로필 로딩 중
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        마이페이지 불러오는 중...
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">마이페이지</h1>

      <div className="relative border rounded-md p-4 bg-gray-50 text-sm text-gray-700 space-y-1">
        <div><strong>이름:</strong> {profile?.name || '이름 없음'}</div>
        <div><strong>닉네임:</strong> {profile?.nickname || '닉네임 없음'}</div>
        <div><strong>이메일:</strong> {user?.email}</div>
        <div>
          <strong>가입일:</strong>{' '}
          {user?.created_at
            ? new Date(user.created_at).toLocaleDateString('ko-KR')
            : '정보 없음'}
        </div>
        <button
          onClick={() => navigate('/profile/edit')}
          className="absolute top-2 right-2 text-gray-400 hover:text-blue-600"
          aria-label="프로필 수정"
        >
          <Pencil size={16} />
        </button>
      </div>

      <div className="flex gap-2 border-b pb-2 mt-4">
        <button
          className={`px-3 py-1 rounded-t ${tab === 'buyer' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setTab('buyer')}
        >
          바이어용
        </button>
        <button
          className={`px-3 py-1 rounded-t ${tab === 'carrier' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setTab('carrier')}
        >
          캐리어용
        </button>
      </div>

      {tab === 'buyer' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-blue-700">내가 올린 요청</h2>
          {requests.length === 0 && <p className="text-sm text-gray-500">아직 등록한 요청이 없습니다.</p>}
          {requests.map((r) => (
            <div
              key={r.id}
              className="p-4 border rounded-lg shadow-sm space-y-1 cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/request/manage/${r.id}`)}
            >
              <div className="font-bold">{r.title}</div>
              <div className="text-sm text-gray-600">
                {r.reward.toLocaleString()} {r.currency}
              </div>
              <div className="text-sm text-gray-400">상태: {r.status ?? '대기중'}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'carrier' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-blue-700">내 여정 목록</h2>
          {trips.length === 0 && <p className="text-sm text-gray-500">등록한 여정이 없습니다.</p>}
          {trips.map((trip) => {
            const isPast = new Date(trip.departure_date) < new Date()
            const hasMatch = trip.matches?.some((m) => m.status !== 'cancelled')
            const displayStatus =
              trip.status === 'cancelled'
                ? '취소됨'
                : isPast
                ? '출발 완료'
                : '진행중'

            return (
              <div key={trip.id} className="p-4 border rounded-lg shadow-sm space-y-2">
                <div className="font-bold">{trip.to_city}행 여정</div>
                <div className="text-sm text-gray-600">출발: {trip.departure_date}</div>
                <div className="text-sm text-gray-400">예약번호: {trip.reservation_code || '없음'}</div>
                <div className="text-sm text-gray-500">상태: {displayStatus}</div>

                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    disabled={hasMatch}
                    onClick={() => {
                      if (!hasMatch) navigate(`/trip/edit/${trip.id}`)
                    }}
                  >
                    수정
                  </Button>
                </div>

                {hasMatch && (
                  <p className="text-xs text-red-500 mt-1">※ 매칭 요청이 있어 수정할 수 없습니다.</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
