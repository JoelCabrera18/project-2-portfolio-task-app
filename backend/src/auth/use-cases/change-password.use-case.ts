import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ChangePasswordUseCase } from '../classes/change-password.class';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../entities/auth.entity';
import { HashService } from 'src/common/classes/hash-service.class';

@Injectable()
export class ChangePasswordUseCaseImp extends ChangePasswordUseCase {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userRepo: Repository<UserProfile>,
    private readonly hashService: HashService,
  ) {
    super();
  }

  async execute(userCode: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepo.findOne({ where: { code: userCode } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await this.hashService.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Current password is incorrect');

    user.password = await this.hashService.hash(dto.newPassword);
    await this.userRepo.save(user);
  }
}
