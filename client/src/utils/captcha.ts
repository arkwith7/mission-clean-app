// 간단한 수학 CAPTCHA 생성 및 검증
export interface CaptchaChallenge {
  question: string;
  answer: number | string;
  id: string;
}

// 수학 문제 생성
export const generateMathCaptcha = (): CaptchaChallenge => {
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operations = ['+', '-', '×'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let answer: number;
  let question: string;
  
  switch (operation) {
    case '+': {
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
      break;
    }
    case '-': {
      const [larger, smaller] = num1 >= num2 ? [num1, num2] : [num2, num1];
      answer = larger - smaller;
      question = `${larger} - ${smaller} = ?`;
      break;
    }
    case '×': {
      answer = num1 * num2;
      question = `${num1} × ${num2} = ?`;
      break;
    }
    default: {
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
    }
  }
  
  return {
    question,
    answer,
    id: Math.random().toString(36).substring(2, 9)
  };
};

// CAPTCHA 검증
export const verifyCaptcha = (userAnswer: string, correctAnswer: number): boolean => {
  const parsed = parseInt(userAnswer.trim());
  return !isNaN(parsed) && parsed === correctAnswer;
};

// 한글 CAPTCHA (더 간단한 버전)
export const generateKoreanCaptcha = (): CaptchaChallenge => {
  const questions = [
    { question: "사과를 영어로 하면?", answer: "apple" },
    { question: "우리나라의 수도는?", answer: "서울" },
    { question: "일주일은 며칠?", answer: "7" },
    { question: "1년은 몇 개월?", answer: "12" },
    { question: "무지개의 색깔은 몇 가지?", answer: "7" }
  ];
  
  const selected = questions[Math.floor(Math.random() * questions.length)];
  
  return {
    question: selected.question,
    answer: selected.answer,
    id: Math.random().toString(36).substring(2, 9)
  };
};

export const verifyKoreanCaptcha = (userAnswer: string, correctAnswer: number | string): boolean => {
  const cleaned = userAnswer.trim().toLowerCase();
  const correct = correctAnswer.toString().toLowerCase();
  return cleaned === correct;
}; 