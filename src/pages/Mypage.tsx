import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import Button from '../components/Button'

type Request = {
  id: string
  title: string
  reward: number
  currency: string
  status?: string
}

type Trip = {
  id: string
  to_city: string
  departure_date: string
  reservation_code?: string
}

export default function Mypage() {
  const [tab, setTab] = useState<'buyer' | 'carrier'>('buyer')
  const [requests, setRequests] = useState<Request[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const fetchMyRequests = async () => {
      if (!userId || tab !== 'buyer') return
      const { data } = await supabase
        .from('requests')
        .select('id, title, reward, currency, status')
        .eq('user_id', userId)
      if (data) setRequests(data)
    }
    fetchMyRequests()
  }, [tab, userId])

  useEffect(() => {
    const fetchMyTrips = async () => {
      if (!userId || tab !== 'carrier') return
      const { data } = await supabase
        .from('trips')
        .select('id, to_city, departure_date, reservation_code')
        .eq('user_id', userId)
      if (data) setTrips(data)
    }
    fetchMyTrips()
  }, [tab, userId])

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">마이페이지</h1>

      <div className="flex gap-2 border-b pb-2">
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
            <div key={r.id} className="p-4 border rounded-lg shadow-sm space-y-1">
              <div className="font-bold">{r.title}</div>
              <div className="text-sm text-gray-600">
                {r.reward.toLocaleString()} {r.currency}
              </div>
              <div className="text-sm text-gray-400">상태: {r.status ?? '대기중'}</div>
              <Button
                size="sm"
                className="mt-2"
                onClick={() => alert(`🛠 지원자 보기: request_id=${r.id}`)}
              >
                지원자 보기
              </Button>
            </div>
          ))}
        </div>
      )}

      {tab === 'carrier' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-blue-700">내 여정 목록</h2>
          {trips.length === 0 && <p className="text-sm text-gray-500">등록한 여정이 없습니다.</p>}
          {trips.map((trip) => (
            <div key={trip.id} className="p-4 border rounded-lg shadow-sm space-y-1">
              <div className="font-bold">{trip.to_city}행 여정</div>
              <div className="text-sm text-gray-600">출발: {trip.departure_date}</div>
              <div className="text-sm text-gray-400">예약번호: {trip.reservation_code || '없음'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
