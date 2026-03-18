import { InsertResult } from 'typeorm';
import { Result } from '../../../constants/result';
import { dataSource } from '../../../db/datasource';
import { ImageAnalysis } from '../../../db/entities/image-analysis.entity';
import { ErrorResult, NotFoundResult, SuccessResult } from '../../../interfaces/results';

export interface CreateImageAnalysisInput {
	imageUrl: string;
	originalName: string;
	mimeType: string;
	aiResponse: string;
	promptUsed?: string;
}

export type ImageAnalysisResult = SuccessResult<ImageAnalysis> | NotFoundResult | ErrorResult;
export type ImageAnalysesResult = SuccessResult<ImageAnalysis[]> | ErrorResult;
export type CreateImageAnalysisDataResult = SuccessResult<{ id: number }> | ErrorResult;
export type DeleteImageAnalysisResult = SuccessResult<null> | ErrorResult;

export async function createImageAnalysis(
	input: CreateImageAnalysisInput
): Promise<CreateImageAnalysisDataResult> {
	return dataSource
		.getRepository(ImageAnalysis)
		.insert(input)
		.then<SuccessResult<{ id: number }>>((result: InsertResult) => ({
			type: Result.SUCCESS,
			data: { id: result.raw[0]?.id || result.identifiers[0]?.id },
		}))
		.catch((error) => ({
			type: Result.ERROR,
			message: 'An unexpected error occurred while saving image analysis',
			error,
		}));
}

export async function getImageAnalysis(id: number): Promise<ImageAnalysisResult> {
	return dataSource
		.getRepository(ImageAnalysis)
		.findOne({
			where: { id },
		})
		.then<SuccessResult<ImageAnalysis> | NotFoundResult>((result) => {
			if (!result) {
				return {
					type: Result.NOT_FOUND,
					message: `Image analysis with id ${id} not found`,
				};
			}
			return {
				type: Result.SUCCESS,
				data: result,
			};
		})
		.catch((error) => ({
			type: Result.ERROR,
			message: `An unexpected error occurred while fetching image analysis with id ${id}`,
			error,
		}));
}

export async function getAllImageAnalyses(limit = 20, offset = 0): Promise<ImageAnalysesResult> {
	return dataSource
		.getRepository(ImageAnalysis)
		.find({
			take: limit,
			skip: offset,
			order: { createdAt: 'DESC' },
		})
		.then<SuccessResult<ImageAnalysis[]>>((results) => ({
			type: Result.SUCCESS,
			data: results,
		}))
		.catch((error) => ({
			type: Result.ERROR,
			message: 'An unexpected error occurred while fetching image analyses',
			error,
		}));
}

export async function deleteImageAnalysis(id: number): Promise<DeleteImageAnalysisResult> {
	return dataSource
		.getRepository(ImageAnalysis)
		.delete({ id })
		.then<SuccessResult<null>>(() => ({
			type: Result.SUCCESS,
			data: null,
		}))
		.catch((error) => ({
			type: Result.ERROR,
			message: `An unexpected error occurred while deleting image analysis with id ${id}`,
			error,
		}));
}
