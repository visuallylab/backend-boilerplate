import { Service } from 'typedi';
import { sign, verify, SignOptions, VerifyOptions } from 'jsonwebtoken';

import * as env from '@/environments';

type Payload = string | object | Buffer;

interface IJwtService {
  sign: (payload: Payload, options: SignOptions) => void;
  verify: (token: string, options: VerifyOptions) => void;
}

const defaultSignOptions = {
  expiresIn: env.server.jwtExpireIn,
};

@Service()
export default class JwtService implements IJwtService {
  private secret = Buffer.from(env.server.jwtSecretKey, 'base64');

  public sign(payload: Payload, options: SignOptions = defaultSignOptions) {
    return new Promise<string>((resolve, reject) => {
      sign(payload, this.secret, options, (err, encoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(encoded);
        }
      });
    });
  }

  public verify<T extends object | string>(
    token: string,
    options?: VerifyOptions,
  ) {
    return new Promise<T>((resolve, reject) => {
      verify(token, this.secret, options, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(<T>decoded);
        }
      });
    });
  }
}
