import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { addJob } from '../../queue/queue';

const queueRouter = Router();

queueRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const job = await addJob(req.body);
		res.json({ jobId: job.id });
	} catch (error) {
		res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
			error: 'Queue is currently disabled',
			details: error instanceof Error ? error.message : 'Unknown error',
		});
	}
	return next();
});

export const QueueRouter = { router: queueRouter } as { router: Router };
