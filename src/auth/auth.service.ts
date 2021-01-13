import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserData } from 'src/users/users.interface';
import * as bcrypt from 'bcryptjs';
import { userRoles } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<UserData> {
    const user = await this.usersService.findOneByUsername(username);
    if (
      user &&
      bcrypt.compareSync(password, user.password) &&
      user.role === userRoles.admin &&user.status===true
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: UserData) {
    const payload = { email: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
