import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfile } from '../entities/auth.entity';
import { Repository } from 'typeorm';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly configService: ConfigService,
  ) {
    const strategyOptions = {
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    };
    super(strategyOptions);
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUserDto> {
    const { userCode } = payload;
    const user = await this.userProfileRepository.findOne({
      where: { code: userCode },
    });

    if (!user) throw new UnauthorizedException('Token invalid');

    if (!user.isAvailable) throw new UnauthorizedException('User account is currently unavailable');

    if (user.isLoginLocked) throw new UnauthorizedException('The account is locked. Please contact support');

    return AuthenticatedUserDto.fromUserProfile(user.id, user.code);
  }
}
