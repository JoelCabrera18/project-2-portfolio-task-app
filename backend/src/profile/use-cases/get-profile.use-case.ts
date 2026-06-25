import { Injectable, NotFoundException } from '@nestjs/common';
import { GetProfileUseCase } from '../classes/get-profile.class';
import { ProfileResponse } from '../interfaces/profile-response.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from '../entities/profile.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GetProfileUseCaseImp extends GetProfileUseCase {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {
    super();
  }
  async execute(code: string): Promise<ProfileResponse> {
    const profile = await this.profileRepository.findOneBy({ code });
    if (!profile) {
      throw new NotFoundException(`Profile with code ${code} not found`);
    }

    const response = {
      profileCode: profile.code,
      profileName: `${profile.firstName} ${profile.firstSurname}`,
      email: profile.email,
      avatar: profile.photo,
      createdAt: profile.createdAt,
    };
    return response;
  }
}
