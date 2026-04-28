"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePrescriptionUpload = handlePrescriptionUpload;
exports.handleMedicineImageUpload = handleMedicineImageUpload;
const path_1 = __importDefault(require("path"));
const upload_1 = require("../config/upload");
function handlePrescriptionUpload(req, res, next) {
    upload_1.prescriptionUpload.single('prescription')(req, res, (error) => {
        if (error) {
            next(error instanceof Error ? error : new Error('Upload failed'));
            return;
        }
        if (req.file) {
            req.file.publicPath = path_1.default.join('uploads', 'prescriptions', req.file.filename).split(path_1.default.sep).join('/');
        }
        next();
    });
}
function handleMedicineImageUpload(req, res, next) {
    upload_1.prescriptionUpload.single('image')(req, res, (error) => {
        if (error) {
            next(error instanceof Error ? error : new Error('Upload failed'));
            return;
        }
        if (req.file) {
            req.file.publicPath = path_1.default.join('uploads', 'prescriptions', req.file.filename).split(path_1.default.sep).join('/');
        }
        next();
    });
}
//# sourceMappingURL=upload.middleware.js.map