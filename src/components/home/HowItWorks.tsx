// src/components/home/HowItWorks.tsx

function HowItWorks() {
    const steps = [
      {
        title: '1. 여정을 등록하세요',
        description: '여행 계획을 등록하고 짐 공간을 공유할 준비를 하세요.',
      },
      {
        title: '2. 요청을 받아보세요',
        description: '다른 사용자가 해당 경로에 배송을 요청합니다.',
      },
      {
        title: '3. 물건을 전달하고 보상 받기',
        description: '요청자와 매칭되면 물건을 전달하고, 보상을 받습니다.',
      },
    ]
  
    return (
      <section className="bg-white py-16 px-4">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-10">
          CarryOn은 이렇게 작동해요
        </h2>
  
        <div className="max-w-4xl mx-auto grid gap-8 sm:grid-cols-1 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-blue-50 rounded-xl p-6 text-center shadow hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-blue-700 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    )
  }
  
  export default HowItWorks
  