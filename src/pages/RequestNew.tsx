// src/pages/RequestNew.tsx

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Input from '../components/Input'
import Button from '../components/Button'
import { addDays, format } from 'date-fns'
import { CalendarIcon, HelpCircle, X, AlertCircle } from 'lucide-react'
import { DateRange } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { validateTextInput } from '../utils/contentFilter'
import { calculateSuggestedReward } from '../utils/rewardCalculator'
import { useTranslation } from 'react-i18next'

const CITIES = ['런던', '뉴욕', '파리']

function formatNumberWithComma(num: number | string) {
  return Number(num).toLocaleString()
}

export type Item = {
  name: string
  url: string
  price: string
  size: string
  quantity: string
}

export default function RequestNew() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [titleError, setTitleError] = useState<string | null>(null)
  const [destination, setDestination] = useState(CITIES[0])
  const [currency, setCurrency] = useState('KRW')
  const [reward, setReward] = useState('')
  const [items, setItems] = useState<Item[]>([{ name: '', url: '', price: '', size: '', quantity: '' }])
  const [description, setDescription] = useState('')
  const [chatUrl, setChatUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<[{ startDate: Date; endDate: Date; key: string }]>([
    {
      startDate: addDays(new Date(), 3),
      endDate: addDays(new Date(), 8),
      key: 'selection',
    },
  ])
  const [showCalendar, setShowCalendar] = useState(false)
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  const SIZE_PRESETS = useMemo(() => ([
    {
      key: 'small',
      label: t('requestNew.sizeGuide.small.label'),
      volume: t('requestNew.sizeGuide.small.volume'),
      examples: t('requestNew.sizeGuide.small.examples'),
      maxQuantity: 5,
    },
    {
      key: 'medium',
      label: t('requestNew.sizeGuide.medium.label'),
      volume: t('requestNew.sizeGuide.medium.volume'),
      examples: t('requestNew.sizeGuide.medium.examples'),
      maxQuantity: 3,
    },
    {
      key: 'large',
      label: t('requestNew.sizeGuide.large.label'),
      volume: t('requestNew.sizeGuide.large.volume'),
      examples: t('requestNew.sizeGuide.large.examples'),
      maxQuantity: 1,
    },
  ]), [t])

  const addItem = () => {
    setItems([...items, { name: '', url: '', price: '', size: '', quantity: '' }])
  }

  const removeItem = (index: number) => {
    const updated = [...items]
    updated.splice(index, 1)
    setItems(updated)
  }

  const updateItem = (index: number, key: keyof Item, value: string) => {
    const updated = [...items]
    updated[index][key] = value
    setItems(updated)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/,/g, '')) || 0
      const quantity = parseInt(item.quantity) || 1
      return total + price * quantity
    }, 0)
  }

  const getMaxQuantityForSize = (size: string) => {
    const preset = SIZE_PRESETS.find((s) => s.label === size)
    return preset ? preset.maxQuantity : 0
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
      setError(t('requestNew.errors.titleRequired'))
      return
    }

    // 제목 유효성 (길이 10자)
    if (title.length > 10) {
      setError(t('validation.maxLength', { field: t('requestNew.requestTitle'), length: 10 }))
      return
    }

    const titleValidation = validateTextInput(title, 10, t('requestNew.requestTitle'))
    if (!titleValidation.isValid) {
      setError(t('requestNew.errors.titleInvalid'))
      return
    }

    if (!reward || Number(reward.replace(/,/g, '')) < 15000) {
      setError(t('requestNew.errors.rewardMinimum'))
      return
    }

    if (!chatUrl || !chatUrl.includes('open.kakao.com')) {
      setError(t('requestNew.errors.chatLinkRequired'))
      return
    }

    const invalidItems = items.some(item => !item.name || !item.price || !item.size || !item.quantity)
    if (invalidItems) {
      setError(t('validation.requiredFields'))
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
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

    const { error } = await supabase.from('requests').insert([payload])
    if (error) setError(error.message)
    else navigate('/mypage')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">{t('requestNew.pageTitle')}</h1>

      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-text-primary">{t('requestNew.requestTitle')}</label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                const newTitle = e.target.value;
                setTitle(newTitle);

                if (newTitle.length > 10) {
                  setTitleError(t('validation.maxLength', { field: t('requestNew.requestTitle'), length: 10 }));
                } else {
                  const validation = validateTextInput(newTitle, 10, t('requestNew.requestTitle'));
                  setTitleError(validation.isValid ? null : (t('requestNew.errors.titleInvalid')));
                }
              }}
              maxLength={10}
              placeholder={t('requestNew.titlePlaceholder')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${titleError ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
            />
            {title.length > 0 && (
              <div className="absolute right-3 top-2.5 text-xs text-gray-500">
                {title.length}/10
              </div>
            )}
          </div>
          {titleError && (
            <div className="flex items-start gap-1 text-xs text-red-500">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{titleError}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-text-primary">{t('requestNew.destination')}</label>
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
            {t('requestNew.viewSizeGuide', { defaultValue: 'View Size Guide' })}
          </button>
        </div>

        {showSizeGuide && (
          <div className="border border-blue-200 bg-white p-4 rounded-xl text-sm text-blue-900">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">{t('requestNew.sizeGuideTitle', { defaultValue: 'Size Guide' })}</h3>
              <button onClick={() => setShowSizeGuide(false)} className="text-blue-600 text-xs">{t('common.cancel')}</button>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-1">{t('requestNew.itemFields.size')}</th>
                  <th className="py-1">{t('requestNew.sizeGuide.small.volume').split('/')[0] ? t('requestNew.sizeGuide.small.volume').split('/')[0] : t('requestNew.sizeGuide.small.volume')}</th>
                  <th className="py-1">{t('requestNew.itemFields.name')}</th>
                  <th className="py-1">{t('requestNew.itemFields.quantity')}</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_PRESETS.map((s) => (
                  <tr key={s.key} className="border-b">
                    <td className="py-1 font-medium">{s.label}</td>
                    <td className="py-1">{s.volume}</td>
                    <td className="py-1">{s.examples}</td>
                    <td className="py-1">{t('validation.maxLength', { field: t('requestNew.itemFields.quantity'), length: s.maxQuantity }).replace(' characters', '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div>
          <label className="block mb-1 text-sm font-medium text-text-primary">{t('requestNew.items')}</label>
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
                  <div className="font-semibold text-blue-700 mb-2">{t('requestNew.items')} {idx + 1}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      placeholder={`${t('requestNew.itemFields.name')} *`}
                      value={item.name}
                      onChange={(e) => updateItem(idx, 'name', e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                    <input
                      placeholder={t('requestNew.itemFields.url')}
                      value={item.url}
                      onChange={(e) => updateItem(idx, 'url', e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                    <input
                      placeholder={`${t('requestNew.itemFields.price')} *`}
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
                      <option value="">{t('requestNew.itemFields.size')} *</option>
                      {SIZE_PRESETS.map((s) => (
                        <option key={s.key} value={s.label}>{s.label}</option>
                      ))}
                    </select>
                    <input
                      placeholder={`${t('requestNew.itemFields.quantity')} * (${t('validation.maxLength', { field: '', length: maxQuantity }).replace(' characters', '')})`}
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
          <Button onClick={addItem} size="sm" variant="outline" className="mt-3">{t('requestNew.addItem')}</Button>
          <p className="text-base font-semibold mt-4 text-right">{t('requestNew.totalPrice', { price: formatNumberWithComma(getTotalPrice()) })}</p>
          <p className="text-sm text-blue-700 font-semibold text-right">
            {t('requestNew.suggestedReward', { price: formatNumberWithComma(getSuggestedReward()) })}
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
            placeholder={t('requestNew.rewardPlaceholder')}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-text-primary">{t('requestNew.receiveDateRange')}</label>
          <button onClick={() => setShowCalendar(!showCalendar)} className="flex items-center gap-2 text-blue-600 text-sm mb-2">
            <CalendarIcon size={16} /> {t('requestNew.selectDate')}
          </button>
          {showCalendar && (
            <DateRange
              ranges={dateRange}
              onChange={(item) => {
                const selection = item.selection!;
                setDateRange([{
                  startDate: selection.startDate || new Date(),
                  endDate: selection.endDate || new Date(),
                  key: selection.key || '',
                }]);
              }}
              minDate={addDays(new Date(), 3)}
              rangeColors={["#2563eb"]}
            />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-text-primary">{t('requestNew.chatLink')}</label>
          </div>
          
          <input
            type="text"
            value={chatUrl}
            onChange={(e) => setChatUrl(e.target.value)}
            placeholder={t('requestNew.chatLinkPlaceholder')}
            className="border rounded px-3 py-2 w-full"
          />
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
            <div className="flex items-start gap-2">
              <HelpCircle size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-700 mb-1">{t('requestNew.chatLinkGuide.title')}</p>
                <ol className="list-decimal pl-5 space-y-1 text-blue-800">
                  <li>{t('requestNew.chatLinkGuide.step1')}</li>
                  <li>{t('requestNew.chatLinkGuide.step2')}</li>
                  <li>{t('requestNew.chatLinkGuide.step3')}</li>
                  <li>{t('requestNew.chatLinkGuide.step4')}</li>
                  <li>{t('requestNew.chatLinkGuide.step5')}</li>
                </ol>
                <p className="mt-2 text-blue-700">{t('requestNew.chatLinkGuide.note')}</p>
              </div>
            </div>
          </div>
        </div>

        <Input label={t('requestNew.description')} value={description} setValue={setDescription} />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <Button onClick={handleSubmit} className="mt-4">
          {t('requestNew.submit')}
        </Button>
      </div>
    </div>
  )
}
