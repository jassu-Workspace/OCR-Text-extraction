import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';
import pdfImgConvert from 'pdf-img-convert';

/**
 * Extracts raw text from a DOCX file using Mammoth.
 */
export const extractTextFromDocx = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value; 
  } catch (error) {
    throw new Error(`DOCX parsing failed: ${error.message}`);
  }
};

/**
 * Extracts text from an image using Tesseract.js.
 */
export const extractTextFromImage = async (filePath) => {
  try {
    const worker = await createWorker('eng');
    const ret = await worker.recognize(filePath);
    await worker.terminate();
    return ret.data.text;
  } catch (error) {
    throw new Error(`Image OCR failed: ${error.message}`);
  }
};

/**
 * Extracts text from PDF by converting pages to images first, then running OCR on each.
 * Returns an array of objects: { page: number, text: string }
 */
export const extractTextFromPdf = async (filePath) => {
  let imageBuffers;
  try {
    // 1. Convert PDF pages to image buffers
    imageBuffers = await pdfImgConvert.convert(filePath, {
      scale: 2.0 // Higher scale = better OCR accuracy but slower
    });
  } catch (error) {
    throw new Error(`PDF conversion failed. The file might be password protected or corrupted. Details: ${error.message}`);
  }

  if (!imageBuffers || imageBuffers.length === 0) {
    return [];
  }

  const pages = [];
  const worker = await createWorker('eng');

  try {
    // 2. Run OCR on each page
    for (let i = 0; i < imageBuffers.length; i++) {
      console.log(`Processing PDF page ${i + 1}/${imageBuffers.length}...`);
      
      const ret = await worker.recognize(imageBuffers[i]);
      
      pages.push({
        page: i + 1,
        text: ret.data.text
      });
    }
  } catch (error) {
    throw new Error(`OCR processing failed during page analysis. Details: ${error.message}`);
  } finally {
    await worker.terminate();
  }

  return pages;
};
