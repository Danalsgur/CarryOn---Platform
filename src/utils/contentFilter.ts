// 부적절한 표현 필터링 유틸리티

// 부적절한 단어 목록 (한국어, 영어)
const inappropriateWords = [
  // 한국어 비속어/욕설
  // 직접적인 욕설
  '씨발', '시발', '시발새끼', '시발넘', '시발뇬', '시발놀',
  '병신', '병신새끼', '병신넘', '병신뇬',
  '개새끼', '개새끼야', '개새끼들', '개새끼들아',
  '지랄', '지랄하네', '지랄난', '지랄이네',
  '좀', '좀따', '좀따이', '좀뜨네',
  '새끼', '새끼야', '새끼들', '새끼들아',
  '엿먹어', '엿먹어라', '엿먹어요',
  '스팩', '스패킹', '스패킹하네',
  '사끼', '사끼넘', '사끼뇬',
  '소끼', '소끼넘', '소끼뇬',
  '시끼', '시끼넘', '시끼뇬',
  '씹끼', '씹끼넘', '씹끼뇬',
  '성기', '성기새끼', '성기넘',
  '성노예', '성노예넘', '성노예뇬',
  '성노예새끼', '성노예새끼들',
  
  // 완전한 욕설은 아니지만 부적절한 표현
  '고자', '고자넘', '고자뇬',
  '도데기', '도데기넘', '도데기뇬',
  '도데지', '도데지넘', '도데지뇬',
  '마이넘', '마이뇬',
  '머러', '머러넘', '머러뇬',
  '박아지', '박아지넘', '박아지뇬',
  '병마', '병마넘', '병마뇬',
  '사다리', '사다리넘', '사다리뇬',
  '상놈', '상놈아', '상놈이',
  '시끼넘', '시끼뇬',
  '시발넘', '시발뇬',
  '시발뇼', '시발뇼들',
  '시발뇼아', '시발뇼이',
  '시발뇼이네', '시발뇼이다',
  '시발뇼이라고', '시발뇼이야',
  '시발뇼이에요', '시발뇼이요',
  '시발뇼이지', '시발뇼이하',
  '시발뇼이하고', '시발뇼이하네',
  '시발뇼이하는', '시발뇼이하니',
  '시발뇼이하지', '시발뇼이하하',
  '시발뇼이하하고', '시발뇼이하하네',
  '시발뇼이하하는', '시발뇼이하하니',
  '시발뇼이하하지',
  
  // 영어 비속어/욕설
  // 직접적인 욕설
  'fuck', 'fucking', 'fucked', 'fucker', 'fucks', 'fuckers', 'motherfucker', 'motherfuckers', 'motherfucking',
  'shit', 'shits', 'shitting', 'shitty', 'shithead', 'shitheads', 'bullshit',
  'bitch', 'bitches', 'bitching', 'bitchy', 'son of a bitch',
  'asshole', 'assholes', 'ass', 'asses', 'asshat', 'asswipe',
  'dick', 'dicks', 'dickhead', 'dickheads',
  'bastard', 'bastards',
  'cunt', 'cunts',
  'whore', 'whores',
  'slut', 'sluts',
  'pussy', 'pussies',
  'cock', 'cocks', 'cocksucker', 'cocksuckers',
  'jerk', 'jerks', 'jerkoff',
  'prick', 'pricks',
  'twat', 'twats',
  'wanker', 'wankers',
  'douche', 'douchebag', 'douchebags',
  
  // 완전한 욕설은 아니지만 부적절한 표현
  'idiot', 'idiots', 'stupid', 'dumb', 'moron', 'morons',
  'retard', 'retarded', 'retards',
  'loser', 'losers',
  'screw you', 'screw off',
  'go to hell',
  'damn', 'damned',
  'suck', 'sucks', 'sucking',
  'wtf', 'stfu', 'gtfo', 'lmao', 'lmfao',
  'omfg', 'ffs', 'fml', 'smh', 'pos'
];

/**
 * 텍스트에 부적절한 표현이 포함되어 있는지 확인
 * @param text 검사할 텍스트
 * @returns 부적절한 표현이 포함되어 있으면 true, 아니면 false
 */
export const containsInappropriateContent = (text: string): boolean => {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  return inappropriateWords.some(word => 
    lowerText.includes(word.toLowerCase())
  );
};

/**
 * 텍스트에서 부적절한 표현을 찾아 반환
 * @param text 검사할 텍스트
 * @returns 발견된 부적절한 표현 목록, 없으면 빈 배열
 */
export const findInappropriateContent = (text: string): string[] => {
  if (!text) return [];
  
  const lowerText = text.toLowerCase();
  
  return inappropriateWords.filter(word => 
    lowerText.includes(word.toLowerCase())
  );
};

/**
 * 입력 길이 제한 검사
 * @param text 검사할 텍스트
 * @param maxLength 최대 길이
 * @returns 길이 제한을 초과하면 true, 아니면 false
 */
export const exceedsMaxLength = (text: string, maxLength: number): boolean => {
  return text.length > maxLength;
};

/**
 * 입력 유효성 검사 결과
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * 텍스트 입력 유효성 검사 (부적절한 표현 및 길이 제한)
 * @param text 검사할 텍스트
 * @param maxLength 최대 길이
 * @param fieldName 필드 이름 (에러 메시지에 사용)
 * @returns 유효성 검사 결과
 */
export const validateTextInput = (
  text: string, 
  maxLength: number, 
  fieldName: string
): ValidationResult => {
  // 부적절한 표현 검사
  const inappropriateContent = findInappropriateContent(text);
  if (inappropriateContent.length > 0) {
    return {
      isValid: false,
      errorMessage: `${fieldName}에 부적절한 표현이 포함되어 있습니다.`
    };
  }
  
  // 길이 제한 검사
  if (exceedsMaxLength(text, maxLength)) {
    return {
      isValid: false,
      errorMessage: `${fieldName}은(는) ${maxLength}자를 초과할 수 없습니다.`
    };
  }
  
  return { isValid: true };
};
