import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Export Service
 * Handles Excel and CSV export functionality
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
