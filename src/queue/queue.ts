import { Queue, Job, Worker } from 'bullmq';
import path from 'node:path';
import { LogHelper } from '../utils/log-helper';
import {
	DEFAULT_REMOVE_CONFIG,
	queueName,
	REDIS_QUEUE_ENABLED,
	REDIS_QUEUE_HOST,
	REDIS_QUEUE_PORT,
} from './config.constants';

export const defaultQueue: Queue | null = REDIS_QUEUE_ENABLED
	? new Queue(queueName, {
			connection: {
				host: REDIS_QUEUE_HOST,
				port: REDIS_QUEUE_PORT,
			},
	  })
	: null;

const processorPath = path.join(__dirname, 'job-processor.js');
export const defaultWorker: Worker | null = REDIS_QUEUE_ENABLED
	? new Worker(queueName, processorPath, {
			connection: {
				host: REDIS_QUEUE_HOST,
				port: REDIS_QUEUE_PORT,
			},
			autorun: true,
	  })
	: null;

if (!REDIS_QUEUE_ENABLED) {
	LogHelper.info(`[QUEUE] Redis queue is disabled via REDIS_QUEUE_ENABLED=false`);
}

defaultWorker?.on('completed', (job: Job, returnvalue: 'DONE') => {
	LogHelper.debug(`Completed job with id ${job.id}`, returnvalue);
});

defaultWorker?.on('active', (job: Job<unknown>) => {
	LogHelper.debug(`Completed job with id ${job.id}`);
});
defaultWorker?.on('error', (failedReason: Error) => {
	LogHelper.error(`Job encountered an error`, failedReason);
});
export async function addJob<T>(data: T): Promise<Job<T>> {
	if (!defaultQueue) {
		throw new Error('Redis queue is disabled');
	}

	LogHelper.debug(`Adding job to queue`);

	return defaultQueue.add('job', data, DEFAULT_REMOVE_CONFIG);
}
