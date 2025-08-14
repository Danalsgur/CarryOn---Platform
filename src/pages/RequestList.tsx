import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { Calendar, MapPin, Coins, ArrowUpDown, SlidersHorizontal, Clock } from 'lucide-react'

const CITY_KEY_MAP: Record<string, string> = {
  '런던': 'london',
  '뉴욕': 'newYork',
  '파리': 'paris',
  'London': 'london',
  'New York': 'newYork',
  'Paris': 'paris',
}

type RawRequest = {
  id: string
  title: string
  destination_city: string
  reward: number
  currency: string
  receive_start: string
  receive_end: string
  status: string
  user_id: string
  created_at: string
  profiles: { nickname: string }[] | null
  matches: { id: string, status: string }[] | null
}

type Request = {
  id: string
  title: string
  destination_city: string
  reward: number
  currency: string
  receive_start: string
  receive_end: string
  status: string
  user_id: string
  created_at: string
  profiles: { nickname: string } | null
  matches: { id: string, status: string }[] | null
  hasAcceptedCarrier?: boolean
  hasApplicants?: boolean
}

export default function RequestList() {
  const { t } = useTranslation()
  const { loading: authLoading } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  
  // 필터링 옵션
  const [hideCompleted, setHideCompleted] = useState(false)
  
  // 정렬 옵션
  const [sortOption, setSortOption] = useState<'recent' | 'reward' | 'endDate'>('recent')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  
  // 도시 필터
  const [cities, setCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('')
  
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return

    const fetchRequests = async () => {
      setLoading(true)

      // 도시 목록 가져오기 (첫 로딩 시 한 번만)
      if (cities.length === 0) {
        const { data: citiesData } = await supabase
          .from('requests')
          .select('destination_city')
          .eq('deleted', false)
          .order('destination_city')
        
        if (citiesData) {
          // 기존 도시에서 중복 제거
          const existingCities = Array.from(new Set(citiesData.map(item => item.destination_city)))
          
          // 추가 도시 설정
          const additionalCities = ['뉴욕', '파리']
          
          // 기존 도시와 추가 도시 합치기 및 중복 제거
          const allCities = Array.from(new Set([...existingCities, ...additionalCities]))
          
          // 알파벳 순으로 정렬
          allCities.sort()
          
          setCities(allCities)
        }
      }

      let query = supabase
        .from('requests')
        .select(`
          id,
          title,
          destination_city,
          reward,
          currency,
          receive_start,
          receive_end,
          status,
          user_id,
          created_at,
          profiles:profiles!user_id(nickname),
          matches(id, status)
        `)
        .eq('deleted', false)

      // 매칭 완료 요청 가리기 필터링
      if (hideCompleted) {
        query = query.not('status', 'eq', 'matched')
      }
      
      // 도시 필터링
      if (selectedCity) {
        query = query.eq('destination_city', selectedCity)
      }

      const { data, error } = await query

      if (error) {
        console.error(`❌ ${t('request.loadFailed')}:`, error.message)
      } else {
        // 데이터 정규화 및 추가 속성 계산
        const result = (data as RawRequest[]).map((item): Request => {
          // 프로필 정보 정규화
          const normalizedItem = {
            ...item,
            profiles: Array.isArray(item.profiles)
              ? item.profiles[0] ?? null
              : item.profiles ?? null,
          }
          
          // 캐리어 지원 상태 계산
          // 1. 요청 status가 'matched'면 무조건 매칭 완료 상태로 처리
          // 2. 그렇지 않은 경우 matches 배열 확인
          const hasAcceptedCarrier = item.status === 'matched' || item.matches?.some(m => m.status === 'accepted') || false
          const hasApplicants = item.status !== 'matched' && ((item.matches?.length || 0) > 0)
          
          return {
            ...normalizedItem,
            hasAcceptedCarrier,
            hasApplicants
          }
        })

        // 검색 기능 제거
        let filteredResults = result
        
        // 지원자 필터링 제거

        // 정렬 적용
        if (sortOption === 'reward') {
          filteredResults.sort((a, b) => 
            sortDirection === 'desc' ? b.reward - a.reward : a.reward - b.reward
          )
        } else if (sortOption === 'endDate') {
          filteredResults.sort((a, b) => {
            const dateA = new Date(a.receive_end).getTime()
            const dateB = new Date(b.receive_end).getTime()
            return sortDirection === 'desc' ? dateB - dateA : dateA - dateB
          })
        } else { // recent
          filteredResults.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime()
            const dateB = new Date(b.created_at).getTime()
            return sortDirection === 'desc' ? dateB - dateA : dateA - dateB
          })
        }

        setRequests(filteredResults)
      }

      setLoading(false)
    }

    fetchRequests()
  }, [authLoading, hideCompleted, sortOption, sortDirection, selectedCity, cities.length])

  // 상태 배지 컴포넌트
  const StatusBadge = ({ hasApplicants, hasAcceptedCarrier }: { hasApplicants?: boolean, hasAcceptedCarrier?: boolean }) => {
    if (hasAcceptedCarrier) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1"></span>
          {t('request.matchComplete')}
        </span>
      )
    }
    
    if (hasApplicants) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1"></span>
          {t('request.hasApplicants')}
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1"></span>
        {t('request.waiting')}
      </span>
    )
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY.MM.DD')
  }

  // 정렬 방향 토글 함수
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">{t('requestList.title')}</h1>
      
      {/* 필터링 섹션 */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* 도시 필터 */}
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={16} className="text-gray-500" />
            <select
              className="border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">{t('requestList.allCities')}</option>
              {cities.map(city => {
                const key = CITY_KEY_MAP[city] || city
                const label = CITY_KEY_MAP[city] ? t(`cities.${key}`) : city
                return (
                  <option key={city} value={city}>{label}</option>
                )
              })}
            </select>
          </div>
          
          {/* 매칭 완료 요청 가리기 필터 */}
          <div className="flex items-center">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={(e) => setHideCompleted(e.target.checked)}
                className="rounded text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm">{t('requestList.hideMatched')}</span>
            </label>
          </div>
          
          {/* 정렬 옵션 - 새로운 UI */}
          <div className="flex items-center bg-gray-50 rounded-lg p-1 border">
            <button 
              onClick={() => setSortOption('recent')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${sortOption === 'recent' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            >
              <Clock size={14} className="inline mr-1" />
              {t('request.sortLatest')}
            </button>
            <button 
              onClick={() => setSortOption('reward')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${sortOption === 'reward' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            >
              <Coins size={14} className="inline mr-1" />
              {t('request.fee')}
            </button>
            <button 
              onClick={() => setSortOption('endDate')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${sortOption === 'endDate' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            >
              <Calendar size={14} className="inline mr-1" />
              {t('request.deadline')}
            </button>
            <button 
              onClick={toggleSortDirection}
              className="px-3 py-1.5 rounded text-xs font-medium ml-1 hover:bg-gray-100 transition-colors"
            >
              <ArrowUpDown size={14} className="inline" />
              {sortDirection === 'desc' ? t('request.descending') : t('request.ascending')}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-500">{t('request.noRequests')}</p>
          <p className="text-sm text-gray-400 mt-2">{t('request.changeFilters')}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => {
            // 카드 스타일 결정
            let cardStyle = "border p-4 rounded-xl bg-white shadow hover:shadow-md transition-all duration-200";
            if (req.hasAcceptedCarrier) {
              cardStyle = "border-2 border-green-500 p-4 rounded-xl bg-green-50 shadow hover:shadow-md transition-all duration-200";
            } else if (req.hasApplicants) {
              cardStyle = "border-2 border-blue-500 p-4 rounded-xl bg-blue-50 shadow hover:shadow-md transition-all duration-200";
            }
            
            const cityKey = CITY_KEY_MAP[req.destination_city]
            const cityLabel = cityKey ? t(`cities.${cityKey}`) : req.destination_city
            
            return (
              <li
                key={req.id}
                className={cardStyle}
                onClick={() => navigate(`/request/${req.id}`)}
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-semibold text-blue-800 line-clamp-1">{req.title}</h2>
                  <StatusBadge hasApplicants={req.hasApplicants} hasAcceptedCarrier={req.hasAcceptedCarrier} />
                </div>
                
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="inline mr-1 text-gray-400" />
                  <span>{cityLabel}</span>
                  <span className="mx-2">•</span>
                  <Coins size={14} className="mr-1.5" />
                  <span className="font-medium">
                    {req.reward.toLocaleString()}원
                  </span>
                </div>
                
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <Calendar size={14} className="inline mr-1 text-gray-400" />
                  <span>{t('request.receiveDate')}: {dayjs(req.receive_start).format('YYYY.MM.DD')} ~ {dayjs(req.receive_end).format('YYYY.MM.DD')}</span>
                </div>
                
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    {t('request.requester')}: {req.profiles?.nickname ?? t('common.unknown')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {dayjs(req.created_at).format('YYYY.MM.DD')} {t('request.registered')}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}      
    </div>
  )
}
