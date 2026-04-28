"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prescriptionUpload = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const env_1 = require("./env");
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']);
const prescriptionDir = path_1.default.resolve(process.cwd(), env_1.env.UPLOAD_DIR, 'prescriptions');
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        fs_1.default.mkdirSync(prescriptionDir, { recursive: true });
        cb(null, prescriptionDir);
    },
    filename: (_req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
        cb(null, `${Date.now()}-${(0, uuid_1.v4)()}-${safeName}`);
    }
});
exports.prescriptionUpload = (0, multer_1.default)({
    storage,
    fileFilter: (_req, file, cb) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            cb(new Error('Only JPEG, PNG, WEBP, HEIC images and PDF files are allowed'));
            return;
        }
        cb(null, true);
    },
    limits: { fileSize: env_1.env.MAX_FILE_SIZE_MB * 1024 * 1024 }
});
//# sourceMappingURL=upload.js.map