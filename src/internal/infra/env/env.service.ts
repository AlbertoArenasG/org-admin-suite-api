import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './env';

@Injectable()
export class EnvService {
  constructor(private configService: ConfigService<Env, true>) {}

  /**
   * Gets the value of the specified environment variable.
   *
   * @template T The type of the environment variable.
   * @param {T} key The key of the environment variable.
   * @returns {T} The value of the environment variable.
   */
  get<T extends keyof Env>(key: T) {
    return this.configService.get(key, { infer: true });
  }
}
