import { RedisClient } from 'bullmq';
import { redisHealthCheck } from '../../../cache/redis-cache-client';
import { Result } from '../../../constants/result';
import { dataSource } from '../../../db/datasource';
import { ErrorResult, SuccessResult } from '../../../interfaces/results';
import { defaultQueue } from '../../../queue/queue';
import { REDIS_QUEUE_ENABLED } from '../../../queue/config.constants';
import { LogHelper } from '../../../utils/log-helper';

export function checkDatabaseConnection(): Promise<
	SuccessResult<{ version: string }> | ErrorResult
> {
	return dataSource
		.query(`SELECT version()`)
		.then<SuccessResult<{ version: string }>>((databaseVersion) => ({
			type: Result.SUCCESS,
			data: databaseVersion[0].version,
		}))
		.catch((error) => {
			LogHelper.error(error);
			return {
				type: Result.ERROR,
				message: error.message,
				error,
			};
		});
}

export function checkRedisCacheConnection(): Promise<SuccessResult<'CONNECTED'> | ErrorResult> {
	return redisHealthCheck()
		.then<SuccessResult<'CONNECTED'>>((answer: 'CONNECTED') => ({
			type: Result.SUCCESS,
			data: answer,
		}))
		.catch((error) => {
			LogHelper.error(error);
			return {
				type: Result.ERROR,
				message: error.message,
				error,
			};
		});
}

type RedisQueueHealth = {
	connection: 'PONG' | 'DISABLED';
	activeCount: number;
	waitingCount: number;
	completedCount: number;
	failedCount: number;
};

export function checkRedisQueHealth(): Promise<SuccessResult<RedisQueueHealth> | ErrorResult> {
	if (!REDIS_QUEUE_ENABLED || !defaultQueue) {
		return Promise.resolve({
			type: Result.SUCCESS,
			data: {
				connection: 'DISABLED',
				activeCount: 0,
				waitingCount: 0,
				completedCount: 0,
				failedCount: 0,
			},
		});
	}

	return Promise.all([
		pingRedisQueueWithTimeout(),
		defaultQueue.getActiveCount(),
		defaultQueue.getWaitingCount(),
		defaultQueue.getCompletedCount(),
		defaultQueue.getFailedCount(),
	])
		.then<SuccessResult<RedisQueueHealth>>(
			([pingResult, activeCount, waitingCount, completedCount, failedCount]) => ({
				type: Result.SUCCESS,
				data: {
					connection: pingResult,
					activeCount,
					waitingCount,
					completedCount,
					failedCount,
				},
			})
		)
		.catch((error) => {
			LogHelper.error(error);
			return {
				type: Result.ERROR,
				message: error.message,
				error,
			};
		});
}

function pingRedisQueueWithTimeout(): Promise<'PONG'> {
	if (!defaultQueue) {
		return Promise.reject(new Error('Redis queue is disabled'));
	}

	return defaultQueue.client.then((client: RedisClient) => {
		return Promise.race([
			client.ping(),
			new Promise<'PONG'>((_, reject) => {
				setTimeout(() => {
					reject(
						new Error(`TIMEOUT ERROR, Redis Queue Client did not respond to ping under 2 seconds`)
					);
				}, 2000);
			}),
		]);
	});
}
