import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // 백엔드에서 번역 파일을 로드하기 위한 i18next 백엔드 사용
  .use(Backend)
  // 브라우저의 언어 설정을 감지
  .use(LanguageDetector)
  // i18next를 react-i18next와 연결
  .use(initReactI18next)
  // i18next 초기화
  .init({
    // 백엔드 설정
    backend: {
      // 번역 파일 경로
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    // 지원하는 언어 목록
    supportedLngs: ['ko', 'en'],
    // 기본 언어
    fallbackLng: 'ko',
    // 디버깅 모드 (개발 중에만 true로 설정)
    debug: import.meta.env.DEV,
    // 네임스페이스
    ns: ['translation'],
    defaultNS: 'translation',
    // 보간법 설정
    interpolation: {
      // React는 이미 XSS 공격으로부터 안전하므로 escapeValue를 false로 설정
      escapeValue: false,
    },
    // 언어 감지 옵션
    detection: {
      // 언어 감지 순서
      order: ['localStorage', 'navigator'],
      // localStorage에 언어 설정 저장
      caches: ['localStorage'],
    },
    // 언어 변경 시 페이지 새로고침 방지
    react: {
      useSuspense: true,
    },
  });

export default i18n;
