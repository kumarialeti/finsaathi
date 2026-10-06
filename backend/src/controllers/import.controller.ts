import { Request, Response } from 'express';
import { parse as parseCSV } from 'csv-parse/sync';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
const pdfParse = require('pdf-parse').PDFParse;
import { parseTransactionTable, parsePDFTextToTable, ParseResult } from '../utils/parser';

export const importStatement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No file uploaded' } });
      return;
    }

    const userId = req.user!.id;
    const filePath = req.file.path;
    const originalName = req.file.originalname.toLowerCase();
    
    // Validate file type
    if (!originalName.endsWith('.csv') && !originalName.endsWith('.xlsx') && !originalName.endsWith('.xls') && !originalName.endsWith('.pdf')) {
      fs.unlinkSync(filePath);
      res.status(400).json({ success: false, error: { code: 'INVALID_FILE_TYPE', message: 'Please upload a valid CSV, Excel, or PDF file.' } });
      return;
    }

    let parsedResult: ParseResult = { valid: [], invalid: [] };
    let rawRows: any[][] = [];
    let rawExtractedText = '';

    try {
      if (originalName.endsWith('.csv')) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        rawExtractedText = fileContent;
        rawRows = parseCSV(fileContent, { relax_column_count: true, skip_empty_lines: true });
        parsedResult = parseTransactionTable(rawRows);
      } else if (originalName.endsWith('.xlsx') || originalName.endsWith('.xls')) {
        const workbook = xlsx.readFile(filePath, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        rawExtractedText = rawRows.map(row => row.join(', ')).join('\n');
        parsedResult = parseTransactionTable(rawRows);
      } else if (originalName.endsWith('.pdf')) {
        const dataBuffer = fs.readFileSync(filePath);
        
        try {
          const { PDFParse } = require('pdf-parse');
          if (PDFParse) {
            const parser = new PDFParse({ data: new Uint8Array(dataBuffer) });
            const pdfData = await parser.getText();
            rawExtractedText = pdfData.text || '';
          } else {
            const parseFn = require('pdf-parse');
            const pdfData = await parseFn(dataBuffer);
            rawExtractedText = pdfData.text || '';
          }
        } catch (e) {
          console.error('PDF extraction failed:', e);
          throw new Error('PDF extraction failed');
        }
        
        if (rawExtractedText.trim().length < 50) {
          fs.unlinkSync(filePath);
          res.status(400).json({ 
            success: false, 
            error: { code: 'SCANNED_PDF_UNSUPPORTED', message: 'This PDF appears to be scanned/image-based. Please upload a text-based PDF or Excel/CSV statement.' } 
          });
          return;
        }

        rawRows = parsePDFTextToTable(rawExtractedText);
        parsedResult = parseTransactionTable(rawRows);
      }
    } catch (parseError) {
      console.error(parseError);
      fs.unlinkSync(filePath);
      res.status(400).json({ success: false, error: { code: 'PARSE_ERROR', message: 'Failed to parse file. Ensure it is correctly formatted.' } });
      return;
    }

    // Save FinancialDocument regardless of transaction detection success
    const doc = await prisma.financialDocument.create({
      data: {
        user_id: userId,
        file_name: req.file.originalname,
        file_type: originalName.split('.').pop() || 'unknown',
        raw_content: rawExtractedText,
      }
    });

    if (parsedResult.valid.length === 0) {
      fs.unlinkSync(filePath);
      console.log(`[IMPORT]\ntype=${originalName.split('.').pop()}\nrows=${rawRows.length}`);
      console.log(`[PARSE]\nvalidRows=0\ninvalidRows=${parsedResult.invalid.length}`);
      
      res.json({ 
        success: true, 
        documentId: doc.id,
        documentType: 'FINANCIAL_DOCUMENT',
        rawContentExtracted: true,
        transactionsDetected: 0,
        transactionsImported: 0,
        message: 'The document was read successfully. Structured transactions could not be confidently extracted, but you can still ask questions about the document.'
      });
      return;
    }

    // Prepare database insert
    const transactionsToInsert = parsedResult.valid.map(t => ({
      user_id: userId,
      document_id: doc.id,
      amount: t.amount,
      date: t.date,
      transaction_type: t.type,
      description: t.description,
      category: t.category || null,
      source: originalName.split('.').pop()?.toUpperCase() || 'UNKNOWN'
    }));

    let importedCount = 0;
    
    const result = await prisma.transaction.createMany({
      data: transactionsToInsert as any,
      skipDuplicates: true,
    });
    importedCount = result.count;

    fs.unlinkSync(filePath); // Cleanup

    // Safe debugging logs
    console.log(`[IMPORT]\ntype=${originalName.split('.').pop()}\nrows=${rawRows.length}`);
    console.log(`[PARSE]\nvalidRows=${parsedResult.valid.length}\ninvalidRows=${parsedResult.invalid.length}`);
    console.log(`[DATABASE]\ninserted=${importedCount}`);

    res.json({
      success: true,
      documentId: doc.id,
      documentType: 'BANK_STATEMENT',
      rawContentExtracted: true,
      transactionsDetected: parsedResult.valid.length,
      transactionsImported: importedCount,
      transactionsFailed: parsedResult.invalid.length,
      message: 'Document processed successfully.',
      data: {
        imported: importedCount,
        failed: parsedResult.invalid.length,
        errors: parsedResult.invalid.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('Import file error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to process file import' } });
  }
};
