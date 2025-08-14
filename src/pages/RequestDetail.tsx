import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../supabase'
import Button from '../components/Button'

type Item = {
  name: string
  price: number
  size?: string
  quantity?: number
}

type Request = {
  id: string
  title: string
  destination_city: string
  reward: number
  currency: string
  receive_start: string
  receive_end: string
  items: Item[]
  description?: string
  chat_url?: string
  buyer_id?: string
}

export default function RequestDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation() // ✅ 현재 경로 파악용

  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasTrip, setHasTrip] = useState(false)
  const [matchStatus, setMatchStatus] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isRequestMatched, setIsRequestMatched] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id ?? null
      setUserId(uid)

      const { data: req, error: reqError } = await supabase
        .from('requests')
        .select('*, matches(id, status)')
        .eq('id', id)
        .single()

      if (reqError || !req) {
        navigate('/requests')
        return
      }

      // 요청이 이미 매칭 완료 상태인지 확인
      setIsRequestMatched(req.status === 'matched')
      
      setRequest(req as Request)

      if (uid) {
        setIsOwner(req.buyer_id === uid)

        const { data: trip } = await supabase
          .from('trips')
          .select('id')
          .eq('user_id', uid)
          .eq('deleted', false)
          .not('status', 'eq', 'cancelled')
          .maybeSingle()

        setHasTrip(!!trip)

        const { data: match } = await supabase
          .from('matches')
          .select('id, status')
          .eq('request_id', id)
          .eq('user_id', uid)
          .maybeSingle()

        if (match && match.status !== 'cancelled') {
          setMatchStatus(match.status)
        } else {
          setMatchStatus(null)
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [id, navigate])

  const handleApply = async () => {
    if (!hasTrip) {
      alert(t('request.registerTripFirst'))
      navigate('/trip/new')
      return
    }
    
    if (isRequestMatched) {
      alert(t('request.alreadyMatched'))
      return
    }

    if (!userId || !request) return

    const { data: myTrip } = await supabase
      .from('trips')
      .select('id')
      .eq('user_id', userId)
      .eq('deleted', false)
      .not('status', 'eq', 'cancelled')
      .limit(1)
      .single()

    if (!myTrip) {
      alert(t('request.registerTripFirst'))
      navigate('/trip/new')
      return
    }

    // 요청 상태 서버에서 다시 확인
    const { data: currentRequest } = await supabase
      .from('requests')
      .select('status')
      .eq('id', request.id)
      .single()
      
    if (currentRequest?.status === 'matched') {
      alert(t('request.alreadyMatched'))
      setIsRequestMatched(true)
      return
    }
    
    const { data: existingMatch } = await supabase
      .from('matches')
      .select('id, status')
      .eq('request_id', request.id)
      .eq('user_id', userId)
      .maybeSingle()

    if (existingMatch) {
      await supabase
        .from('matches')
        .update({ status: 'pending' })
        .eq('id', existingMatch.id)
    } else {
      await supabase.from('matches').insert({
        request_id: request.id,
        trip_id: myTrip.id,
        user_id: userId,
        status: 'pending'
      })
      
      // 알림은 데이터베이스 트리거를 통해 자동으로 생성됨
    }

    alert(t('request.applicationSuccessful'))
    setMatchStatus('pending')
  }

  const handleCancel = async () => {
    if (!userId || !request) return

    const { data: match } = await supabase
      .from('matches')
      .select('id')
      .eq('request_id', request.id)
      .eq('user_id', userId)
      .maybeSingle()

    if (!match) {
      alert(t('request.noMatchingToCancel'))
      return
    }

    const { error } = await supabase
      .from('matches')
      .update({ status: 'cancelled' })
      .eq('id', match.id)

    if (error) {
      alert(t('request.cancelFailed', { message: error.message }))
    } else {
      alert(t('request.cancelSuccess'))
      setMatchStatus(null)
    }
  }

  if (loading) return <div className="p-6 text-text-muted">불러오는 중...</div>
  if (!request) return null

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 py-8 space-y-6">
      {/* 타이틀 & 요약 */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-text-primary">{request.title}</h1>
        <div className="text-sm text-text-secondary">{request.destination_city} | {t('request.fee')}: {request.reward.toLocaleString()} {request.currency}</div>
        <div className="text-sm text-text-muted">{t('request.receiveDate')}: {request.receive_start} ~ {request.receive_end}</div>
      </div>

      {/* 품목 카드 */}
      <div className="p-4 bg-background border rounded-layout shadow-card">
        <h3 className="text-lg font-semibold mb-3 text-text-primary">{t('request.items')}</h3>
        <ul className="list-disc ml-5 space-y-2 text-sm text-text-secondary">
          {request.items.map((item, i) => (
            <li key={i}>
              {(() => { const isKo = navigator.language?.toLowerCase().startsWith('ko'); const amt = item.price.toLocaleString(); return isKo ? `${item.name} - ${amt}원` : `${item.name} - ${amt} KRW`; })()}
              {item.quantity && ` × ${item.quantity}개`}
              {item.size && ` (${item.size})`}
            </li>
          ))}
        </ul>
      </div>

      {/* 설명 */}
      {request.description && (
        <div className="p-4 bg-surface border rounded-layout shadow-card">
          <h3 className="text-lg font-semibold mb-3 text-text-primary">{t('request.description')}</h3>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{request.description}</p>
        </div>
      )}

      {/* 액션 버튼 */}
      {userId ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-8">
          {matchStatus === 'pending' ? (
            <>
              <Button className="w-full sm:w-auto" disabled>{t('request.applicationComplete')}</Button>
              <Button className="w-full sm:w-auto" variant="outline" onClick={handleCancel}>{t('request.cancelApplication')}</Button>
            </>
          ) : isRequestMatched ? (
            <div className="flex flex-col w-full sm:w-auto gap-2">
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-control border border-red-100 font-medium">
                <p>{t('request.alreadyMatched')}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col w-full sm:w-auto gap-2">
              <Button 
                className="w-full sm:w-auto" 
                onClick={handleApply} 
                disabled={!hasTrip}
              >
                {t('request.applyAsCarrier')}
              </Button>
              {!hasTrip && (
                <div className="text-xs text-brand bg-brand-light/20 p-2 rounded-control border border-brand/20">
                  <p>{t('request.registerTripFirst')}</p>
                  <button 
                    onClick={() => navigate('/trip/new')} 
                    className="text-brand hover:text-brand-dark font-medium underline mt-1"
                  >
                    {t('request.goToRegisterTrip')} →
                  </button>
                </div>
              )}
            </div>
          )}

          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onClick={() => window.open(request.chat_url, '_blank')}
            disabled={matchStatus !== 'pending' || !request.chat_url}
          >
            {t('request.openChat')}
          </Button>
        </div>
      ) : (
        <div className="mt-8 p-4 bg-background rounded-layout border text-text-secondary text-sm">
          {t('request.loginToApply')}{' '}
          <span
            className="text-brand hover:text-brand-dark cursor-pointer transition-colors duration-200"
            onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
          >
            {t('auth.login')}
          </span>
        </div>
      )}

      {/* 작성자 알림 */}
      {isOwner && (
        <div className="mt-10 text-sm text-brand border-t pt-4">
          {t('request.myRequest')} {t('request.matchingFeatureSoon')}
        </div>
      )}
    </div>
  )
}
