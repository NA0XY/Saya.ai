"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_PRESCRIPTIONS = void 0;
const DEMO_PATIENT_ID = 'demo-patient-uuid';
const now = new Date().toISOString();
exports.DEMO_PRESCRIPTIONS = [
    { id: 'demo-rx-dolo', patient_id: DEMO_PATIENT_ID, drug_name: 'Dolo-650', dosage: '250mg', frequency: 'twice daily', verified: true, image_url: '/uploads/demo/dolo.png', created_at: now },
    { id: 'demo-rx-metoprolol', patient_id: DEMO_PATIENT_ID, drug_name: 'Metoprolol', dosage: '25mg', frequency: 'once daily', verified: true, image_url: '/uploads/demo/metoprolol.png', created_at: now },
    { id: 'demo-rx-atorvastatin', patient_id: DEMO_PATIENT_ID, drug_name: 'Atorvastatin', dosage: '10mg', frequency: 'once at night', verified: true, image_url: '/uploads/demo/atorvastatin.png', created_at: now },
    { id: 'demo-rx-telma-am', patient_id: DEMO_PATIENT_ID, drug_name: 'Telma-AM', dosage: '40mg', frequency: 'once morning', verified: true, image_url: '/uploads/demo/telma-am.png', created_at: now },
    { id: 'demo-rx-metformin', patient_id: DEMO_PATIENT_ID, drug_name: 'Metformin', dosage: '500mg', frequency: 'twice daily', verified: true, image_url: '/uploads/demo/metformin.png', created_at: now },
    { id: 'demo-rx-pantoprazole', patient_id: DEMO_PATIENT_ID, drug_name: 'Pantoprazole', dosage: '40mg', frequency: 'before breakfast', verified: true, image_url: '/uploads/demo/pantoprazole.png', created_at: now },
    { id: 'demo-rx-levothyroxine', patient_id: DEMO_PATIENT_ID, drug_name: 'Levothyroxine', dosage: '50mcg', frequency: 'empty stomach', verified: true, image_url: '/uploads/demo/levothyroxine.png', created_at: now },
    { id: 'demo-rx-amlodipine', patient_id: DEMO_PATIENT_ID, drug_name: 'Amlodipine', dosage: '5mg', frequency: 'once daily', verified: true, image_url: '/uploads/demo/amlodipine.png', created_at: now }
];
//# sourceMappingURL=demoPrescriptions.js.map