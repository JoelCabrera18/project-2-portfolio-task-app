import { UserSettings } from '../interfaces/settings.interface';

export abstract class GetSettingsUseCase {
  abstract execute(userCode: string): Promise<UserSettings>;
}
