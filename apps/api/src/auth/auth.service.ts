import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { type User } from '@repo/database';
import { RegisterSchemaType, TokenPayload } from '@repo/types';
import * as argon from 'argon2';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  async compare(text: string, hashedText: string) {
    return await argon.verify(hashedText, text);
  }
  async hash(text: string) {
    return await argon.hash(text);
  }

  async validateUser(username: string, password: string) {
    const user = await this.userService.findFirst({
      where: {
        OR: [
          {
            email: username,
          },
          { phone: username },
        ],
      },
    });
    if (!user || !user.password) {
      return null;
    }
    const isPasswordValid = await this.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: dbPass, ...result } = user;
    return result;
  }

  async login(user: User, res: Response) {
    const expiresAccessToken = new Date();
    expiresAccessToken.setTime(
      expiresAccessToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const expiresRefreshToken = new Date();
    expiresRefreshToken.setTime(
      expiresRefreshToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const tokenPayload: TokenPayload = {
      id: user.id,
      ...(user.email ? { email: user.email } : {}),
      ...(user.phone ? { phone: user.phone } : {}),
      name: `${user.name} ${user.surname}`,
      role: user.role,
      verified: user.verified,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_ACCESS_TOKEN_EXPIRATION_MS',
      )}ms`,
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_REFRESH_TOKEN_EXPIRATION_MS',
      )}ms`,
    });
    await this.userService.updateUser({
      where: { id: user.id },
      update: {
        refreshTokens: await this.hash(refreshToken),
      },
    });
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: parseInt(
        this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION_MS'),
      ),
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: parseInt(
        this.configService.getOrThrow<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION_MS',
        ),
      ),
    });
  }

  async verifyUserRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.userService.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user || !user.refreshTokens) {
        throw new UnauthorizedException();
      }
      const isValid = await this.compare(refreshToken, user.refreshTokens);
      if (!isValid) {
        throw new UnauthorizedException();
      }
      return user;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(registerDto: RegisterSchemaType) {
    const existingUser = await this.userService.findFirst({
      where: {
        OR: [{ email: registerDto.email }, { phone: registerDto.phone }],
      },
    });
    if (existingUser) {
      throw new BadRequestException();
    }
    const hashedPassword = await this.hash(registerDto.password);
    const newUser = await this.userService.createUser({
      create: {
        name: registerDto.name,
        surname: registerDto.surname,
        email: registerDto.email,
        phone: registerDto.phone,
        password: hashedPassword,
      },
    });
    if (!newUser) {
      throw new BadRequestException();
    }
    return newUser;
  }
}
