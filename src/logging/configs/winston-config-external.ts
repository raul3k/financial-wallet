import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { WinstonModuleOptions } from 'nest-winston';
import * as AWS from 'aws-sdk';
import { AWSError } from 'aws-sdk/lib/error';
import { PutLogEventsResponse } from 'aws-sdk/clients/cloudwatchlogs';
import { Writable } from 'stream';

const isProduction = process.env.NODE_ENV === 'production';

const esTransport = new ElasticsearchTransport({
  level: 'info',
  clientOpts: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    auth: {
      username: process.env.ELASTICSEARCH_USERNAME,
      password: process.env.ELASTICSEARCH_PASSWORD,
    },
  },
});

class CustomCloudWatchTransport extends winston.transports.Stream {
  private cloudwatch: AWS.CloudWatchLogs;
  private logGroupName: string;
  private logStreamName: string;

  constructor(options: { logGroupName: string; logStreamName: string }) {
    super({
      stream: new Writable({
        write: (chunk, encoding, callback) => {
          callback();
        },
      }),
    });
    this.cloudwatch = new AWS.CloudWatchLogs({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.logGroupName = options.logGroupName;
    this.logStreamName = options.logStreamName;
  }

  log(
    info: winston.Logform.TransformableInfo,
    callback: (err: AWSError, data: PutLogEventsResponse) => void,
  ): void {
    setImmediate(() => {
      this.emit('logged', info);
    });

    this.cloudwatch.putLogEvents(
      {
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName,
        logEvents: [
          {
            timestamp: new Date().getTime(),
            message: JSON.stringify(info),
          },
        ],
      },
      callback,
    );
  }
}

const cloudWatchTransport = new CustomCloudWatchTransport({
  logGroupName: 'financial-wallet-logs',
  logStreamName: 'api-logs',
});

export const winstonConfig: WinstonModuleOptions = {
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.errors({ stack: true }),
    isProduction ? winston.format.uncolorize() : winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level}]: ${message}${stack ? `\n${stack}` : ''}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    ...(isProduction ? [cloudWatchTransport, esTransport] : []),
  ],
};
