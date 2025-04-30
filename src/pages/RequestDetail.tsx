import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasTrip, setHasTrip] = useState(false)
  const [hasMatched, setHasMatched] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      const uid = user.id
      setUserId(uid)

      console.log('👤 userId:', uid)

      const { data: req, error: reqError } = await supabase
        .from('requests')
        .select('*')
        .eq('id', id)
        .single()

      if (reqError) {
        console.error('❌ 요청 가져오기 실패:', reqError.message)
        navigate('/requests')
        return
      }

      if (!req) {
        navigate('/requests')
        return
      }

      setRequest(req as Request)
      setIsOwner(req.buyer_id === uid)

      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('id')
        .eq('user_id', uid)
        .maybeSingle()

      if (tripError) {
        console.error('❌ 여정 확인 실패:', tripError.message)
      } else {
        console.log('🧳 여정 확인됨:', trip)
      }

      setHasTrip(!!trip)

      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('id')
        .eq('request_id', id)
        .eq('user_id', uid)
        .maybeSingle()

      if (matchError) {
        console.error('❌ 매치 확인 실패:', matchError.message)
      }

      setHasMatched(!!match)
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
      .limit(1)
      .single()

    if (!myTrip) {
      alert('여정을 먼저 등록해주세요.')
      navigate('/trip/new')
      return
    }

    const { error } = await supabase.from('matches').insert({
      request_id: request.id,
      trip_id: myTrip.id,
      user_id: userId,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('지원 완료! 바이어가 확인하면 연락이 올 거예요.')
      setHasMatched(true)
      navigate('/mypage')
    }
  }

  if (loading) return <div className="p-4">불러오는 중...</div>
  if (!request) return null

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">{request.title}</h1>
      <p className="text-sm text-gray-600">도시: {request.destination_city}</p>
      <p className="text-sm text-gray-600">수고비: {request.reward.toLocaleString()} {request.currency}</p>
      <p className="text-sm text-gray-600">수령 기간: {request.receive_start} ~ {request.receive_end}</p>

      <div>
        <h3 className="font-semibold mt-4 mb-2">요청 품목</h3>
        <ul className="list-disc ml-4 space-y-1 text-sm text-gray-700">
          {request.items.map((item, i) => (
            <li key={i}>
              {item.name} - {item.price.toLocaleString()}원
              {item.quantity && ` × ${item.quantity}개`}
              {item.size && ` (${item.size})`}
            </li>
          ))}
        </ul>
      </div>

      {request.description && (
        <div>
          <h3 className="font-semibold mt-4 mb-1">요청 설명</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.description}</p>
        </div>
      )}

      <div className="space-x-4 mt-6">
        <Button
          onClick={handleApply}
          disabled={!hasTrip || hasMatched}
        >
          {hasMatched ? '이미 지원함' : hasTrip ? '맡을게요' : '여정이 필요함'}
        </Button>

        <Button
          variant="outline"
          onClick={() => window.open(request.chat_url, '_blank')}
          disabled={!hasMatched || !request.chat_url}
        >
          오픈채팅
        </Button>
      </div>

      {isOwner && (
        <div className="mt-10 text-sm text-blue-700 border-t pt-4">
          이 요청은 내가 등록한 거예요. 매칭 확정 기능은 곧 추가됩니다.
        </div>
      )}
    </div>
  )
}
