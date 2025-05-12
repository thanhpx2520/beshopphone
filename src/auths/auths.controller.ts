import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { AuthsService } from './auths.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { ApiV1Controller } from 'src/base.controller';
import { FastifyReply } from 'fastify';

// @Controller('auths')
@ApiV1Controller('auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authsService.create(createAuthDto);
  }

  @Post('/admin/login')
  adminLogin(@Body() body: any, @Res() res: FastifyReply) {
    return this.authsService.adminLogin(body, res);
  }

  @Post('register')
  register(@Body() registerDto: RegisterAuthDto) {
    return this.authsService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginAuthDto) {
    return this.authsService.login(loginDto);
  }

  @Get()
  findAll() {
    return this.authsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authsService.findOne(+id);
  }

  @Get(':id/orders')
  getOrderById(@Param('id') id: string, @Query() query: any) {
    return this.authsService.getOrderByCustomerId(id, query);
  }

  @Post(':id/update')
  updateUser(@Param('id') id: string, @Body() body: any) {
    return this.authsService.updateUserByInfor(id, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authsService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authsService.remove(+id);
  }
}
