import { Router } from 'express';
import { uploadMiddleware } from '../../middlewares/upload';
import { analyzeImage } from './handlers/analyze-image';
import { getAllImageAnalysesHandler, getImageAnalysisHandler } from './handlers/get-image-analysis';

const aiRouter = Router();

/**
 * @swagger
 * /ai/analyze:
 *   post:
 *     tags:
 *       - AI
 *     summary: Upload an image for AI analysis
 *     description: Upload an image and get AI-powered analysis using Google Gemini
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: Image file to analyze (JPEG, PNG, GIF, WebP, HEIC, HEIF)
 *       - in: formData
 *         name: prompt
 *         type: string
 *         required: false
 *         description: Custom prompt for the AI analysis
 *     responses:
 *       200:
 *         description: Image analyzed successfully
 *       400:
 *         description: No image uploaded or invalid file type
 *       503:
 *         description: Gemini AI service not configured
 */
aiRouter.post('/analyze', uploadMiddleware.single('image'), analyzeImage);

/**
 * @swagger
 * /ai/analyses:
 *   get:
 *     tags:
 *       - AI
 *     summary: Get all image analyses
 *     description: Retrieve a paginated list of all image analyses
 *     parameters:
 *       - in: query
 *         name: limit
 *         type: integer
 *         default: 20
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         type: integer
 *         default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: List of image analyses
 */
aiRouter.get('/analyses', getAllImageAnalysesHandler);

/**
 * @swagger
 * /ai/analyses/:id:
 *   get:
 *     tags:
 *       - AI
 *     summary: Get a specific image analysis
 *     description: Retrieve details of a specific image analysis by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         type: integer
 *         required: true
 *         description: Analysis ID
 *     responses:
 *       200:
 *         description: Image analysis details
 *       404:
 *         description: Analysis not found
 */
aiRouter.get('/analyses/:id', getImageAnalysisHandler);

export const AIController = { router: aiRouter } as { router: Router };
