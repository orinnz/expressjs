import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Result } from '../../../constants/result';
import { LogHelper } from '../../../utils/log-helper';
import { getAllImageAnalyses, getImageAnalysis } from '../services/image-analysis.service';

export async function getImageAnalysisHandler(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const id = parseInt(req.params.id, 10);

		if (isNaN(id)) {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: 'Invalid analysis ID',
			});
			return;
		}

		const result = await getImageAnalysis(id);

		if (result.type === Result.NOT_FOUND) {
			res.status(StatusCodes.NOT_FOUND).json({
				error: result.message,
			});
			return;
		}

		if (result.type === Result.ERROR) {
			LogHelper.error('[ImageAnalysis] Failed to fetch analysis', result.error);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				error: 'Failed to fetch image analysis',
			});
			return;
		}

		res.status(StatusCodes.OK).json(result.data);
	} catch (error) {
		LogHelper.error('[ImageAnalysis] Unexpected error fetching analysis', error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			error: 'An unexpected error occurred',
		});
		next(error);
	}
}

export async function getAllImageAnalysesHandler(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const limit = parseInt(req.query.limit as string, 10) || 20;
		const offset = parseInt(req.query.offset as string, 10) || 0;

		const result = await getAllImageAnalyses(limit, offset);

		if (result.type === Result.ERROR) {
			LogHelper.error('[ImageAnalysis] Failed to fetch analyses', result.error);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				error: 'Failed to fetch image analyses',
			});
			return;
		}

		res.status(StatusCodes.OK).json({
			data: result.data,
			pagination: {
				limit,
				offset,
			},
		});
	} catch (error) {
		LogHelper.error('[ImageAnalysis] Unexpected error fetching analyses', error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			error: 'An unexpected error occurred',
		});
		next(error);
	}
}
