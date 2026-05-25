import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { TokenBlacklist } from './schemas/token-blacklist.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(TokenBlacklist.name)
    private tokenBlacklistModel: Model<TokenBlacklist>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), access_token: token };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), access_token: token };
  }

  async logout(token: string) {
    const decoded = this.jwtService.decode(token) as { exp: number };
    await this.tokenBlacklistModel.create({
      token,
      expiresAt: new Date(decoded.exp * 1000),
    });
    return { message: 'Logged out successfully' };
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const found = await this.tokenBlacklistModel.findOne({ token });
    return !!found;
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    return user;
  }

  async validateOAuthUser(oauthUser: {
    providerId: string;
    email: string;
    name: string;
    avatar?: string;
    provider: string;
  }) {
    // Check if user already exists with this provider + providerId
    let user = await this.userModel.findOne({
      provider: oauthUser.provider,
      providerId: oauthUser.providerId,
    });

    if (!user) {
      // Check if a user with this email exists (maybe registered locally)
      user = await this.userModel.findOne({ email: oauthUser.email });

      if (user) {
        // Link the OAuth provider to the existing account
        user.provider = oauthUser.provider;
        user.providerId = oauthUser.providerId;
        user.avatar = oauthUser.avatar || '';
        await user.save();
      } else {
        // Create a new user
        user = await this.userModel.create({
          name: oauthUser.name,
          email: oauthUser.email,
          provider: oauthUser.provider,
          providerId: oauthUser.providerId,
          avatar: oauthUser.avatar,
        });
      }
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), access_token: token };
  }

  private generateToken(user: User): string {
    const payload = { sub: user._id, email: user.email };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User) {
    const obj = user.toObject();
    delete obj.password;
    return obj;
  }
}
