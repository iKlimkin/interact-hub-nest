import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private context: string;

  constructor() {
    console.log(`server under logger monitoring`);
  }

  setContext(context: string): string {
    return (this.context = context);
  }

  log(message: string) {
    console.log(
      `CUSTOM LOGGER ${new Date().toISOString()} LOG [${
        this.context
      }] ${message}`,
    );
  }
}
