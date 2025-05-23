import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
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
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasTrip, setHasTrip] = useState(false)
  const [matchStatus, setMatchStatus] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id ?? null
      setUserId(uid)

      const { data: req, error: reqError } = await supabase
        .from('requests')
        .select('*')
        .eq('id', id)
        .single()

      if (reqError || !req) {
        navigate('/requests')
        return
      }

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
      alert('여정을 먼저 등록해주세요.')
      navigate('/trip/new')
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
      alert('여정을 먼저 등록해주세요.')
      navigate('/trip/new')
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
    }

    alert('지원 완료! 아래 오픈채팅 링크를 통해 바이어에게 먼저 연락해보세요.')
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
      alert('취소할 매칭이 없습니다.')
      return
    }

    const { error } = await supabase
      .from('matches')
      .update({ status: 'cancelled' })
      .eq('id', match.id)

    if (error) {
      alert('지원 취소 실패: ' + error.message)
    } else {
      alert('지원이 취소되었습니다.')
      setMatchStatus(null)
    }
  }

  if (loading) return <div className="p-4">불러오는 중...</div>
  if (!request) return null

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      {/* 타이틀 & 요약 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">{request.title}</h1>
        <div className="text-sm text-gray-600">{request.destination_city} | 수고비: {request.reward.toLocaleString()} {request.currency}</div>
        <div className="text-sm text-gray-500">수령 기간: {request.receive_start} ~ {request.receive_end}</div>
      </div>

      {/* 품목 카드 */}
      <div className="p-4 bg-gray-50 border rounded-md">
        <h3 className="font-semibold mb-2 text-text-primary">요청 품목</h3>
        <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
          {request.items.map((item, i) => (
            <li key={i}>
              {item.name} - {item.price.toLocaleString()}원
              {item.quantity && ` × ${item.quantity}개`}
              {item.size && ` (${item.size})`}
            </li>
          ))}
        </ul>
      </div>

      {/* 설명 */}
      {request.description && (
        <div className="p-4 bg-white border rounded-md">
          <h3 className="font-semibold mb-2 text-text-primary">요청 설명</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.description}</p>
        </div>
      )}

      {/* 액션 버튼 */}
      {userId ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6">
          {matchStatus === 'pending' ? (
            <>
              <Button className="w-full sm:w-auto" disabled>지원 완료</Button>
              <Button className="w-full sm:w-auto" variant="outline" onClick={handleCancel}>지원 취소</Button>
            </>
          ) : (
            <Button className="w-full sm:w-auto" onClick={handleApply}>
              맡을게요
            </Button>
          )}

          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onClick={() => window.open(request.chat_url, '_blank')}
            disabled={matchStatus !== 'pending' || !request.chat_url}
          >
            오픈채팅
          </Button>
        </div>
      ) : (
        <div className="mt-6 text-sm text-gray-500">
          이 요청에 지원하려면{' '}
          <span
            className="underline cursor-pointer text-blue-600"
            onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
          >
            로그인
          </span>{' '}
          해주세요.
        </div>
      )}

      {/* 여정 미등록 시 안내문 */}
      {userId && matchStatus === null && !hasTrip && (
        <div className="mt-2 text-sm text-gray-500">
          이 요청을 맡으려면 먼저{' '}
          <span
            className="underline text-blue-600 cursor-pointer"
            onClick={() => navigate('/trip/new')}
          >
            여정을 등록
          </span>
          해주세요.
        </div>
      )}

      {/* 작성자 알림 */}
      {isOwner && (
        <div className="mt-10 text-sm text-blue-700 border-t pt-4">
          이 요청은 내가 등록한 거예요. 매칭 확정 기능은 곧 추가됩니다.
        </div>
      )}
    </div>
  )
}
