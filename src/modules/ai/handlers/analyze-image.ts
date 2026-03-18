import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Result } from '../../../constants/result';
import { LogHelper } from '../../../utils/log-helper';
import { GeminiAIService } from '../../../services/gemini-ai.service';
import { createImageAnalysis, CreateImageAnalysisInput } from '../services/image-analysis.service';
import * as fs from 'fs';
import * as path from 'path';

export interface AnalyzeImageRequest extends Request {
	file?: Express.Multer.File;
	body: {
		prompt?: string;
	};
}

export async function analyzeImage(
	req: AnalyzeImageRequest,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		if (!req.file) {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: 'No image file uploaded',
			});
			return;
		}

		const geminiService = GeminiAIService.getInstance();

		if (!geminiService.isConfigured()) {
			res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
				error: 'Gemini AI service is not configured. Please set GEMINI_API_KEY.',
			});
			return;
		}

		const { prompt } = req.body;
		const imageBuffer = fs.readFileSync(req.file.path);
		const mimeType = req.file.mimetype;

		LogHelper.info(`[ImageAnalysis] Analyzing image: ${req.file.originalname} (${mimeType})`);

		const aiResponse = await geminiService.analyzeImage(imageBuffer, mimeType, prompt);

		const imageUrl = `/uploads/${path.basename(req.file.path)}`;

		const analysisInput: CreateImageAnalysisInput = {
			imageUrl,
			originalName: req.file.originalname,
			mimeType,
			aiResponse,
			promptUsed: prompt,
		};

		const result = await createImageAnalysis(analysisInput);

		if (result.type === Result.ERROR) {
			LogHelper.error('[ImageAnalysis] Failed to save analysis result', result.error);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				error: 'Failed to save analysis result',
			});
			return;
		}

		LogHelper.info(`[ImageAnalysis] Successfully analyzed image: ${req.file.originalname}`);

		res.status(StatusCodes.OK).json({
			id: result.data.id,
			imageUrl,
			originalName: req.file.originalname,
			mimeType,
			aiResponse,
			promptUsed: prompt,
		});

		// Optionally delete the uploaded file after processing
		// fs.unlink(req.file.path, (err) => {
		// 	if (err) LogHelper.warn('[ImageAnalysis] Failed to delete temporary file', err);
		// });
	} catch (error) {
		LogHelper.error('[ImageAnalysis] Unexpected error during image analysis', error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			error: 'An unexpected error occurred during image analysis',
		});
		next(error);
	}
}
