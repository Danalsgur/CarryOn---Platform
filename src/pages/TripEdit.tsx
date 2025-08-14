import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import Button from '../components/Button'
import Input from '../components/Input'
import { AlertCircle, Trash2 } from 'lucide-react'

const DESTINATIONS = ['런던', '뉴욕', '파리']

export default function TripEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [toCity, setToCity] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [reservationCode, setReservationCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasMatch, setHasMatch] = useState(false)
  const [matchDetails, setMatchDetails] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // PNR 형식 검증 함수 (6자리 알파벳 또는 알파벳+숫자 조합)
  const validatePNR = (code: string): boolean => {
    // 6자리 알파벳 또는 알파벳+숫자 조합 정규식
    const pnrRegex = /^[A-Za-z0-9]{6}$/;
    // 최소 하나의 알파벳을 포함하는지 확인
    const hasLetter = /[A-Za-z]/.test(code);
    
    return pnrRegex.test(code) && hasLetter;
  }

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return
      
      // 여정 정보 가져오기
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
      
      // 매칭 정보 가져오기
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select(`
          id,
          status,
          request:requests!request_id(
            id,
            title,
            reward,
            currency
          )
        `)
        .eq('trip_id', id)
        .neq('status', 'cancelled')
      
      if (!matchError && matchData && matchData.length > 0) {
        const acceptedMatch = matchData.find(m => m.status === 'accepted')
        if (acceptedMatch) {
          setHasMatch(true)
          setMatchDetails(acceptedMatch)
        } else if (matchData.length > 0) {
          // 수락된 매칭은 없지만 신청 중인 매칭이 있는 경우
          setHasMatch(false)
          setMatchDetails({ pendingCount: matchData.length })
        }
      }
      
      setLoading(false)
    }

    fetchTrip()
  }, [id, navigate])

  const handleUpdate = async () => {
    if (!departureDate || !reservationCode) {
      setError('출발 날짜와 예약번호는 필수입니다.')
      return
    }
    
    // PNR 형식 검증
    if (!validatePNR(reservationCode)) {
      setError('예약번호는 6자리 알파벳 또는 알파벳과 숫자 조합이어야 합니다.')
      return
    }
    
    // 매칭된 요청이 있는 경우 수정 불가
    if (hasMatch && matchDetails?.status === 'accepted') {
      setError('매칭된 요청이 있는 여정은 수정할 수 없습니다.')
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

  // 여정 삭제 처리 함수
  const handleDelete = async () => {
    if (!id) return
    
    // 매칭된 요청이 있는 경우 삭제 불가 (수락된 매칭 또는 신청 중인 매칭 모두 포함)
    if (hasMatch || matchDetails?.pendingCount > 0) {
      setError('매칭 중인 요청이 있는 여정은 삭제할 수 없습니다. 먼저 모든 신청을 취소해주세요.')
      setShowDeleteConfirm(false)
      return
    }
    
    setDeleteLoading(true)
    
    try {
      
      // 여정 삭제
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id)
      
      if (error) {
        setError(error.message)
        setDeleteLoading(false)
      } else {
        navigate('/mypage', { replace: true })
      }
    } catch (err) {
      console.error('여정 삭제 오류:', err)
      setError('여정 삭제 중 오류가 발생했습니다.')
      setDeleteLoading(false)
    }
  }
  
  if (loading) return <div className="p-4">불러오는 중...</div>

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">여정 수정</h1>
      
      {hasMatch && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="text-amber-500 mr-2 mt-0.5" size={18} />
            <div>
              <p className="font-medium text-amber-800">매칭된 요청이 있는 여정</p>
              <p className="text-sm text-amber-700 mt-1">
                매칭된 요청이 있어 수정할 수 없습니다.
              </p>
              {matchDetails?.request && (
                <div className="mt-2 p-3 bg-white rounded border border-amber-200">
                  <p className="font-medium text-sm">매칭된 요청 정보:</p>
                  <p className="text-sm mt-1 truncate">{matchDetails.request.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {(() => {
                      const isKo = navigator.language?.toLowerCase().startsWith('ko')
                      const cur = matchDetails.request.currency
                      const amt = matchDetails.request.reward.toLocaleString()
                      if (cur === 'KRW') return `수고비: ${amt}${isKo ? '원' : ' KRW'}`
                      return `수고비: ${amt} ${cur}`
                    })()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {!hasMatch && matchDetails?.pendingCount > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="text-blue-500 mr-2 mt-0.5" size={18} />
            <div>
              <p className="font-medium text-blue-800">신청 중인 요청이 있는 여정</p>
              <p className="text-sm text-blue-700 mt-1">
                현재 {matchDetails.pendingCount}개의 신청 중인 요청이 있습니다. 여정을 수정해도 신청 정보는 유지됩니다.
              </p>
            </div>
          </div>
        </div>
      )}

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
            className={`w-full border p-2 rounded ${hasMatch ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            disabled={hasMatch}
          >
            {DESTINATIONS.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-text-primary">
            출발 날짜
          </label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            disabled={hasMatch}
            className={`w-full px-4 py-2 border border-gray-300 rounded-control shadow-control focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200 ${hasMatch ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
        </div>

        <Input
          label="예약번호"
          value={reservationCode}
          setValue={(value) => setReservationCode(value.toUpperCase())}
          placeholder="예: ABC123"
          maxLength={6}
          disabled={hasMatch}
        />
        {!hasMatch && <p className="text-xs text-gray-500 -mt-3 mb-3">예약번호는 6자리 알파벳 또는 알파벳과 숫자 조합입니다.</p>}

        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start mb-4">
            <AlertCircle className="shrink-0 w-5 h-5 mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {/* 버튼 그룹 */}
        <div className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* 마이페이지로 돌아가기 버튼 */}
            <Button 
              variant="outline" 
              className="sm:order-1 py-2.5 w-full"
              onClick={() => navigate('/mypage')}
            >
              마이페이지로 돌아가기
            </Button>
            
            {/* 수정 완료 버튼 */}
            <Button 
              onClick={handleUpdate}
              className="sm:order-2 py-2.5 w-full" 
              disabled={hasMatch || loading}
            >
              {hasMatch ? '수정 불가' : '수정 완료'}
            </Button>
          </div>
          
          {/* 삭제 버튼 - 매칭 중인 요청이 하나도 없을 때만 활성화 */}
          {(!hasMatch && !matchDetails?.pendingCount) && (
            <Button 
              variant="destructive" 
              className="w-full flex items-center justify-center gap-1 py-2.5 mt-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={16} />
              여정 삭제하기
            </Button>
          )}
        </div>
        
        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold mb-2">여정 삭제 확인</h3>
              <p className="text-gray-700 mb-4">
                정말 이 여정을 삭제하시겠습니까?
              </p>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                >
                  취소
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? '삭제 중...' : '삭제하기'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
