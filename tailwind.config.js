/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 브랜드 컬러
        brand: {
          light: '#D6EAF8',
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
        },

        // 전역 텍스트
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
          inverted: '#ffffff',
          muted: '#94A3B8',
          danger: '#EF4444',
        },

        // 배경 계열
        surface: '#ffffff',         // 카드, 입력창 배경
        background: '#F8FAFC',      // 전체 앱 배경
      },

      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui'],
      },

      borderRadius: {
        layout: '1rem',             // 카드, 섹션 기본
        control: '0.5rem',          // 입력창, 버튼 등
      },

      boxShadow: {
        card: '0 4px 12px rgba(0, 0, 0, 0.05)',
        control: '0 2px 6px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
