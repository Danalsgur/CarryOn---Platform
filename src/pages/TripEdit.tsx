import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import Input from '../components/Input'
import Button from '../components/Button'

const DESTINATIONS = ['런던', '뉴욕', '파리']

export default function TripEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [toCity, setToCity] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [reservationCode, setReservationCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        alert('여정 정보를 불러오지 못했습니다.')
        navigate('/mypage')
        return
      }

      setToCity(data.to_city)
      setDepartureDate(data.departure_date)
      setReservationCode(data.reservation_code || '')
      setLoading(false)
    }

    fetchTrip()
  }, [id, navigate])

  const handleUpdate = async () => {
    if (!departureDate || !reservationCode) {
      setError('출발 날짜와 예약번호는 필수입니다.')
      return
    }

    const today = new Date()
    const depDate = new Date(departureDate)
    const newStatus = depDate > today ? 'active' : 'completed'

    const { error } = await supabase
      .from('trips')
      .update({
        to_city: toCity,
        departure_date: departureDate,
        reservation_code: reservationCode,
        status: newStatus, // ✅ 날짜 기준으로 status 자동 설정
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      navigate('/mypage')
    }
  }

  if (loading) return <div className="p-4">불러오는 중...</div>

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">여정 수정</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">출발 도시</label>
          <input
            type="text"
            value="서울"
            disabled
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">도착 도시</label>
          <select
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            className="w-full border p-2 rounded"
          >
            {DESTINATIONS.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <Input
          label="출발 날짜"
          value={departureDate}
          setValue={setDepartureDate}
          type="date"
        />

        <Input
          label="예약번호"
          value={reservationCode}
          setValue={setReservationCode}
          placeholder="예: AB1234"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button onClick={handleUpdate}>수정 완료</Button>
      </div>
    </div>
  )
}
