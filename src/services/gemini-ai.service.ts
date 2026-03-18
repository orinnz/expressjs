import { GoogleGenerativeAI } from '@google/generative-ai';
import process from 'process';
import { LogHelper } from '../utils/log-helper';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
	LogHelper.warn('[GeminiAI] GEMINI_API_KEY is not configured. Image analysis will not work.');
}

export class GeminiAIService {
	private static instance: GeminiAIService;
	private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

	private constructor() {
		if (GEMINI_API_KEY) {
			const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
			this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
		}
	}

	public static getInstance(): GeminiAIService {
		if (!GeminiAIService.instance) {
			GeminiAIService.instance = new GeminiAIService();
		}
		return GeminiAIService.instance;
	}

	public async analyzeImage(imageData: Buffer, mimeType: string, prompt?: string): Promise<string> {
		if (!this.model) {
			throw new Error(
				'Gemini AI is not configured. Please set GEMINI_API_KEY environment variable.'
			);
		}

		const defaultPrompt = 'What is in this image? Please provide a detailed description.';
		const analysisPrompt = prompt || defaultPrompt;

		try {
			const result = await this.model.generateContent([
				{
					inlineData: {
						data: imageData.toString('base64'),
						mimeType,
					},
				},
				analysisPrompt,
			]);

			const response = await result.response;
			const text = response.text();

			return text || 'Unable to analyze the image.';
		} catch (error) {
			LogHelper.error('[GeminiAI] Error analyzing image', error);
			throw new Error(
				`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	public isConfigured(): boolean {
		return this.model !== null;
	}
}
