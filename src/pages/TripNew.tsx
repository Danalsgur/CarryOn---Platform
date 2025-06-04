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

  // PNR 형식 검증 함수 (6자리 알파벳 또는 알파벳+숫자 조합)
  const validatePNR = (code: string): boolean => {
    // 6자리 알파벳 또는 알파벳+숫자 조합 정규식
    const pnrRegex = /^[A-Za-z0-9]{6}$/;
    // 최소 하나의 알파벳을 포함하는지 확인
    const hasLetter = /[A-Za-z]/.test(code);
    
    return pnrRegex.test(code) && hasLetter;
  }
  
  const handleSubmit = async () => {
    if (!departureDate || !reservationCode) {
      setError('출발 날짜와 예약번호는 필수입니다.')
      return
    }
    
    // PNR 형식 검증
    if (!validatePNR(reservationCode)) {
      setError('예약번호는 6자리 알파벳 또는 알파벳과 숫자 조합이어야 합니다.')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // ✅ 기존 여정이 등록돼 있는지 확인
    const today = new Date().toISOString().slice(0, 10)

    const { data: existingTrip, error: tripError } = await supabase
      .from('trips')
      .select('id, departure_date, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (tripError) {
      setError('기존 여정 확인 중 오류가 발생했습니다.')
      return
    }

    if (
      existingTrip &&
      existingTrip.status !== 'completed' &&
      existingTrip.status !== 'cancelled' &&
      existingTrip.departure_date >= today
    ) {
      setError('이미 등록된 여정이 있습니다. 완료되거나 취소되거나 출발일이 지나야 새로 등록할 수 있어요.')
      return
    }

    const payload = {
      user_id: user.id,
      from_city: '서울',
      to_city: toCity,
      departure_date: format(new Date(departureDate), 'yyyy-MM-dd'),
      reservation_code: reservationCode,
      status: 'active', // ✅ status 기본값 설정
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
          setValue={(value) => setReservationCode(value.toUpperCase())}
          placeholder="예: ABC123"
          maxLength={6}
        />
        <p className="text-xs text-gray-500">예약번호는 6자리 알파벳 또는 알파벳과 숫자 조합입니다.</p>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button onClick={handleSubmit}>여정 등록</Button>
      </div>
    </div>
  )
}
