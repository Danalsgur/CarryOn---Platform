import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import Button from '../components/Button'
import dayjs from 'dayjs'
import { Pencil, ShoppingBag, Briefcase, Package, PlusCircle, Plane } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type MatchItem = {
  id: string
  status?: string
  user_id?: string
  created_at?: string
  profiles?: { nickname?: string } | null
  request: {
    id: string
    title: string
    reward: number
    currency: string
    user_id?: string
    profiles?: { nickname?: string } | null
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
  const { t } = useTranslation()

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
            user_id,
            created_at,
            profiles:profiles!user_id(nickname),
            request:request_id (
              id,
              title,
              reward,
              currency,
              user_id,
              profiles:profiles!user_id(nickname)
            )
          )
        `)
        .eq('user_id', userId)
        .eq('deleted', false)
        .order('created_at', { ascending: false })

      if (data) {
        console.log('Raw trip data:', data);
        const normalized: Trip[] = data.map((trip): Trip => ({
          ...trip,
          matches: trip.matches.map((match): MatchItem => {
            console.log('Match data:', match);
            return {
              ...match,
              // 요청 정보 정규화
              request: Array.isArray(match.request) ? {
                ...match.request[0],
                // request.profiles도 정규화
                profiles: Array.isArray(match.request[0]?.profiles) 
                  ? match.request[0]?.profiles[0] || null
                  : match.request[0]?.profiles || null
              } : match.request,
              // 프로필 정보 정규화
              profiles: Array.isArray(match.profiles)
                ? (match.profiles[0] as { nickname?: string } | null) ?? null
                : match.profiles ?? null
            };
          }),
        }));
        console.log('Normalized trip data:', normalized);
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
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6">
      <div className="flex flex-row items-center justify-between mb-2 sm:mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">마이페이지</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1.5 text-sm border border-gray-300 px-3 py-1.5 rounded-md"
        >
          <Pencil size={15} />
          프로필 수정
        </Button>
      </div>

      <div className="mt-4 sm:mt-6 mb-6 sm:mb-8">
        <div className="flex border-b overflow-x-auto">
          <button
            className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-3 font-medium text-sm transition-all duration-200 relative ${tab === 'buyer' 
              ? 'text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setTab('buyer')}
          >
            <ShoppingBag size={18} />
            <span>{t('mypage.tabs.buyer')}</span>
            {tab === 'buyer' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
            )}
          </button>
          <button
            className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-3 font-medium text-sm transition-all duration-200 relative ${tab === 'carrier' 
              ? 'text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setTab('carrier')}
          >
            <Briefcase size={18} />
            <span>{t('mypage.tabs.carrier')}</span>
            {tab === 'carrier' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
            )}
          </button>
        </div>
      </div>

      {tab === 'buyer' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-blue-700">{t('mypage.buyer.myRequests')}</h2>
          {requests.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 sm:py-10 px-3 sm:px-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="bg-blue-100 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
                <Package size={28} className="text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-1 sm:mb-2">{t('mypage.buyer.noRequests')}</h3>
              <p className="text-xs sm:text-sm text-gray-500 text-center mb-4 sm:mb-6 max-w-md">
                {t('mypage.buyer.noRequestsDesc')}
              </p>
              <Button
                onClick={() => navigate('/request/new')}
                className="flex items-center gap-1.5 sm:gap-2 text-sm px-3 py-1.5 sm:px-4 sm:py-2"
              >
                <PlusCircle size={16} />
                {t('mypage.buyer.createNewRequest')}
              </Button>
            </div>
          )}
          {requests.map((r) => {
            // 캐리어가 선택된 요청인지 확인 (matches 배열에 accepted 상태인 항목이 있는지)
            const hasAcceptedCarrier = r.matches?.some(m => m.status === 'accepted');
            // 캐리어 지원자가 있는지 확인 (pending 상태인 매칭만 포함)
            const hasApplicants = r.matches?.some(m => m.status === 'pending');
            
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
                className={`${cardClasses} transition-all duration-200 hover:shadow-md`}
                onClick={() => navigate(`/request/manage/${r.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold">{r.title}</div>
                  {hasAcceptedCarrier && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {t('mypage.buyer.carrierSelected')}
                    </span>
                  )}
                  {!hasAcceptedCarrier && hasApplicants && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {t('mypage.buyer.hasApplicants')}
                    </span>
                  )}
                  {!hasApplicants && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {t('mypage.buyer.waiting')}
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
                      {t('mypage.buyer.carrierSelected')}
                    </>
                  ) : hasApplicants ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {t('mypage.buyer.reviewNeeded')}
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      {t('mypage.buyer.waitingForApplicants')}
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
                            <span className="font-medium text-green-700">{t('mypage.buyer.selectedCarrier')}:</span> 
                            <a 
                              href={`/profile/${acceptedCarrier.user_id}`} 
                              className="text-blue-600 hover:underline font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {acceptedCarrier.profiles?.nickname ?? t('mypage.buyer.noName')}
                            </a>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {t('mypage.buyer.matchingTime')}: {dayjs(acceptedCarrier.created_at).format('YYYY-MM-DD HH:mm')}
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
          <h2 className="text-lg font-semibold text-blue-700">{t('mypage.carrier.myTrips')}</h2>
          {trips.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 sm:py-10 px-3 sm:px-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="bg-blue-100 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
                <Plane size={28} className="text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-1 sm:mb-2">{t('mypage.carrier.noTrips')}</h3>
              <p className="text-xs sm:text-sm text-gray-500 text-center mb-4 sm:mb-6 max-w-md">
                {t('mypage.carrier.noTripsDesc')}
              </p>
              <Button
                onClick={() => navigate('/trip/new')}
                className="flex items-center gap-1.5 sm:gap-2 text-sm px-3 py-1.5 sm:px-4 sm:py-2"
              >
                <PlusCircle size={16} />
                {t('mypage.carrier.createNewTrip')}
              </Button>
            </div>
          )}
          {trips.map((trip) => {
            // 매칭 상태 확인
            const hasAcceptedMatch = trip.matches?.some((m) => m.status === 'accepted')
            // pending 상태인 매칭만 지원자 있음으로 표시 (cancelled 상태는 제외)
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
                className={cardStyle}
                onClick={() => navigate(`/trip/edit/${trip.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold text-lg text-blue-800 cursor-pointer hover:text-blue-600 transition-colors duration-150 ease-in-out py-1">{t('mypage.carrier.tripToCity', { city: trip.to_city })}</div>
                  {/* 상태 배지 */}
                  <div className="inline-flex items-center">
                    {hasAcceptedMatch ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        {t('mypage.carrier.matched')}
                      </span>
                    ) : hasPendingMatch ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {t('mypage.carrier.pendingCount', { count: trip.matches.filter(m => m.status === 'pending').length })}
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        {t('mypage.carrier.waiting')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mt-2 mb-3 pb-2 border-b border-gray-200 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-150 ease-in-out -mx-2">
                  <span className="font-medium">{t('mypage.carrier.departure')}:</span> {dayjs(trip.departure_date).format('YYYY-MM-DD')}
                </div>
                
                {/* 매칭된 요청 정보 표시 */}
                {hasAcceptedMatch && (() => {
                  const acceptedMatches = trip.matches.filter(m => m.status === 'accepted' && m.request);
                  if (acceptedMatches.length === 0) return null;
                  
                  // 총 수고비 계산
                  const totalReward = acceptedMatches.reduce((sum, match) => {
                    return sum + (match.request?.reward || 0);
                  }, 0);
                  
                  return (
                    <div className="mt-2 text-sm space-y-2 bg-green-50 p-3 rounded-lg border border-green-200">
                      {/* 총 수고비 표시 */}
                      <div className="mt-3 text-sm font-medium text-gray-700 flex items-center justify-between">
                        <span>{t('mypage.carrier.totalReward')}</span>
                        <span className="text-lg font-bold text-green-700">{(() => { const isKo = navigator.language?.toLowerCase().startsWith('ko'); const c = trip.matches[0]?.request?.currency; const amt = totalReward.toLocaleString(); if (c === 'KRW') return isKo ? `${amt}원` : `${amt} KRW`; return `${amt} ${c || ''}` })()}</span>
                      </div>
                      
                      {/* 매칭된 요청 목록 */}
                      <div className="space-y-1.5">
                        <div className="text-sm font-medium text-green-800 mb-1">{t('mypage.carrier.matchedRequests')}:</div>
                        {acceptedMatches.map((match, index) => (
                          <div key={match.id} className="flex items-center justify-between mb-2">
                            <Link 
                              to={`/request/${match.request?.id}`} 
                              className="text-blue-600 hover:bg-blue-100 font-medium truncate max-w-[70%] px-3 py-2 rounded-md flex items-center transition-colors duration-150 ease-in-out flex-grow mr-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-xs">{index + 1}</span>
                              <span className="truncate">{match.request?.title}</span>
                            </Link>
                            <span className="text-sm font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                              {(() => { const isKo = navigator.language?.toLowerCase().startsWith('ko'); const c = match.request?.currency; const amt = match.request?.reward?.toLocaleString() || '0'; if (c === 'KRW') return isKo ? `${amt}원` : `${amt} KRW`; return `${amt} ${c || ''}` })()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                
                {/* 신청 중인 요청 정보 표시 */}
                {hasPendingMatch && (() => {
                  const pendingMatches = trip.matches.filter(m => m.status === 'pending' && m.request);
                  if (pendingMatches.length === 0) return null;
                  
                  return (
                    <div className="mt-2 text-sm space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-800 mb-1">{t('mypage.carrier.pendingRequests', { count: pendingMatches.length })}:</div>
                      <div className="space-y-1.5">
                        {pendingMatches.map((match) => (
                          <div key={match.id} className="flex flex-col bg-blue-50 p-3 rounded mb-2">
                            <div className="flex items-center justify-between">
                              <Link 
                                to={`/request/${match.request?.id}`} 
                                className="text-blue-700 hover:bg-blue-200 font-medium truncate max-w-[70%] px-3 py-2 rounded-md flex items-center transition-colors duration-150 ease-in-out flex-grow mr-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="bg-blue-200 text-blue-800 rounded-md px-2 py-1 mr-2 text-xs font-medium">{t('mypage.carrier.pending')}</span>
                                <span className="truncate">{match.request?.title}</span>
                              </Link>
                              <span className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                                {(() => { const isKo = navigator.language?.toLowerCase().startsWith('ko'); const c = match.request?.currency; const amt = match.request?.reward?.toLocaleString() || '0'; if (c === 'KRW') return isKo ? `${amt}원` : `${amt} KRW`; return `${amt} ${c || ''}` })()}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1 flex items-center">
                              <span className="mr-1">{t('mypage.carrier.requester')}:</span>
                              <span className="font-medium">
                                {match.request?.profiles?.nickname || t('mypage.carrier.noName')}
                              </span>
                              <span className="mx-1 text-gray-400">•</span>
                              <span className="text-gray-500">
                                {match.created_at ? new Date(match.created_at).toLocaleDateString() : ''}
                              </span>
                            </div>
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
