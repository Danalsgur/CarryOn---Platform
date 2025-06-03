import { Plane, Search, MessageCircle, Package, Wallet } from 'lucide-react'

function HowItWorks() {
  const steps = [
    {
      step: 'STEP 1',
      title: '여정을 등록해요',
      description: '언제, 어디로 가는지 여행 일정을 입력하고, 남는 짐 공간을 공유할 준비를 합니다.',
      icon: <Plane size={24} />
    },
    {
      step: 'STEP 2',
      title: '요청을 살펴보고 골라요',
      description: '내 여정과 맞는 배송 요청을 확인하고, 맡고 싶은 요청을 직접 선택합니다.',
      icon: <Search size={24} />
    },
    {
      step: 'STEP 3',
      title: '바이어와 소통해요',
      description: '오픈채팅을 통해 바이어와 물건 내용, 전달 방식 등을 협의합니다.',
      icon: <MessageCircle size={24} />
    },
    {
      step: 'STEP 4',
      title: '물건을 준비해요',
      description: '직접 구매하거나, 바이어가 보내준 물건을 받아 전달 준비를 마칩니다.',
      icon: <Package size={24} />
    },
    {
      step: 'STEP 5',
      title: '전달하고 수고비를 받아요',
      description: '공항이나 현지에서 바이어에게 물건을 전달하고, 정해진 수고비를 받아요.',
      icon: <Wallet size={24} />
    },
  ]

  return (
    <section className="py-16 bg-surface">
      <h2 className="text-2xl font-bold text-center text-text-primary mb-8">
        CarryOn은 이렇게 작동해요
      </h2>

      <div className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-brand-light/20 rounded-layout p-6 text-center shadow-card hover:shadow-lg transition-all duration-200 space-y-4 hover:translate-y-[-2px]"
          >
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                {step.icon}
              </div>
            </div>
            <div className="text-sm font-semibold text-brand">{step.step}</div>
            <h3 className="text-lg font-bold text-brand-dark">{step.title}</h3>
            <p className="text-text-secondary text-sm">{step.description}</p>
          </div>
        ))}
      </div>

      {/* 사용자 역할 설명 섹션 */}
      <div className="mt-20">
        <h3 className="text-2xl font-bold text-center text-text-primary mb-6">
          누가 어떤 역할을 하나요?
        </h3>
        <p className="text-center text-text-secondary text-base max-w-xl mx-auto mb-6">
          CarryOn에서는 <span className="font-medium text-brand">바이어</span>와
          <span className="font-medium text-brand"> 캐리어</span>가 각자의 방식으로 협력합니다.
        </p>

        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8 text-center">
          <div className="bg-surface p-6 rounded-layout shadow-card border border-gray-200 space-y-4 hover:shadow-lg transition-all duration-200 hover:border-brand/30">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-brand">
                <Package size={28} />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-brand">바이어 (Buyer)</h4>
            <ul className="text-text-secondary text-sm space-y-3">
             <li className="flex items-start gap-2">
               <div className="min-w-[20px] flex justify-center mt-0.5 text-brand">
                 <Package size={16} />
               </div>
               <span>받고 싶은 물건을 요청하고, 수고비를 제시해요</span>
             </li>
             <li className="flex items-start gap-2">
               <div className="min-w-[20px] flex justify-center mt-0.5 text-brand">
                 <MessageCircle size={16} />
               </div>
               <span>캐리어와 오픈채팅으로 소통하고 매칭을 확정해요</span>
             </li>
             <li className="flex items-start gap-2">
               <div className="min-w-[20px] flex justify-center mt-0.5 text-brand">
                 <Wallet size={16} />
               </div>
               <span>공항이나 현지에서 물건을 전달받아요</span>
             </li>
            </ul>
          </div>
          <div className="bg-surface p-6 rounded-layout shadow-card border border-gray-200 space-y-4 hover:shadow-lg transition-all duration-200 hover:border-brand/30">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-brand">
                <Plane size={28} />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-brand">캐리어 (Carrier)</h4>
            <ul className="text-text-secondary text-sm space-y-3">
              <li className="flex items-start gap-2">
                <div className="min-w-[20px] flex justify-center mt-0.5 text-brand">
                  <Plane size={16} />
                </div>
                <span>본인의 여행 일정을 등록해요</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-[20px] flex justify-center mt-0.5 text-brand">
                  <Search size={16} />
                </div>
                <span>요청 목록에서 원하는 요청을 골라 매칭해요</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-[20px] flex justify-center mt-0.5 text-brand">
                  <Wallet size={16} />
                </div>
                <span>바이어와 소통하고, 전달 후 수고비를 받아요</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
