import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Button from '../components/Button'
import { useAuth } from '../contexts/AuthContext'

// 🔸 타입 정의
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
  matches: { id: string }[]
}

export default function Mypage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState<'buyer' | 'carrier'>('buyer')
  const [requests, setRequests] = useState<Request[]>([])
  const [trips, setTrips] = useState<Trip[]>([])

  const fetchData = async (tab: 'buyer' | 'carrier', userId: string) => {
    if (tab === 'buyer') {
      const { data } = await supabase
        .from('requests')
        .select('id, title, reward, currency, status, matches(id)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (data) setRequests(data)
    }

    if (tab === 'carrier') {
      const { data } = await supabase
        .from('trips')
        .select('id, to_city, departure_date, reservation_code, status, matches(id)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (data) setTrips(data)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    fetchData(tab, user.id)
  }, [tab, user?.id])

  useEffect(() => {
    if (!user?.id) return
    setTab((prev) => (prev === 'buyer' ? 'carrier' : 'buyer'))
    setTimeout(() => {
      setTab((prev) => (prev === 'buyer' ? 'buyer' : 'carrier'))
    }, 0)
  }, [user?.id])

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

              <div className="flex gap-2 mt-3">
                {r.matches.length === 0 && (
                  <Button size="sm" onClick={() => navigate(`/request/edit/${r.id}`)}>수정</Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    if (confirm('정말 삭제하시겠습니까?')) {
                      const { error } = await supabase
                        .from('requests')
                        .update({ deleted: true })
                        .eq('id', r.id)
                      if (error) alert(error.message)
                      else location.reload()
                    }
                  }}
                >
                  삭제
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => alert(`🛠 지원자 보기: request_id=${r.id}`)}
                >
                  지원자 보기
                </Button>
              </div>
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
            const hasMatch = trip.matches?.length > 0
            const displayStatus =
              trip.status === 'cancelled'
                ? '취소됨'
                : isPast
                  ? '출발 완료'
                  : '진행중'

            return (
              <div key={trip.id} className="p-4 border rounded-lg shadow-sm space-y-1">
                <div className="font-bold">{trip.to_city}행 여정</div>
                <div className="text-sm text-gray-600">출발: {trip.departure_date}</div>
                <div className="text-sm text-gray-400">예약번호: {trip.reservation_code || '없음'}</div>
                <div className="text-sm text-gray-500">상태: {displayStatus}</div>

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    disabled={hasMatch}
                    onClick={() => {
                      if (!hasMatch) navigate(`/trip/edit/${trip.id}`)
                    }}
                  >
                    수정
                  </Button>

                  {hasMatch && (
                    <p className="text-xs text-red-500 mt-1">※ 매칭 요청이 있어 수정할 수 없습니다.</p>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      if (confirm('이 여정을 삭제하면 매칭 요청도 함께 삭제됩니다. 정말 삭제하시겠습니까?')) {
                        const { error: matchDeleteError } = await supabase
                          .from('matches')
                          .delete()
                          .eq('trip_id', trip.id)

                        if (matchDeleteError) {
                          alert('매칭 삭제 실패: ' + matchDeleteError.message)
                          return
                        }

                        const { error: tripDeleteError } = await supabase
                          .from('trips')
                          .update({ status: 'cancelled' })
                          .eq('id', trip.id)

                        if (tripDeleteError) alert('여정 삭제 실패: ' + tripDeleteError.message)
                        else location.reload()
                      }
                    }}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
