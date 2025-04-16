// src/pages/TripNew.tsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Input from '../components/Input'
import Button from '../components/Button'
import { format } from 'date-fns'

const DESTINATIONS = ['런던', '뉴욕', '파리']

export default function TripNew() {
  const navigate = useNavigate()
  const [toCity, setToCity] = useState(DESTINATIONS[0])
  const [departureDate, setDepartureDate] = useState('')
  const [reservationCode, setReservationCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!departureDate || !reservationCode) {
      setError('출발 날짜와 예약번호는 필수입니다.')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const payload = {
      user_id: user.id,
      from_city: '서울',
      to_city: toCity,
      departure_date: format(new Date(departureDate), 'yyyy-MM-dd'),
      reservation_code: reservationCode,
    }

    const { error } = await supabase.from('trips').insert([payload])

    if (error) setError(error.message)
    else navigate('/mypage')
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">여정 등록</h1>

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

        <Button onClick={handleSubmit}>여정 등록</Button>
      </div>
    </div>
  )
}
