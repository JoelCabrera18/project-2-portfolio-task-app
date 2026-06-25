import { Injectable, NotFoundException } from '@nestjs/common';
import { GetMyProfileUseCase } from '../classes/get-my-profile.class';
import { MyProfileResponse } from '../interfaces/my-profile-response.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from 'src/auth/entities/auth.entity';

@Injectable()
export class GetMyProfileUseCaseImp extends GetMyProfileUseCase {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userRepo: Repository<UserProfile>,
  ) {
    super();
  }

  async execute(userCode: string): Promise<MyProfileResponse> {
    const user = await this.userRepo.findOne({
      where: { code: userCode },
      relations: { profile: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const p = user.profile;

    return {
      userCode: user.code,
      profileCode: p.code,
      firstName: p.firstName,
      secondName: p.secondName ?? null,
      firstSurname: p.firstSurname,
      secondSurname: p.secondSurname ?? null,
      email: p.email,
      phone: p.phone,
      photo: p.photo ?? null,
      dateBirth: p.dateBirth,
      createdAt: p.createdAt,
      fullName: `${p.firstName} ${p.firstSurname}`,
    };
  }
}
