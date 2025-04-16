import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

type Request = {
  id: string
  title: string
  destination_city: string
  reward: number
  currency: string
  receive_start: string
  receive_end: string
  status: string
}

export default function RequestList() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompleted, setShowCompleted] = useState(false)
  const [sortByReward, setSortByReward] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true)

      let query = supabase
        .from('requests')
        .select('*')
        .eq('deleted', false)

      if (!showCompleted) {
        query = query.neq('status', 'matched')
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ 요청 불러오기 실패:', error.message)
      } else {
        let result = data as Request[]

        if (sortByReward) {
          result = result.sort((a, b) => b.reward - a.reward)
        }

        setRequests(result)
      }

      setLoading(false)
    }

    fetchRequests()
  }, [showCompleted, sortByReward])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">요청 리스트</h1>

      <div className="flex gap-3 items-center mb-4 text-sm">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          매칭 완료 요청도 보기
        </label>

        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={sortByReward}
            onChange={(e) => setSortByReward(e.target.checked)}
          />
          수고비 높은 순 정렬
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">불러오는 중...</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li
              key={req.id}
              className="border p-4 rounded-xl bg-white shadow hover:bg-gray-50 cursor-pointer transition"
              onClick={() => navigate(`/requests/${req.id}`)}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-blue-800">{req.title}</h2>
                <span className="text-sm text-gray-500">
                  {req.reward.toLocaleString()} {req.currency}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">도시: {req.destination_city}</p>
              <p className="text-xs text-gray-500 mt-1">
                {req.receive_start} ~ {req.receive_end}
              </p>
              <p className="text-xs text-gray-400">상태: {req.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
