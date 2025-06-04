// 부적절한 표현 필터링 유틸리티

// 부적절한 단어 목록 (한국어, 영어)
const inappropriateWords = [
  // 한국어 비속어/욕설 (실제 구현 시 더 많은 단어 추가 필요)
  '씨발', '병신', '개새끼', '지랄', '좆', '새끼', '엿먹어',
  // 영어 비속어/욕설 (실제 구현 시 더 많은 단어 추가 필요)
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'bastard'
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
