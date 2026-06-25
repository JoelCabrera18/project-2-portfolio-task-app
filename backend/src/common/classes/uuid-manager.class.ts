export abstract class UuidManager {
  abstract validate(uuid: string): boolean;
  abstract generate(): string;
}
