import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import * as path from 'path';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('APPLE_SERVICE_ID') || '',
      teamID: configService.get<string>('APPLE_TEAM_ID') || '',
      keyID: configService.get<string>('APPLE_KEY_ID') || '',
      privateKeyLocation: path.resolve(
        configService.get<string>('APPLE_PRIVATE_KEY_PATH') || './keys/AuthKey.p8',
      ),
      callbackURL: configService.get<string>('APPLE_CALLBACK_URL') || '',
      scope: ['name', 'email'],
      passReqToCallback: false,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    idToken: any,
    profile: any,
    done: (err: any, user: any) => void,
  ) {
    // Apple sends user info only on first login
    // idToken contains the decoded Apple ID token
    const user = {
      providerId: idToken.sub,
      email: idToken.email,
      name: profile?.name
        ? `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim()
        : idToken.email,
      provider: 'apple',
    };
    done(null, user);
  }
}
