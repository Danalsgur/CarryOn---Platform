export function validateEmail(value: string): string | undefined {
  if (!value) {
    return '이메일을 입력해주세요'
  }
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
    return '유효한 이메일 주소를 입력해주세요'
  }
}

export function validatePassword(value: string): string | undefined {
  if (!value) {
    return '비밀번호를 입력해주세요'
  }
  if (value.length < 6) {
    return '비밀번호는 6자 이상이어야 합니다'
  }
}

export function validateRequired(value: string): string | undefined {
  if (!value) {
    return '필수 입력 항목입니다'
  }
}

export function validatePhoneNumber(value: string): string | undefined {
  if (!value) {
    return '전화번호를 입력해주세요'
  }
  if (!/^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/.test(value)) {
    return '유효한 전화번호를 입력해주세요'
  }
}

export function validateNickname(value: string): string | undefined {
  if (!value) {
    return '닉네임을 입력해주세요'
  }
  if (value.length < 2 || value.length > 20) {
    return '닉네임은 2~20자 사이여야 합니다'
  }
  if (!/^[가-힣a-zA-Z0-9]+$/.test(value)) {
    return '닉네임은 한글, 영문, 숫자만 사용할 수 있습니다'
  }
} 