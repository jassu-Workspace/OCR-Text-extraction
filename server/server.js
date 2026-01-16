import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { extractTextFromDocx, extractTextFromImage, extractTextFromPdf } from './utils/extractor.js';
import { generatePdf, generateDocx } from './utils/fileGenerator.js';

// Setup paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for large text downloads

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Unique filename to prevent collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, PDF, and DOCX are allowed.'));
    }
  }
});

// Helper to clean up file
const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.error(`Failed to delete file ${filePath}:`, err);
  });
};

/**
 * POST /api/extract
 * Handles file upload and triggers specific extraction logic based on file type.
 */
app.post('/api/extract', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;
  const startTime = Date.now();

  console.log(`Received file: ${req.file.originalname} (${mimeType})`);

  try {
    let pagesData = [];

    // Route processing based on MIME type
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // DOCX
      const text = await extractTextFromDocx(filePath);
      pagesData = [{ page: 1, text }];
    } else if (mimeType === 'application/pdf') {
      // PDF - returns Array<{page, text}>
      pagesData = await extractTextFromPdf(filePath);
    } else if (mimeType.startsWith('image/')) {
      // Image (JPG/PNG)
      const text = await extractTextFromImage(filePath);
      pagesData = [{ page: 1, text }];
    } else {
      throw new Error('Unsupported file type processing logic.');
    }

    // Send successful response
    res.json({
      pages: pagesData,
      meta: {
        fileType: mimeType,
        pageCount: pagesData.length,
        processingTimeMs: Date.now() - startTime
      }
    });

  } catch (error) {
    console.error('Processing error:', error);
    
    // Determine status code and clean error message
    let statusCode = 500;
    let userMessage = 'An unexpected error occurred during processing.';

    if (error.message.includes('PDF conversion failed')) {
      userMessage = 'Could not convert PDF. The file may be password protected or corrupted.';
    } else if (error.message.includes('OCR')) {
      userMessage = 'OCR engine failed to read the image data.';
    } else if (error.message.includes('DOCX')) {
      userMessage = 'Could not read the Word document structure.';
    }

    res.status(statusCode).json({ 
      error: userMessage,
      details: error.message 
    });

  } finally {
    // Clean up uploaded file
    deleteFile(filePath);
  }
});

/**
 * POST /api/download
 * Generates a file from provided text and format.
 */
app.post('/api/download', async (req, res) => {
  const { text, format } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'No text provided for generation.' });
  }

  try {
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=extracted_text.pdf');
      generatePdf(text, res);
      
    } else if (format === 'docx') {
      const buffer = await generateDocx(text);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment; filename=extracted_text.docx');
      res.send(buffer);
      
    } else {
      res.status(400).json({ error: 'Unsupported format requested.' });
    }
  } catch (error) {
    console.error('File generation error:', error);
    res.status(500).json({ error: 'Failed to generate file.' });
  }
});

// --- DEPLOYMENT SETUP ---

// Serve static frontend files from the 'dist' directory (generated by Vite build)
// We assume 'dist' will be located one level up from 'server' after build
const distPath = path.join(__dirname, '../dist');

// On Render or Production, we always want to serve the frontend
// Remove the existsSync check to prevent silent failures if path is slightly off,
// express.static handles missing directories gracefully anyway.
console.log(`Attempting to serve static files from: ${distPath}`);

app.use(express.static(distPath));

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  // Check if it's an API request first to return JSON instead of HTML
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback message if build failed or files missing
    res.status(404).send('Frontend build not found. Please check deployment logs.');
  }
});

// Error handling middleware for Multer limits
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let msg = err.message;
    if (err.code === 'LIMIT_FILE_SIZE') {
      msg = 'File size is too large. Max limit is 20MB.';
    }
    return res.status(400).json({ error: msg });
  } else if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Uploads directory: ${UPLOAD_DIR}`);
});
