import {
  Controller,
  Get,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Post,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    const users = await this.usersService.findByDifferent(req.user.id);
    const res = await Promise.all(users.map((user) => {
      if (req.user.id !== user.id)
        return {
          name: user.name,
          username: user.username,
          id: user.id,
          role: user.role,
          email: user.email,
          status: user.status
        }
    }))
    return res;
  }

  @UseGuards(JwtAuthGuard)
  @Post('changestatus')
  async changeStatus(@Body() req: { id: number, status: boolean }) {
    return this.usersService.update(req.id, { status: req.status });
  }

  @UseGuards(JwtAuthGuard)
  @Post('activeuser')
  async changeActive(@Body() req: { id: number}) {
    return this.usersService.update(req.id, { isActive: true });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getInformation(@Param('id') id:number) {
    return this.usersService.getInformation(id);
  }

}
