import { Controller, Post, Get, Body, Query, Headers } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  async getMe(
    @Query('userId') userId?: string,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const id = userId || headerUserId;
    if (!id) {
      return { user: null, technician: null };
    }
    return this.authService.getMe(id);
  }
}
