import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Export Service
 * Handles Excel, CSV and PDF export functionality
 */
class ExportService {
  constructor() {
    this.exportDir = path.join(__dirname, '../../exports');
    this.ensureExportDir();
  }

  /**
   * Ensure export directory exists
   * @private
   */
  ensureExportDir() {
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  /**
   * Export data to Excel file
   * @param {Array} data - Array of objects to export
   * @param {String} filename - Output filename (without extension)
   * @param {String} sheetName - Sheet name
   * @returns {Promise<String>} File path
   */
  async exportToExcel(data, filename, sheetName = 'Data') {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      if (data.length === 0) {
        worksheet.addRow(['No data available']);
        const filepath = path.join(this.exportDir, `${filename}.xlsx`);
        await workbook.xlsx.writeFile(filepath);
        return filepath;
      }

      // Add headers
      const headers = Object.keys(data[0]);
      worksheet.columns = headers.map(header => ({
        header: header.replace(/_/g, ' ').toUpperCase(),
        key: header,
        width: 20,
      }));

      // Style header row
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF366092' },
      };

      // Add data rows
      data.forEach(row => {
        worksheet.addRow(row);
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = column.header.length;
        column.eachCell({ includeEmpty: true }, cell => {
          const cellLength = cell.value ? cell.value.toString().length : 0;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      const filepath = path.join(this.exportDir, `${filename}.xlsx`);
      await workbook.xlsx.writeFile(filepath);

      console.log(`✅ Excel file created: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('❌ Error exporting to Excel:', error);
      throw error;
    }
  }

  /**
   * Export data to CSV file
   * @param {Array} data - Array of objects to export
   * @param {String} filename - Output filename (without extension)
   * @returns {Promise<String>} File path
   */
  async exportToCSV(data, filename) {
    try {
      if (data.length === 0) {
        const filepath = path.join(this.exportDir, `${filename}.csv`);
        fs.writeFileSync(filepath, 'No data available');
        return filepath;
      }

      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(data);

      const filepath = path.join(this.exportDir, `${filename}.csv`);
      fs.writeFileSync(filepath, csv);

      console.log(`✅ CSV file created: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('❌ Error exporting to CSV:', error);
      throw error;
    }
  }

  /**
   * Export data to PDF file
   * @param {Array} data - Array of objects to export
   * @param {String} filename - Output filename (without extension)
   * @param {String} title - Document title
   * @returns {Promise<String>} File path
   */
  async exportToPDF(data, filename, title = 'Report') {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 30 });
        const filepath = path.join(this.exportDir, `${filename}.pdf`);
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Add Header
        doc.fontSize(20).text(title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, {
          align: 'right',
        });
        doc.moveDown();

        if (data.length === 0) {
          doc.fontSize(12).text('No data available in this report.');
        } else {
          // Add Table
          const headers = Object.keys(data[0]);
          const startX = 30;
          let currentY = doc.y;

          // Draw Headers
          doc.fontSize(10).font('Helvetica-Bold');
          headers.forEach((header, index) => {
            doc.text(
              header.replace(/_/g, ' ').toUpperCase(),
              startX + index * 100,
              currentY,
              { width: 90 }
            );
          });

          currentY += 20;
          doc.font('Helvetica').fontSize(9);

          // Draw Rows
          data.forEach(row => {
            if (currentY > 700) {
              doc.addPage();
              currentY = 30;
            }

            headers.forEach((header, index) => {
              const val = row[header] !== undefined ? row[header] : '';
              doc.text(val.toString(), startX + index * 100, currentY, {
                width: 90,
              });
            });
            currentY += 20;
          });
        }

        doc.end();
        stream.on('finish', () => {
          console.log(`✅ PDF file created: ${filepath}`);
          resolve(filepath);
        });
      } catch (error) {
        console.error('❌ Error exporting to PDF:', error);
        reject(error);
      }
    });
  }

  /**
   * Clean old export files (older than 7 days)
   * @public
   */
  cleanOldExports() {
    try {
      const files = fs.readdirSync(this.exportDir);
      const now = Date.now();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      files.forEach(file => {
        const filePath = path.join(this.exportDir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtime.getTime() > sevenDaysMs) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Deleted old export: ${file}`);
        }
      });
    } catch (error) {
      console.error('❌ Error cleaning old exports:', error);
    }
  }

  /**
   * Get download URL for exported file
   * @param {String} filename - Filename with extension
   * @returns {String} Download URL
   */
  getDownloadUrl(filename) {
    return `/api/admin/exports/download/${filename}`;
  }
}

export default new ExportService();
