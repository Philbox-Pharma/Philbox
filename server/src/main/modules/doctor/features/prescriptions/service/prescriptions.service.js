import PrescriptionGeneratedByDoctor from '../../../../../models/PrescriptionGeneratedByDoctor.js';
import PrescriptionItem from '../../../../../models/PrescriptionItem.js';
import Appointment from '../../../../../models/Appointment.js';
import { uploadToCloudinary } from '../../../../../utils/uploadToCloudinary.js';
import cloudinary from '../../../../../config/cloudinary.config.js';
import { logDoctorActivity } from '../../../utils/logDoctorActivities.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getImageBufferFromUrl = async imageUrl => {
  if (!imageUrl) return null;

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
};

const parseCloudinaryAssetInfo = fileUrl => {
  try {
    const urlObj = new URL(fileUrl);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    const uploadIndex = parts.indexOf('upload');

    if (uploadIndex === -1 || uploadIndex + 1 >= parts.length) {
      return null;
    }

    const afterUpload = parts.slice(uploadIndex + 1);
    const hasVersion = /^v\d+$/.test(afterUpload[0]);
    const version = hasVersion ? afterUpload[0].slice(1) : undefined;
    const publicIdWithExt = hasVersion
      ? afterUpload.slice(1).join('/')
      : afterUpload.join('/');

    if (!publicIdWithExt) {
      return null;
    }

    const publicId = publicIdWithExt.replace(/\.pdf$/i, '');

    return { publicId, publicIdWithExt, version };
  } catch {
    return null;
  }
};

const canAccessUrl = async url => {
  try {
    const headRes = await fetch(url, { method: 'HEAD' });
    if (headRes.ok) return true;

    // Some CDNs disallow HEAD; probe with a lightweight ranged GET.
    if (headRes.status === 405) {
      const getRes = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-32' },
      });
      return getRes.ok || getRes.status === 206;
    }

    return false;
  } catch {
    return false;
  }
};

const buildAccessiblePrescriptionUrl = async fileUrl => {
  if (!fileUrl) return null;

  const assetInfo = parseCloudinaryAssetInfo(fileUrl);
  if (!assetInfo) {
    return fileUrl;
  }

  const { publicId, publicIdWithExt, version } = assetInfo;
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;

  const candidates = [
    cloudinary.utils.private_download_url(publicId, 'pdf', {
      resource_type: 'raw',
      type: 'upload',
      expires_at: expiresAt,
    }),
    cloudinary.utils.private_download_url(publicIdWithExt, null, {
      resource_type: 'raw',
      type: 'upload',
      expires_at: expiresAt,
    }),
    cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'upload',
      secure: true,
      sign_url: true,
      version,
      format: 'pdf',
    }),
    cloudinary.url(publicIdWithExt, {
      resource_type: 'raw',
      type: 'upload',
      secure: true,
      sign_url: true,
      version,
    }),
    fileUrl,
  ];

  const uniqueCandidates = [...new Set(candidates.filter(Boolean))];

  for (const candidate of uniqueCandidates) {
    if (await canAccessUrl(candidate)) {
      return candidate;
    }
  }

  return fileUrl;
};

/**
 * Service: Create a new prescription for an appointment
 */
export const createPrescription = async (req, prescriptionData) => {
  const { appointmentId, patientId, diagnosis, notes, validTill, medicines } =
    prescriptionData;

  // Verify appointment exists and belongs to this doctor
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    doctor_id: req.doctor._id,
    patient_id: patientId,
  });

  if (!appointment) {
    throw {
      status: 404,
      message: 'Appointment not found or unauthorized',
    };
  }

  // Check if appointment already has a prescription
  if (appointment.prescription_generated) {
    throw {
      status: 400,
      message: 'Prescription already exists for this appointment',
    };
  }

  // Verify appointment is completed or in-progress
  if (!['completed', 'in-progress'].includes(appointment.status)) {
    throw {
      status: 400,
      message:
        'Can only create prescription for completed or in-progress appointments',
    };
  }

  // Create the main prescription document
  const prescription = await PrescriptionGeneratedByDoctor.create({
    doctor_id: req.doctor._id,
    patient_id: patientId,
    appointment_id: appointmentId,
    diagnosis_reason: diagnosis,
    special_instructions: notes || '',
    valid_till: validTill,
    status: 'finalized',
  });

  // Create prescription items
  const prescriptionItems = await Promise.all(
    medicines.map(medicine =>
      PrescriptionItem.create({
        prescription_id: prescription._id,
        medicine_id: medicine.medicineId,
        form: medicine.form,
        dosage: medicine.dosage,
        frequency: medicine.frequency,
        duration_days: medicine.durationDays,
        quantity_prescribed: medicine.quantityPrescribed,
      })
    )
  );

  // Update prescription with item IDs
  prescription.prescription_items_ids = prescriptionItems.map(item => item._id);
  await prescription.save();

  // Update appointment with prescription reference
  appointment.prescription_generated = prescription._id;
  await appointment.save();

  // Generate PDF
  const pdfUrl = await generatePrescriptionPDF(prescription._id, medicines);

  // Update prescription with PDF URL
  prescription.file_url = pdfUrl;
  await prescription.save();

  // Log activity
  await logDoctorActivity(
    req,
    'create_prescription',
    `Created prescription for appointment ${appointmentId}`,
    'PrescriptionGeneratedByDoctor',
    prescription._id,
    { appointmentId, patientId, medicineCount: medicines.length }
  );

  return prescription;
};

/**
 * Service: Get prescription by appointment ID
 */
export const getPrescriptionByAppointment = async (req, appointmentId) => {
  const prescription = await PrescriptionGeneratedByDoctor.findOne({
    appointment_id: appointmentId,
    doctor_id: req.doctor._id,
  })
    .populate('prescription_items_ids')
    .populate('doctor_id', 'fullName email specialization license_number')
    .populate('patient_id', 'name email phone')
    .populate('appointment_id', 'status appointment_type created_at');

  if (!prescription) {
    throw {
      status: 404,
      message: 'Prescription not found',
    };
  }

  return prescription;
};

/**
 * Service: Get all prescriptions for a patient
 */
export const getPrescriptionsByPatient = async (req, patientId) => {
  // Verify the doctor has treated this patient
  const hasAppointment = await Appointment.findOne({
    doctor_id: req.doctor._id,
    patient_id: patientId,
  });

  if (!hasAppointment) {
    throw {
      status: 403,
      message: 'You have not treated this patient',
    };
  }

  const prescriptions = await PrescriptionGeneratedByDoctor.find({
    patient_id: patientId,
    doctor_id: req.doctor._id,
  })
    .populate('prescription_items_ids')
    .populate('appointment_id', 'status appointment_type created_at')
    .sort({ created_at: -1 });

  return prescriptions;
};

/**
 * Service: Update an existing prescription
 */
export const updatePrescription = async (req, prescriptionId, updateData) => {
  const prescription = await PrescriptionGeneratedByDoctor.findOne({
    _id: prescriptionId,
    doctor_id: req.doctor._id,
  });

  if (!prescription) {
    throw {
      status: 404,
      message: 'Prescription not found or unauthorized',
    };
  }

  // Check if prescription is already cancelled
  if (prescription.status === 'cancelled') {
    throw {
      status: 400,
      message: 'Cannot update a cancelled prescription',
    };
  }

  // Update basic fields
  if (updateData.diagnosis) {
    prescription.diagnosis_reason = updateData.diagnosis;
  }
  if (updateData.notes !== undefined) {
    prescription.special_instructions = updateData.notes;
  }
  if (updateData.validTill) {
    prescription.valid_till = updateData.validTill;
  }
  if (updateData.status) {
    prescription.status = updateData.status;
  }

  // Update medicines if provided
  if (updateData.medicines && updateData.medicines.length > 0) {
    // Delete old prescription items
    await PrescriptionItem.deleteMany({
      prescription_id: prescription._id,
    });

    // Create new prescription items
    const newItems = await Promise.all(
      updateData.medicines.map(medicine =>
        PrescriptionItem.create({
          prescription_id: prescription._id,
          medicine_id: medicine.medicineId,
          form: medicine.form,
          dosage: medicine.dosage,
          frequency: medicine.frequency,
          duration_days: medicine.durationDays,
          quantity_prescribed: medicine.quantityPrescribed,
        })
      )
    );

    prescription.prescription_items_ids = newItems.map(item => item._id);

    // Regenerate PDF
    const pdfUrl = await generatePrescriptionPDF(
      prescription._id,
      updateData.medicines
    );
    prescription.file_url = pdfUrl;
  }

  await prescription.save();

  // Log activity
  await logDoctorActivity(
    req,
    'update_prescription',
    `Updated prescription ${prescriptionId}`,
    'PrescriptionGeneratedByDoctor',
    prescription._id,
    updateData
  );

  return prescription;
};

/**
 * Service: Get prescription PDF URL
 */
export const getPrescriptionPDF = async (req, prescriptionId) => {
  const prescription = await PrescriptionGeneratedByDoctor.findOne({
    _id: prescriptionId,
    doctor_id: req.doctor._id,
  }).populate({
    path: 'prescription_items_ids',
    populate: {
      path: 'medicine_id',
      select: 'Name name',
    },
  });

  if (!prescription) {
    throw {
      status: 404,
      message: 'Prescription not found or unauthorized',
    };
  }

  const currentPdfUrl = prescription.file_url || '';
  const isLegacyImagePdf = currentPdfUrl.includes('/image/upload/');
  const isMissingPdf = !currentPdfUrl;

  if (isMissingPdf || isLegacyImagePdf) {
    const medicinesData = (prescription.prescription_items_ids || []).map(
      item => ({
        medicineName:
          item?.medicine_id?.Name || item?.medicine_id?.name || 'Medicine',
        dosage: item?.dosage || 'N/A',
        frequency: item?.frequency || 'N/A',
        durationDays: item?.duration_days || 0,
        quantityPrescribed: item?.quantity_prescribed || 0,
        instructions: '',
      })
    );

    const regeneratedUrl = await generatePrescriptionPDF(
      prescription._id,
      medicinesData
    );
    prescription.file_url = regeneratedUrl;
    await prescription.save();

    return {
      pdfUrl: await buildAccessiblePrescriptionUrl(regeneratedUrl),
      originalUrl: regeneratedUrl,
    };
  }

  return {
    pdfUrl: await buildAccessiblePrescriptionUrl(prescription.file_url),
    originalUrl: prescription.file_url,
  };
};

/**
 * Helper: Generate Prescription PDF
 */
const generatePrescriptionPDF = async (prescriptionId, medicinesData) => {
  try {
    // Fetch full prescription details
    const prescription = await PrescriptionGeneratedByDoctor.findById(
      prescriptionId
    )
      .populate('doctor_id')
      .populate('patient_id')
      .populate('prescription_items_ids');

    if (!prescription) {
      throw new Error('Prescription not found');
    }

    const doctor = prescription.doctor_id;
    const patient = prescription.patient_id;

    // Create temporary directory if it doesn't exist
    const tempDir = path.join(__dirname, '../../../../../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `prescription_${prescriptionId}_${Date.now()}.pdf`;
    const filePath = path.join(tempDir, fileName);

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header Section
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('MEDICAL PRESCRIPTION', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666666');
    doc.text('Philbox Healthcare Platform', { align: 'center' });
    doc.moveDown(1);

    // Line separator
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();
    doc.moveDown(1);

    // Doctor Information Section
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000');
    doc.text('DOCTOR INFORMATION', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Name: Dr. ${doctor.fullName}`);
    if (doctor.specialization && doctor.specialization.length > 0) {
      doc.text(`Specialization: ${doctor.specialization.join(', ')}`);
    }
    if (doctor.license_number) {
      doc.text(`License Number: ${doctor.license_number}`);
    }
    doc.text(`Email: ${doctor.email}`);
    if (doctor.contactNumber) {
      doc.text(`Contact: ${doctor.contactNumber}`);
    }
    doc.moveDown(1);

    // Patient Information Section
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('PATIENT INFORMATION', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Name: ${patient.fullName || patient.name || 'N/A'}`);
    if (patient.email) {
      doc.text(`Email: ${patient.email}`);
    }
    doc.text(`Date: ${new Date(prescription.created_at).toLocaleDateString()}`);
    doc.text(
      `Valid Till: ${new Date(prescription.valid_till).toLocaleDateString()}`
    );
    doc.moveDown(1);

    // Diagnosis Section
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('DIAGNOSIS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(prescription.diagnosis_reason || 'Not specified', {
      align: 'left',
    });
    doc.moveDown(1);

    // Rx Symbol and Medicines Section
    doc.fontSize(16).font('Helvetica-Bold');
    doc.text('℞', { align: 'left' });
    doc.moveDown(0.5);

    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('PRESCRIBED MEDICINES', { underline: true });
    doc.moveDown(0.5);

    // Table Header
    const tableTop = doc.y;
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Medicine', 50, tableTop, { width: 150 });
    doc.text('Dosage', 200, tableTop, { width: 80 });
    doc.text('Frequency', 280, tableTop, { width: 100 });
    doc.text('Duration', 380, tableTop, { width: 70 });
    doc.text('Qty', 450, tableTop, { width: 50 });

    // Draw line under header
    doc
      .strokeColor('#cccccc')
      .lineWidth(0.5)
      .moveTo(50, doc.y + 2)
      .lineTo(550, doc.y + 2)
      .stroke();

    doc.moveDown(0.5);

    // Table Rows
    doc.fontSize(9).font('Helvetica');
    for (const [index, medicine] of medicinesData.entries()) {
      const rowY = doc.y;

      doc.text(medicine.medicineName, 50, rowY, { width: 150 });
      doc.text(medicine.dosage, 200, rowY, { width: 80 });
      doc.text(medicine.frequency, 280, rowY, { width: 100 });
      doc.text(`${medicine.durationDays} days`, 380, rowY, { width: 70 });
      doc.text(medicine.quantityPrescribed.toString(), 450, rowY, {
        width: 50,
      });

      // Add instructions if available
      if (medicine.instructions) {
        doc.moveDown(0.3);
        doc
          .fontSize(8)
          .fillColor('#666666')
          .text(`Instructions: ${medicine.instructions}`, 50, doc.y, {
            width: 500,
          })
          .fillColor('#000000');
      }

      doc.moveDown(0.8);

      // Draw separator line
      if (index < medicinesData.length - 1) {
        doc
          .strokeColor('#eeeeee')
          .lineWidth(0.5)
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke();
        doc.moveDown(0.5);
      }
    }

    doc.moveDown(1);

    // Special Instructions/Notes Section
    if (
      prescription.special_instructions &&
      prescription.special_instructions.trim()
    ) {
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('SPECIAL INSTRUCTIONS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(prescription.special_instructions, { align: 'left' });
      doc.moveDown(1);
    }

    // Footer Section
    doc.moveDown(2);
    const signatureTopY = doc.y;
    const signatureX = 350;
    const signatureWidth = 150;
    const signatureHeight = 55;

    const signatureBuffer = await getImageBufferFromUrl(
      doctor.digital_signature
    );

    if (signatureBuffer) {
      doc.image(signatureBuffer, signatureX, signatureTopY, {
        fit: [signatureWidth, signatureHeight],
        align: 'center',
      });
      doc.y = signatureTopY + signatureHeight + 6;
      doc.fontSize(10).font('Helvetica-Oblique');
      doc.text("Doctor's Signature", signatureX, doc.y, {
        width: signatureWidth,
        align: 'center',
      });
    } else {
      doc
        .strokeColor('#cccccc')
        .lineWidth(0.5)
        .moveTo(signatureX, signatureTopY)
        .lineTo(signatureX + signatureWidth, signatureTopY)
        .stroke();
      doc.y = signatureTopY + 6;
      doc.fontSize(10).font('Helvetica-Oblique');
      doc.text("Doctor's Signature", signatureX, doc.y, {
        width: signatureWidth,
        align: 'center',
      });
    }
    doc.moveDown(1);

    // Footer Note
    doc.fontSize(8).font('Helvetica').fillColor('#999999');
    doc.text(
      'This is a digitally generated prescription. Please verify the authenticity with the doctor if needed.',
      50,
      doc.page.height - 80,
      { align: 'center', width: 500 }
    );

    // Finalize PDF
    doc.end();

    // Wait for PDF to be written
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(
      filePath,
      'prescriptions/pdfs',
      {
        resource_type: 'raw',
        type: 'upload',
        invalidate: true,
      }
    );

    return cloudinaryUrl;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate prescription PDF: ${error.message}`);
  }
};
