import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  // ─── Google OAuth ───────────────────────────────────────────

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleLogin() {
    // Guard redirects to Google
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  googleCallback(@Request() req) {
    return this.authService.validateOAuthUser(req.user);
  }

  // ─── Facebook OAuth ─────────────────────────────────────────

  @UseGuards(FacebookAuthGuard)
  @Get('facebook')
  facebookLogin() {
    // Guard redirects to Facebook
  }

  @UseGuards(FacebookAuthGuard)
  @Get('facebook/callback')
  facebookCallback(@Request() req) {
    return this.authService.validateOAuthUser(req.user);
  }
}
