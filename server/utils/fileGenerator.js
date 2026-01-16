import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun } from 'docx';

/**
 * Generates a PDF stream from text and pipes it to the response.
 */
export const generatePdf = (text, res) => {
  const doc = new PDFDocument();
  
  // Pipe the document to the response
  doc.pipe(res);
  
  // Add text
  doc.fontSize(12).font('Helvetica').text(text, {
    align: 'left',
    lineGap: 2
  });
  
  doc.end();
};

/**
 * Generates a DOCX buffer from text.
 */
export const generateDocx = async (text) => {
  // Split text into paragraphs to maintain structure
  const lines = text.split('\n');
  
  const children = lines.map(line => 
    new Paragraph({
      children: [new TextRun({
        text: line,
        font: "Calibri",
        size: 24 // 12pt
      })],
      spacing: { after: 120 } // slight spacing
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  return await Packer.toBuffer(doc);
};
