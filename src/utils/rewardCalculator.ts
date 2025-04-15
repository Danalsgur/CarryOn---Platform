// src/utils/rewardCalculator.ts

export type Item = {
    size: '소형' | '중형' | '대형'
    price: number
    quantity: number
  }
  
  export function calculateSuggestedReward(items: Item[]): number {
    const baseRates = {
      소형: 2000,
      중형: 4000,
      대형: 10000,
    }
  
    let sizeBased = 0
    let totalPrice = 0
  
    for (const item of items) {
      const unitReward = baseRates[item.size]
      sizeBased += unitReward * item.quantity
      totalPrice += item.price * item.quantity
    }
  
    const percentBased = totalPrice * 0.20
    const total = sizeBased + percentBased
  
    return Math.max(15000, Math.round(total))
  }
  