import multer, { diskStorage } from 'multer';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
	fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Allowed image mime types
const ALLOWED_MIME_TYPES = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/heic',
	'image/heif',
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const storage = diskStorage({
	destination: (
		_req: Request,
		_file: Express.Multer.File,
		cb: (error: Error | null, destination: string) => void
	) => {
		cb(null, UPLOAD_DIR);
	},
	filename: (
		_req: Request,
		file: Express.Multer.File,
		cb: (error: Error | null, filename: string) => void
	) => {
		const uniqueId = uuidv4();
		const ext = path.extname(file.originalname);
		cb(null, `${uniqueId}${ext}`);
	},
});

const filter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error(
				`Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
			)
		);
	}
};

export const uploadMiddleware = multer({
	storage,
	fileFilter: filter,
	limits: {
		fileSize: MAX_FILE_SIZE,
		files: 1, // Only allow single file upload
	},
});

export function getUploadDir(): string {
	return UPLOAD_DIR;
}
