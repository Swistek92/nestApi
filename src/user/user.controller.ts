import { UserService } from './user.service';
import { JwtGuard } from './../auth/guard/jwt.guard';
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

// import { GetUser } from './../../src/auth/decorator';
import { GetUser } from './../auth/decorator';
import { EditUserDto } from './dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user) {
    return user;
  }

  @Patch()
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
