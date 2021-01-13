import { Injectable, HttpStatus } from '@nestjs/common';
// import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { RanksService } from 'src/ranks/ranks.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly ranksService:RanksService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    const { username, name, password, email } = createUserDto;
    const queryBuilder = getRepository(User)
      .createQueryBuilder('user')
      .where('user.username = :username', { username });
    const queryBuilderCheckEmail = getRepository(User)
      .createQueryBuilder('user')
      .where('user.email = :email AND user.isActive=1', { email });
    const user = await queryBuilder.getOne();
    const userTemp = await queryBuilderCheckEmail.getOne();
    if (user) {
      return { err: 'Username đã được sử dụng' };
    }
    if (userTemp) {
      return { err: 'Email đã được sử dụng' };
    }
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashPassword = bcrypt.hashSync(password, salt);
    const token = this.jwtService.sign({ email: email });
    const newUser = new User();
    newUser.username = username;
    newUser.password = hashPassword;
    newUser.email = email;
    newUser.name = name;
    newUser.token = token;

    const savedUser = await this.usersRepository.save(newUser);
    console.log(savedUser);
    const html =
      '<p>Bạn vừa thực hiện yêu cầu reset password tại Advanced caro của Khoa Huy Hưng, nếu đó là bạn : <p><li><a href="http://localhost:3001/active/' +
      token +
      '"><b>Nhấn vào đây để kích hoạt tài khoản</b></a></li>';
    // Vì mail api free nên vui lòng k test với tần suất cao để k bị gg khóa tài khoản hoặc mail bị chuyển vào quảng cáo, mất công tạo lại
    //return "Đăng ký thành công. Truy cập http://localhost:3000/active/" + token + ' kích hoạt tài khoản'; //comment dòng này để test
    this.mailService.SendMail(
      email,
      '[Advanced Caro] - Kích hoạt tại khoản',
      html,
    ); //mở dòng này để test
    return 'Đăng ký thành công. Kiểm tra email để tiến hành kích hoạt tài khoản';
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOneById(id: number): Promise<User> {
    return await this.usersRepository.findOne(id);
  }

  async findOneByToken(token: string): Promise<User> {
    return await this.usersRepository.findOne({ token });
  }

  async findOneByUsername(username: string): Promise<User> {
    return await this.usersRepository.findOne({ username });
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({ email });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const toUpdate = await this.usersRepository.findOne(id);

    const updated = Object.assign(toUpdate, updateUserDto);
    return await this.usersRepository.save(updated);
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.usersRepository.delete(id);
  }

  async findByDifferent(id:number): Promise<User[]> {
    const users= await this.usersRepository.createQueryBuilder('user')
    .select('user')
    .where('user.id != :id', { id: id})
    .getMany();
    return users;
  }
  async getInformation(id:number):Promise<any>{
    const user= await this.findOneById(id);
    // const countMatchWin= (await this.matchsService.findMatchsByPlayer1(user)).length;
    // const countMatchLose= (await this.matchsService.findMatchsByPlayer2(user)).length;
    const rank= await this.ranksService.findOneByQuery(user.cup);
    let winRatio=user.countMatch===0?'100%':(user.cup*100/user.countMatch)>100?'100%':(user.cup*100/user.countMatch).toFixed(2)+ '%';
    return {
      username:user.username,
      name:user.name,
      email:user.email,
      countMatch:user.countMatch,
      dateCreate:user.createDate,
      winRatio:winRatio,
      rank:rank.name?rank.name:'Chưa có rank',
      cup: user.cup,
      image:user.avatarImagePath,
      status:user.status,
      isActive:user.isActive,
      role:user.role
    }
  }
}
