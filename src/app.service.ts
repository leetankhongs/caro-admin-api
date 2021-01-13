import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to advanced caro api! Our passion is bring much happiness to you. This api is only for admin';
  }
}
