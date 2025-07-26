import { Injectable, LoggerService as NestLogger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLogger {
  private readonly logDir = path.join(__dirname, '../../../logs');
  private readonly logFilePath = path.join(this.logDir, 'app.log');

  constructor() {
    // Eğer logs klasörü yoksa oluştur
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(message: any, context?: string) {
    this.writeLog('LOG', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.writeLog('ERROR', message, context, trace);
  }

  warn(message: any, context?: string) {
    this.writeLog('WARN', message, context);
  }

  debug?(message: any, context?: string) {
    this.writeLog('DEBUG', message, context);
  }

  verbose?(message: any, context?: string) {
    this.writeLog('VERBOSE', message, context);
  }

  private writeLog(
    level: string,
    message: any,
    context?: string,
    trace?: string,
  ) {
    const now = new Date();

    const pad = (n: number) => n.toString().padStart(2, '0');

    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const logFileName = `app-${dateStr}_${timeStr}.log`;
    const fullPath = path.join(this.logDir, logFileName);

    const logMessage = `[${now.toISOString()}] [${level}] ${context || ''} ${
      typeof message === 'string' ? message : JSON.stringify(message)
    }${trace ? '\nStack: ' + trace : ''}`;

    try {
      fs.appendFileSync(fullPath, logMessage + '\n', { encoding: 'utf8' });
    } catch (err) {
      console.error('Log dosyasına yazarken hata oluştu:', err);
    }
  }
}
