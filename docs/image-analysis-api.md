# Image Analysis API with Google Gemini AI

This feature allows users to upload images and get AI-powered analysis using Google's Gemini AI model.

## Setup

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create or sign in to your Google account
3. Generate a new API key

### 2. Configure Environment Variables

Add your Gemini API key to your `.env` file:

```bash
GEMINI_API_KEY=your_api_key_here
```

## API Endpoints

### 1. Upload and Analyze Image

**Endpoint:** `POST /ai/analyze`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `image` (file, required): Image file to analyze
  - Supported formats: JPEG, PNG, GIF, WebP, HEIC, HEIF
  - Maximum size: 10MB
- `prompt` (string, optional): Custom prompt for AI analysis
  - Default: "What is in this image? Please provide a detailed description."

**Example Request (using cURL):**
```bash
curl -X POST http://localhost:3000/ai/analyze \
  -F "image=@/path/to/your/image.jpg" \
  -F "prompt=What objects are in this image?"
```

**Example Request (using FormData in JavaScript):**
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('prompt', 'Describe this image in detail');

const response = await fetch('http://localhost:3000/ai/analyze', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result);
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "imageUrl": "/uploads/abc123-def456.jpg",
  "originalName": "my-image.jpg",
  "mimeType": "image/jpeg",
  "aiResponse": "This image shows a beautiful sunset over the ocean...",
  "promptUsed": "Describe this image in detail"
}
```

**Error Responses:**

- **400 Bad Request** - No image uploaded or invalid file type
```json
{
  "error": "No image file uploaded"
}
```

- **503 Service Unavailable** - Gemini AI not configured
```json
{
  "error": "Gemini AI service is not configured. Please set GEMINI_API_KEY."
}
```

- **500 Internal Server Error** - Unexpected error during analysis
```json
{
  "error": "An unexpected error occurred during image analysis"
}
```

### 2. Get All Image Analyses

**Endpoint:** `GET /ai/analyses`

**Query Parameters:**
- `limit` (integer, optional): Number of results to return (default: 20)
- `offset` (integer, optional): Number of results to skip (default: 0)

**Example Request:**
```bash
curl http://localhost:3000/ai/analyses?limit=10&offset=0
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "imageUrl": "/uploads/abc123.jpg",
      "originalName": "image.jpg",
      "mimeType": "image/jpeg",
      "aiResponse": "This image shows...",
      "promptUsed": "What is in this image?",
      "createdAt": "2026-03-18T10:30:00.000Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0
  }
}
```

### 3. Get Specific Image Analysis

**Endpoint:** `GET /ai/analyses/:id`

**Path Parameters:**
- `id` (integer, required): Analysis ID

**Example Request:**
```bash
curl http://localhost:3000/ai/analyses/1
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "imageUrl": "/uploads/abc123.jpg",
  "originalName": "image.jpg",
  "mimeType": "image/jpeg",
  "aiResponse": "This image shows...",
  "promptUsed": "What is in this image?",
  "createdAt": "2026-03-18T10:30:00.000Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Image analysis with id 1 not found"
}
```

## Database Schema

The `image_analysis` table stores all image analysis results:

```sql
CREATE TABLE image_analysis (
    id SERIAL PRIMARY KEY,
    image_url VARCHAR(512) NOT NULL,
    original_name VARCHAR(256) NOT NULL,
    mime_type TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    prompt_used TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## File Storage

Uploaded images are stored in the `uploads/` directory at the project root. Each file is renamed with a UUID to prevent naming conflicts.

## Architecture

```
src/
├── db/
│   └── entities/
│       └── image-analysis.entity.ts    # TypeORM entity
├── middlewares/
│   └── upload.ts                       # Multer upload middleware
├── modules/
│   └── ai/
│       ├── handlers/
│       │   ├── analyze-image.ts        # Image analysis handler
│       │   └── get-image-analysis.ts   # Get analysis handlers
│       ├── services/
│       │   └── image-analysis.service.ts  # Database operations
│       └── ai.controller.ts            # Router and endpoints
└── services/
    └── gemini-ai.service.ts            # Gemini AI client
```

## Best Practices Implemented

1. **Type Safety**: Full TypeScript support with proper type definitions
2. **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
3. **Logging**: Structured logging using the existing LogHelper utility
4. **Validation**: File type and size validation at middleware level
5. **Security**: UUID-based file naming to prevent directory traversal attacks
6. **Scalability**: Pagination support for listing analyses
7. **Documentation**: Swagger/OpenAPI documentation for all endpoints

## Troubleshooting

### "Gemini AI service is not configured"
- Ensure `GEMINI_API_KEY` is set in your `.env` file
- Restart your application after setting the environment variable

### "Invalid file type"
- Check that your image is in a supported format (JPEG, PNG, GIF, WebP, HEIC, HEIF)
- Verify the file is not corrupted

### "File too large"
- Ensure your image is under 10MB
- Consider compressing large images before upload
