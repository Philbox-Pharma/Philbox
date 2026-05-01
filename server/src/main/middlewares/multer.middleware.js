import multer from 'multer';
import path from 'path';

// Temporary storage before uploading to Cloudinary
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter to allow only images
const imageFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Only image files are allowed!'), false);
};

const excelFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.xlsx' || ext === '.xls') cb(null, true);
  else cb(new Error('Only .xlsx or .xls files are allowed!'), false);
};

const documentFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = new Set(['.jpeg', '.jpg', '.png', '.webp', '.pdf']);
  if (allowed.has(ext)) cb(null, true);
  else cb(new Error('Only image or PDF files are allowed!'), false);
};

const recordingFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = new Set([
    '.webm',
    '.mp4',
    '.mov',
    '.mkv',
    '.m4v',
    '.ogg',
    '.mp3',
    '.wav',
    '.m4a',
  ]);

  if (allowed.has(ext)) cb(null, true);
  else cb(new Error('Only video or audio recording files are allowed!'), false);
};

export const upload = multer({ storage, fileFilter: imageFileFilter });
export const uploadExcel = multer({ storage, fileFilter: excelFileFilter });
export const uploadDocuments = multer({
  storage,
  fileFilter: documentFileFilter,
});
export const uploadRecordings = multer({
  storage,
  fileFilter: recordingFileFilter,
});
