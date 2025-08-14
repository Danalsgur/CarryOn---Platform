import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import Button from '../components/Button'
import { validateTextInput } from '../utils/contentFilter'
import { AlertCircle } from 'lucide-react'
import { addDays, format, parseISO } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'
import { DateRange, RangeKeyDict } from 'react-date-range'
import { calculateSuggestedReward } from '../utils/rewardCalculator'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

const CITIES = ['런던', '뉴욕', '파리']

const SIZE_PRESETS = [
  { key: 'small', label: '소형', volume: '~3L / 한 변 15cm 이하', examples: '화장품, 약, 에어팟', maxQuantity: 5 },
  { key: 'medium', label: '중형', volume: '3~7L / 한 변 25cm 이하', examples: '맥북, 신발, 책', maxQuantity: 3 },
  { key: 'large', label: '대형', volume: '7L 초과 / 한 변 25cm 초과', examples: '모니터, 가방', maxQuantity: 1 },
]

type Item = {
  name: string
  url: string
  price: string
  size: string
  quantity: string
}

export default function RequestEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [titleError, setTitleError] = useState<string | null>(null)
  const [destination, setDestination] = useState(CITIES[0])
  const [currency, setCurrency] = useState('KRW')
  const [reward, setReward] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [description, setDescription] = useState('')
  const [chatUrl, setChatUrl] = useState('')
  const [dateRange, setDateRange] = useState([
    {
      startDate: addDays(new Date(), 3),
      endDate: addDays(new Date(), 8),
      key: 'selection',
    },
  ])
  const [error, setError] = useState<string | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  // 제목 입력 유효성 검사
  useEffect(() => {
    if (title) {
      if (title.length > 10) {
        setTitleError(`요청 제목은 10자를 초과할 수 없습니다. (현재: ${title.length}자)`);
      } else {
        const validation = validateTextInput(title, 10, '요청 제목');
        setTitleError(validation.isValid ? null : (validation.errorMessage || null));
      }
    } else {
      setTitleError(null);
    }
  }, [title]);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) return
      const { data, error } = await supabase.from('requests').select('*').eq('id', id).single()
      if (error || !data) {
        alert('요청 정보를 불러올 수 없습니다.')
        navigate('/mypage')
        return
      }

      setTitle(data.title)
      setDestination(data.destination_city)
      setCurrency(data.currency)
      setReward(data.reward.toLocaleString())
      setItems(data.items)
      setDescription(data.description || '')
      setChatUrl(data.chat_url || '')
      setDateRange([
        {
          startDate: parseISO(data.receive_start),
          endDate: parseISO(data.receive_end),
          key: 'selection',
        },
      ])
      setLoading(false)
    }

    fetchRequest()
  }, [id, navigate])

  const updateItem = (index: number, key: keyof Item, value: string) => {
    const updated = [...items]
    updated[index][key] = value
    setItems(updated)
  }

  const removeItem = (index: number) => {
    const updated = [...items]
    updated.splice(index, 1)
    setItems(updated)
  }

  const addItem = () => {
    setItems([...items, { name: '', url: '', price: '', size: '', quantity: '' }])
  }

  const getMaxQuantityForSize = (size: string) => {
    const preset = SIZE_PRESETS.find((s) => s.label === size)
    return preset ? preset.maxQuantity : 0
  }

  const formatNumberWithComma = (num: number | string) => Number(num).toLocaleString()

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/,/g, '')) || 0
      const quantity = parseInt(item.quantity) || 1
      return total + price * quantity
    }, 0)
  }

  const getSuggestedReward = () => {
    const parsedItems = items.map((item) => ({
      size: item.size as '소형' | '중형' | '대형',
      price: parseFloat(item.price.replace(/,/g, '')) || 0,
      quantity: parseInt(item.quantity) || 0,
    }))
    return calculateSuggestedReward(parsedItems)
  }

  const handleSubmit = async () => {
    if (!title) {
      setError('요청 제목을 입력해주세요.')
      return
    }

    const titleValidation = validateTextInput(title, 10, '요청 제목')
    if (!titleValidation.isValid) {
      setError(titleValidation.errorMessage || '요청 제목이 유효하지 않습니다.')
      return
    }

    if (!reward || Number(reward.replace(/,/g, '')) < 10000) {
      setError(navigator.language?.toLowerCase().startsWith('ko') ? '수고비는 최소 10,000원 이상이어야 합니다.' : 'Reward must be at least 10,000 KRW.')
      return
    }

    const payload = {
      title,
      destination_city: destination,
      reward: Number(reward.replace(/,/g, '')),
      currency,
      items,
      receive_start: format(dateRange[0].startDate, 'yyyy-MM-dd'),
      receive_end: format(dateRange[0].endDate, 'yyyy-MM-dd'),
      description,
      chat_url: chatUrl,
    }

    const { error } = await supabase.from('requests').update(payload).eq('id', id)
    if (error) setError(error.message)
    else navigate('/mypage')
  }

  if (loading) return <div className="p-4">불러오는 중...</div>

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">요청 수정</h1>

      <div className="space-y-4">
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-text-primary">요청 제목</label>
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                const newTitle = e.target.value;
                setTitle(newTitle);
              }}
              maxLength={10}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${titleError ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-blue-300 focus:ring-blue-200'}`}
              placeholder="요청 제목을 입력하세요"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-xs text-text-secondary">{title.length}/10</span>
            </div>
          </div>
          {titleError && (
            <div className="flex items-center mt-1 text-red-500">
              <AlertCircle size={14} className="mr-1" />
              <p className="text-xs">{titleError}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-text-primary">도착 도시</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowSizeGuide(true)}
            className="text-xs text-blue-600 underline"
          >
            사이즈 가이드 보기
          </button>
        </div>

        {showSizeGuide && (
          <div className="border border-blue-200 bg-white p-4 rounded-xl text-sm text-blue-900">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">사이즈 가이드</h3>
              <button onClick={() => setShowSizeGuide(false)} className="text-blue-600 text-xs">닫기</button>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-1">구분</th>
                  <th className="py-1">부피 기준</th>
                  <th className="py-1">예시</th>
                  <th className="py-1">수량 제한</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_PRESETS.map((s) => (
                  <tr key={s.key} className="border-b">
                    <td className="py-1 font-medium">{s.label}</td>
                    <td className="py-1">{s.volume}</td>
                    <td className="py-1">{s.examples}</td>
                    <td className="py-1">최대 {s.maxQuantity}개</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div>
          <label className="block mb-1 text-sm font-medium text-text-primary">요청 품목</label>
          <div className="space-y-4">
            {items.map((item, idx) => {
              const maxQuantity = getMaxQuantityForSize(item.size)
              return (
                <div key={idx} className="relative border rounded-xl bg-white shadow p-4">
                  <div className="absolute top-2 right-2">
                    {items.length > 1 && (
                      <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <div className="font-semibold text-blue-700 mb-2">품목 {idx + 1}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      placeholder="이름 *"
                      value={item.name}
                      onChange={(e) => updateItem(idx, 'name', e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                    <input
                      placeholder="URL (선택)"
                      value={item.url}
                      onChange={(e) => updateItem(idx, 'url', e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                    <input
                      placeholder={navigator.language?.toLowerCase().startsWith('ko') ? '가격 * (원)' : 'Price * (KRW)'}
                      value={item.price}
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/[^\d]/g, '')
                        const formatted = formatNumberWithComma(Number(onlyNums))
                        updateItem(idx, 'price', formatted)
                      }}
                      className="border p-2 rounded w-full"
                    />
                    <select
                      value={item.size}
                      onChange={(e) => updateItem(idx, 'size', e.target.value)}
                      className="border p-2 rounded w-full"
                    >
                      <option value="">크기 *</option>
                      {SIZE_PRESETS.map((s) => (
                        <option key={s.key} value={s.label}>{s.label}</option>
                      ))}
                    </select>
                    <input
                      placeholder={`수량 * (최대 ${maxQuantity})`}
                      value={item.quantity}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d]/g, '')
                        if (Number(val) <= maxQuantity) updateItem(idx, 'quantity', val)
                      }}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <Button onClick={addItem} size="sm" variant="outline" className="mt-3">+ 품목 추가</Button>
          <p className="text-base font-semibold mt-4 text-right">{navigator.language?.toLowerCase().startsWith('ko') ? `총 가격: ${formatNumberWithComma(getTotalPrice())}원` : `Total: ${formatNumberWithComma(getTotalPrice())} KRW`}</p>
          <p className="text-sm text-blue-700 font-semibold text-right">
            {navigator.language?.toLowerCase().startsWith('ko') ? `추천 수고비: ${formatNumberWithComma(getSuggestedReward())}원` : `Suggested Reward: ${formatNumberWithComma(getSuggestedReward())} KRW`}
          </p>
        </div>

        <div className="flex gap-2">
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="border rounded px-2">
            <option value="KRW">₩ KRW</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
          </select>

          <input
            type="text"
            value={reward}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/[^\d]/g, '')
              const formatted = formatNumberWithComma(Number(onlyNums))
              setReward(formatted)
            }}
            className="border rounded px-3 py-2 w-full"
            placeholder="수고비 (최소 ₩15,000)"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-text-primary">수령 날짜 범위</label>
          <button onClick={() => setShowCalendar(!showCalendar)} className="flex items-center gap-2 text-blue-600 text-sm mb-2">
            <CalendarIcon size={16} /> 날짜 선택
          </button>
          {showCalendar && (
            <DateRange
              ranges={dateRange}
              onChange={(item: RangeKeyDict) => {
                const selection = item.selection!;
                setDateRange([{
                  startDate: selection.startDate || new Date(),
                  endDate: selection.endDate || new Date(),
                  key: selection.key || '',
                }])
              }}
              minDate={addDays(new Date(), 3)}
              rangeColors={['#2563eb']}
            />
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-text-primary">1:1 오픈채팅 링크</label>
          <input
            type="text"
            value={chatUrl}
            onChange={(e) => setChatUrl(e.target.value)}
            placeholder="카카오톡 오픈채팅 링크를 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-control shadow-control focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-text-primary">설명 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="추가 설명이 필요하면 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-control shadow-control focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
            rows={3}
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <Button onClick={handleSubmit} className="mt-4">
          요청 수정하기
        </Button>
      </div>
    </div>
  )
}
