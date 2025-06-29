// 서버 측 CAPTCHA 검증 유틸리티
const crypto = require('crypto');

// 수학 CAPTCHA 생성
const generateMathCaptcha = () => {
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operations = ['+', '-', '×'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let answer;
  let question;
  
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
    id: crypto.randomBytes(4).toString('hex')
  };
};

// CAPTCHA 검증
const verifyCaptcha = (userAnswer, correctAnswer) => {
  const parsed = parseInt(userAnswer.toString().trim());
  return !isNaN(parsed) && parsed === parseInt(correctAnswer);
};

// 한글 CAPTCHA 생성
const generateKoreanCaptcha = () => {
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
    id: crypto.randomBytes(4).toString('hex')
  };
};

const verifyKoreanCaptcha = (userAnswer, correctAnswer) => {
  const cleaned = userAnswer.toString().trim().toLowerCase();
  const correct = correctAnswer.toString().toLowerCase();
  return cleaned === correct;
};

module.exports = {
  generateMathCaptcha,
  verifyCaptcha,
  generateKoreanCaptcha,
  verifyKoreanCaptcha
}; 