function HowItWorks() {
  const steps = [
    {
      step: 'STEP 1',
      title: '여정을 등록해요',
      description: '언제, 어디로 가는지 여행 일정을 입력하고 남는 짐 공간을 공유할 준비를 합니다.',
    },
    {
      step: 'STEP 2',
      title: '배송 요청을 받아요',
      description: '해당 경로에 물건을 보내고 싶은 바이어들의 요청을 확인할 수 있어요.',
    },
    {
      step: 'STEP 3',
      title: '물건을 전달하고 보상받아요',
      description: '공항이나 현지에서 바이어에게 물건을 전달하고, 정해진 수고비를 받아요.',
    },
  ]

  return (
    <section className="bg-white py-16 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-800 mb-10">
        CarryOn은 이렇게 작동해요
      </h2>

      <div className="max-w-4xl mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-blue-50 rounded-xl p-6 text-center shadow hover:shadow-md transition space-y-3"
          >
            <div className="text-sm font-semibold text-blue-500">{step.step}</div>
            <h3 className="text-lg font-bold text-blue-700">{step.title}</h3>
            <p className="text-gray-600 text-sm">{step.description}</p>
          </div>
        ))}
      </div>

      {/* 사용자 역할 설명 섹션 */}
      <div className="mt-20">
        <h3 className="text-xl sm:text-2xl font-bold text-center text-blue-800 mb-6">
          누가 어떤 역할을 하나요?
        </h3>
        <p className="text-center text-gray-700 text-base max-w-xl mx-auto mb-10">
          CarryOn에는 두 가지 역할이 있습니다. <br className="hidden sm:block" />
          <span className="font-medium text-blue-700">바이어</span>는 받고 싶은 물건을 요청하고,
          <span className="font-medium text-blue-700"> 캐리어</span>는 여유 공간을 활용해 전달합니다.
        </p>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 text-center">
          <div className="bg-blue-50 p-6 rounded-xl shadow space-y-3 border border-blue-100">
            <h4 className="text-lg font-semibold text-blue-700">🛍️ 바이어 (Buyer)</h4>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• 받고 싶은 물건을 요청</li>
              <li>• 선택한 캐리어와 매칭 확정</li>
              <li>• 공항 또는 현지에서 전달받음</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl shadow space-y-3 border border-blue-100">
            <h4 className="text-lg font-semibold text-blue-700">✈️ 캐리어 (Carrier)</h4>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• 여행 일정을 등록</li>
              <li>• 바이어의 요청을 확인하고 매칭 신청</li>
              <li>• 물건 전달 후 수고비 수령</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
