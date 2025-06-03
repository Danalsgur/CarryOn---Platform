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
            // 매칭 상태 확인
            const hasAcceptedMatch = trip.matches?.some((m) => m.status === 'accepted')
            const hasPendingMatch = trip.matches?.some((m) => m.status === 'pending')
            
            // 카드 스타일 결정
            let cardStyle = "p-4 border rounded-lg shadow-sm space-y-2 bg-white hover:shadow-md transition-all duration-200";
            if (hasAcceptedMatch) {
              cardStyle = "p-4 border-2 border-green-500 rounded-lg shadow-sm space-y-2 bg-green-50 hover:shadow-md transition-all duration-200";
            } else if (hasPendingMatch) {
              cardStyle = "p-4 border-2 border-blue-500 rounded-lg shadow-sm space-y-2 bg-blue-50 hover:shadow-md transition-all duration-200";
            }

            return (
              <div 
                key={trip.id} 
                className={`${cardStyle} cursor-pointer`} 
                onClick={() => navigate(`/trip/edit/${trip.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold text-lg text-blue-800">{trip.to_city}행 여정</div>
                  {/* 상태 배지 */}
                  <div className="inline-flex items-center">
                    {hasAcceptedMatch ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        매칭됨
                      </span>
                    ) : hasPendingMatch ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        신청중 {trip.matches.filter(m => m.status === 'pending').length}개
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        대기중
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mt-2">출발: {dayjs(trip.departure_date).format('YYYY-MM-DD')}</div>
                
                {/* 매칭된 요청 정보 표시 - 모든 매칭 표시 */}
                {hasAcceptedMatch && (() => {
                  const acceptedMatches = trip.matches.filter(m => m.status === 'accepted' && m.request);
                  if (acceptedMatches.length === 0) return null;
                  
                  // 총 수고비 계산
                  const totalReward = acceptedMatches.reduce((sum, match) => {
                    return sum + (match.request?.reward || 0);
                  }, 0);
                  
                  return (
                    <div className="mt-2 text-sm border-t pt-2 border-green-200 space-y-2">
                      {/* 총 수고비 표시 */}
                      <div className="flex justify-between items-center font-medium text-green-800 bg-green-50 p-2 rounded">
                        <span>총 수고비</span>
                        <span>{totalReward.toLocaleString()}원</span>
                      </div>
                      
                      {/* 매칭된 요청 목록 */}
                      <div className="space-y-1.5">
                        {acceptedMatches.map((match, index) => (
                          <div key={match.id} className="flex items-center justify-between">
                            <a 
                              href={`/request/${match.request?.id}`} 
                              className="text-blue-600 hover:underline font-medium truncate max-w-[70%]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {index + 1}. {match.request?.title}
                            </a>
                            <span className="text-sm font-medium text-green-700">
                              {match.request?.reward.toLocaleString()}원
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 수정 버튼 제거됨 */}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
