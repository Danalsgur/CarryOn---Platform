// src/pages/TripNew.tsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Input from '../components/Input'
import Button from '../components/Button'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

const DEST_KEYS = ['london', 'newYork', 'paris'] as const

export default function TripNew() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [toCity, setToCity] = useState<string>('london')
  const [departureDate, setDepartureDate] = useState('')
  const [reservationCode, setReservationCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  // PNR 형식 검증 함수 (6자리 알파벳 또는 알파벳+숫자 조합)
  const validatePNR = (code: string): boolean => {
    const pnrRegex = /^[A-Za-z0-9]{6}$/
    const hasLetter = /[A-Za-z]/.test(code)
    return pnrRegex.test(code) && hasLetter
  }
  
  const handleSubmit = async () => {
    if (!departureDate || !reservationCode) {
      setError(t('tripNew.errors.requiredFields'))
      return
    }
    
    // PNR 형식 검증
    if (!validatePNR(reservationCode)) {
      setError(t('tripNew.errors.invalidPNR'))
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
      setError(t('tripNew.errors.checkExistingError'))
      return
    }

    if (
      existingTrip &&
      existingTrip.status !== 'completed' &&
      existingTrip.status !== 'cancelled' &&
      existingTrip.departure_date >= today
    ) {
      setError(t('tripNew.errors.existingTrip'))
      return
    }

    const payload = {
      user_id: user.id,
      from_city: t('cities.seoul'),
      to_city: t(`cities.${toCity}`),
      departure_date: format(new Date(departureDate), 'yyyy-MM-dd'),
      reservation_code: reservationCode,
      status: 'active',
    }

    const { error } = await supabase.from('trips').insert([payload])

    if (error) setError(error.message)
    else navigate('/mypage')
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">{t('tripNew.pageTitle')}</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('tripNew.fromCity')}</label>
          <input
            type="text"
            value={t('cities.seoul')}
            disabled
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('tripNew.toCity')}</label>
          <select
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            className="w-full border p-2 rounded"
          >
            {DEST_KEYS.map((key) => (
              <option key={key} value={key}>{t(`cities.${key}`)}</option>
            ))}
          </select>
        </div>

        <Input
          label={t('tripNew.departureDate')}
          value={departureDate}
          setValue={setDepartureDate}
          type="date"
        />

        <Input
          label={t('tripNew.reservationCode')}
          value={reservationCode}
          setValue={(value) => setReservationCode(value.toUpperCase())}
          placeholder={t('tripNew.reservationCodePlaceholder')}
          maxLength={6}
        />
        <p className="text-xs text-gray-500">{t('tripNew.reservationCodeNote')}</p>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button onClick={handleSubmit}>{t('tripNew.submit')}</Button>
      </div>
    </div>
  )
}
