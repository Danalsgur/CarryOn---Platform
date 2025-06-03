import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import Button from '../components/Button'
import dayjs from 'dayjs'
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

type RequestMatch = {
  id: string
  status?: string
  user_id?: string
  created_at?: string
  profiles?: any // 수정: 다양한 형태를 허용하도록 any 타입으로 변경
  profile?: { nickname?: string } | null
}

type Request = {
  id: string
  title: string
  reward: number
  currency: string
  status?: string
  matches: RequestMatch[]
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

  const { user, loading } = useAuth()
  const [tab, setTab] = useState<'buyer' | 'carrier'>(initialTab)
  const [requests, setRequests] = useState<Request[]>([])
  const [trips, setTrips] = useState<Trip[]>([])

  const fetchData = async (tab: 'buyer' | 'carrier', userId: string) => {
    if (tab === 'buyer') {
      const { data } = await supabase
        .from('requests')
        .select(`
          id, 
          title, 
          reward, 
          currency, 
          status, 
          matches(
            id, 
            status, 
            user_id,
            created_at,
            profiles:profiles!user_id(nickname)
          )
        `)
        .eq('user_id', userId)
        .eq('deleted', false)
        .order('created_at', { ascending: false })

      // 데이터 정규화 - RequestManage와 동일한 방식으로 처리
      const normalizedData = data?.map(request => ({
        ...request,
        matches: request.matches.map(match => ({
          ...match,
          profiles: Array.isArray(match.profiles)
            ? match.profiles[0] ?? null
            : match.profiles ?? null
        }))
      }));

      console.log('Normalized request data:', normalizedData);
      if (normalizedData) setRequests(normalizedData)
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-text-primary">마이페이지</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1"
        >
          <Pencil size={14} />
          회원 정보 관리
        </Button>
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
          {requests.map((r) => {
            // 캐리어가 선택된 요청인지 확인 (matches 배열에 accepted 상태인 항목이 있는지)
            const hasAcceptedCarrier = r.matches?.some(m => m.status === 'accepted');
            // 캐리어 지원자가 있는지 확인
            const hasApplicants = r.matches?.length > 0;
            
            // 요청 상태에 따른 배경색과 테두리 색상 결정
            let cardClasses = "p-4 border rounded-lg shadow-sm space-y-1 cursor-pointer";
            if (hasAcceptedCarrier) {
              cardClasses += " bg-green-50 border-green-300 hover:bg-green-100";
            } else if (hasApplicants) {
              cardClasses += " bg-blue-50 border-blue-200 hover:bg-blue-100";
            } else {
              cardClasses += " hover:bg-gray-50";
            }
            
            return (
              <div
                key={r.id}
                className={cardClasses}
                onClick={() => navigate(`/request/manage/${r.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold">{r.title}</div>
                  {hasAcceptedCarrier && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      캐리어 선택 완료
                    </span>
                  )}
                  {!hasAcceptedCarrier && hasApplicants && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      지원자 있음
                    </span>
                  )}
                  {!hasApplicants && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      대기중
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {r.reward.toLocaleString()} {r.currency}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  {hasAcceptedCarrier ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      캐리어 선택 완료
                    </>
                  ) : hasApplicants ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      지원자 검토 필요
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      지원자 대기중
                    </>
                  )}
                </div>
                
                {/* 선택된 캐리어 정보 표시 */}
                {hasAcceptedCarrier && (
                  <div className="mt-2 text-sm border-t pt-2 border-green-200">
                    {(() => {
                      // 선택된 캐리어 찾기
                      const acceptedCarrier = r.matches.find(m => m.status === 'accepted');
                      if (!acceptedCarrier) return null;
                      
                      return (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-green-700">선택된 캐리어:</span> 
                            <a 
                              href={`/profile/${acceptedCarrier.user_id}`} 
                              className="text-blue-600 hover:underline font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {acceptedCarrier.profiles?.nickname ?? '알 수 없음'}
                            </a>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            매칭 시간: {dayjs(acceptedCarrier.created_at).format('YYYY-MM-DD HH:mm')}
                          </div>
                        </>
                      );
                    })()} 
                  </div>
                )}
              </div>
            );
          })}
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
