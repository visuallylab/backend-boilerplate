import { Service } from 'typedi';
import * as S3 from 'aws-sdk/clients/s3';

import { ILogger } from '@/services/logger/Logger';
import rootLogger from '@/services/logger/rootLogger';

export enum Bucket {}
// put your bucket ...

export interface IService {
  upload: (
    params: S3.Types.PutObjectRequest,
  ) => Promise<S3.ManagedUpload.SendData>;
  getObject: (params: S3.GetObjectRequest) => Promise<S3.GetObjectOutput>;
  getSignedUrl: (operation: string, params: any) => Promise<string>;
  copyObject: (
    params: S3.Types.CopyObjectRequest,
  ) => Promise<S3.Types.CopyObjectOutput>;
}

// aws account config can be from credential
const bucketConfig: S3.ClientConfiguration = {
  endpoint: 'https://s3.amazonaws.com',
  params: {
    ACL: 'authenticated-read',
  },
};

@Service()
export default class S3Service implements IService {
  private logger: ILogger;
  private s3 = new S3(bucketConfig);

  constructor(logger = rootLogger) {
    this.logger = logger.create('service/s3');
  }

  public async upload(params: S3.Types.PutObjectRequest) {
    try {
      return this.s3.upload(params).promise();
    } catch (err) {
      this.logger.error(err);
      throw new Error(err);
    }
  }

  public async getObject(params: S3.Types.GetObjectRequest) {
    try {
      return this.s3.getObject(params).promise();
    } catch (err) {
      this.logger.error(err);
      throw new Error(err);
    }
  }

  public async getSignedUrl(params: any, operation: string = 'getObject') {
    return new Promise<string>((resolve, reject) => {
      this.s3.getSignedUrl(operation, params, (err, url) => {
        if (err) {
          reject(err);
        }
        resolve(url);
      });
    });
  }

  public async copyObject(params: S3.Types.CopyObjectRequest) {
    try {
      return this.s3.copyObject(params).promise();
    } catch (err) {
      this.logger.error(err);
      throw new Error(err);
    }
  }
}
