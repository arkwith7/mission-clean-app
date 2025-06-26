const fs = require('fs');
const path = require('path');

// 로그 디렉토리 생성
const logDir = path.join(__dirname, '../logs');
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true, mode: 0o777 });
  }
} catch (error) {
  console.warn('⚠️ 로그 디렉토리 생성 실패:', error.message);
}

// 로그 레벨 정의
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG');
    this.fileLoggingEnabled = true;
  }

  _shouldLog(level) {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.level];
  }

  _formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  }

  _writeToFile(level, message) {
    // 프로덕션 환경에서만 파일 로깅 시도
    if (process.env.NODE_ENV === 'production' && this.fileLoggingEnabled) {
      try {
        const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`);
        const logEntry = this._formatMessage(level, message) + '\n';
        fs.appendFileSync(logFile, logEntry);
      } catch (error) {
        // 파일 쓰기 실패 시 콘솔에만 경고하고 계속 진행
        if (this.fileLoggingEnabled) {
          console.warn('⚠️ 로그 파일 쓰기 실패 - 콘솔 로깅만 사용합니다:', error.message);
          this.fileLoggingEnabled = false;
        }
      }
    }
  }

  error(message, meta = {}) {
    if (this._shouldLog('ERROR')) {
      const formattedMessage = this._formatMessage('ERROR', message, meta);
      console.error('❌', formattedMessage);
      this._writeToFile('ERROR', message);
    }
  }

  warn(message, meta = {}) {
    if (this._shouldLog('WARN')) {
      const formattedMessage = this._formatMessage('WARN', message, meta);
      console.warn('⚠️', formattedMessage);
      this._writeToFile('WARN', message);
    }
  }

  info(message, meta = {}) {
    if (this._shouldLog('INFO')) {
      const formattedMessage = this._formatMessage('INFO', message, meta);
      console.log('ℹ️', formattedMessage);
      this._writeToFile('INFO', message);
    }
  }

  debug(message, meta = {}) {
    if (this._shouldLog('DEBUG')) {
      const formattedMessage = this._formatMessage('DEBUG', message, meta);
      console.log('🐛', formattedMessage);
      this._writeToFile('DEBUG', message);
    }
  }

  // 서버 시작/종료 등 중요한 이벤트용
  system(message, meta = {}) {
    const formattedMessage = this._formatMessage('SYSTEM', message, meta);
    console.log('🚀', formattedMessage);
    this._writeToFile('SYSTEM', message);
  }
}

module.exports = new Logger(); 