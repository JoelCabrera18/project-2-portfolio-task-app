import { Injectable, UnauthorizedException } from '@nestjs/common';
import { loginResponse } from '../interfaces/login-response.interface';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { HashService } from 'src/common/classes/hash-service.class';
import { Repository } from 'typeorm';
import { UserProfile } from '../entities/auth.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { AuthenticateUserUseCase } from '../classes/authenticate-user.class';
import { MailerService } from 'src/common/services/mailer/mailer.service';
import { loginNotificationTemplate, LoginNotificationData } from '../templates/login-notification.template';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthenticateUserUseCaseImp extends AuthenticateUserUseCase {
  constructor(
    @InjectRepository(UserProfile)
    private readonly repository: Repository<UserProfile>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    super();
  }
  async execute(user: UserProfile, rawPassword: string): Promise<loginResponse> {
    if (user.isLoginLocked) throw new UnauthorizedException('The account is locked. Please contact support');
    const isAuthenticated = await this.hashService.compare(rawPassword, user.password);
    if (!isAuthenticated) throw new UnauthorizedException('Invalid credentials');

    user.dateLastLogin = new Date();
    await this.repository.save(user);

    const token = await this.jwtService.signAsync({
      userCode: user.code,
    });

    const refreshTokenExpiresIn = this.configService.get('REFRESH_TOKEN_EXPIRES_IN') || '30d';
    const refreshPayload = { userCode: user.code, type: 'refresh' };
    const refreshToken = this.jwtService.sign(refreshPayload, { expiresIn: refreshTokenExpiresIn });
    const decoded = this.jwtService.decode(refreshToken) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        token: refreshToken,
        userCode: user.code,
        expiresAt,
        isAvailable: true,
      }),
    );

    const mailData: LoginNotificationData = {
      name: `${user.profile.firstName} ${user.profile.firstSurname}`,
      email: user.username,
      appName: process.env.APP_NAME || 'Task App',
      loginTime: new Date(),
      dashboardUrl: `${process.env.HOST_FRONTEND || 'http://localhost:4200'}/workspace`,
    };
    const htmlTemplate = loginNotificationTemplate(mailData);
    this.mailerService
      .sendEmail(user.username, `Nuevo inicio de sesión - ${process.env.APP_NAME || 'Task App'}`, htmlTemplate)
      .catch(() => {});

    return {
      token,
      refreshToken,
      user: { userCode: user.code, profileCode: user.profile.code },
    };
  }
}
