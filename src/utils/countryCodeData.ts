// 국가 코드 데이터
export interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const countryCodes: CountryCode[] = [
  {
    code: 'KR',
    name: '대한민국',
    dialCode: '+82',
    flag: '🇰🇷'
  },
  {
    code: 'US',
    name: '미국',
    dialCode: '+1',
    flag: '🇺🇸'
  },
  {
    code: 'JP',
    name: '일본',
    dialCode: '+81',
    flag: '🇯🇵'
  },
  {
    code: 'CN',
    name: '중국',
    dialCode: '+86',
    flag: '🇨🇳'
  },
  {
    code: 'GB',
    name: '영국',
    dialCode: '+44',
    flag: '🇬🇧'
  },
  {
    code: 'CA',
    name: '캐나다',
    dialCode: '+1',
    flag: '🇨🇦'
  },
  {
    code: 'AU',
    name: '호주',
    dialCode: '+61',
    flag: '🇦🇺'
  },
  {
    code: 'DE',
    name: '독일',
    dialCode: '+49',
    flag: '🇩🇪'
  },
  {
    code: 'FR',
    name: '프랑스',
    dialCode: '+33',
    flag: '🇫🇷'
  },
  {
    code: 'SG',
    name: '싱가포르',
    dialCode: '+65',
    flag: '🇸🇬'
  },
  {
    code: 'HK',
    name: '홍콩',
    dialCode: '+852',
    flag: '🇭🇰'
  },
  {
    code: 'TW',
    name: '대만',
    dialCode: '+886',
    flag: '🇹🇼'
  }
];

// 국가 코드로 국가 정보 찾기
export const getCountryByCode = (code: string): CountryCode | undefined => {
  return countryCodes.find(country => country.code === code);
};

// 기본 국가 코드
export const DEFAULT_COUNTRY_CODE = 'KR';
