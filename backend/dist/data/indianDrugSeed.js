"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INDIAN_DRUG_INTERACTIONS = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const supabase_1 = require("../config/supabase");
exports.INDIAN_DRUG_INTERACTIONS = [
    { drug_name: 'Atorvastatin', drug_aliases: ['Atorva', 'Lipitor', 'Storvas'], interaction_type: 'food', interacting_substance: 'Grapefruit', severity: 'high', description_en: 'Grapefruit significantly increases atorvastatin blood levels causing muscle damage risk', description_hi: null, source: 'indian_db' },
    { drug_name: 'Atorvastatin', drug_aliases: ['Atorva', 'Lipitor', 'Storvas'], interaction_type: 'food', interacting_substance: 'Excess mango', severity: 'moderate', description_en: 'Mango juice may moderately increase statin absorption', description_hi: null, source: 'indian_db' },
    { drug_name: 'Atorvastatin', drug_aliases: ['Atorva', 'Lipitor', 'Storvas'], interaction_type: 'food', interacting_substance: 'Alcohol', severity: 'high', description_en: 'Alcohol combined with statins increases liver damage risk', description_hi: null, source: 'indian_db' },
    { drug_name: 'Metoprolol', drug_aliases: ['Betaloc', 'Metolar', 'Metpure'], interaction_type: 'food', interacting_substance: 'Excessive chai', severity: 'moderate', description_en: 'Caffeine in chai can counteract beta-blocker effects and raise heart rate', description_hi: null, source: 'indian_db' },
    { drug_name: 'Metoprolol', drug_aliases: ['Betaloc', 'Metolar', 'Metpure'], interaction_type: 'food', interacting_substance: 'Coffee', severity: 'moderate', description_en: 'Caffeine antagonises the heart rate lowering effect of Metoprolol', description_hi: null, source: 'indian_db' },
    { drug_name: 'Dolo-650', drug_aliases: ['Paracetamol', 'Crocin', 'Calpol'], interaction_type: 'food', interacting_substance: 'Alcohol', severity: 'high', description_en: 'Alcohol with paracetamol causes severe hepatotoxicity even at normal doses', description_hi: null, source: 'indian_db' },
    { drug_name: 'Dolo-650', drug_aliases: ['Paracetamol', 'Crocin', 'Calpol'], interaction_type: 'food', interacting_substance: 'Curd (if liver sensitivity)', severity: 'low', description_en: 'Fermented foods may mildly affect paracetamol metabolism in sensitive individuals', description_hi: null, source: 'indian_db' },
    { drug_name: 'Telma-AM', drug_aliases: ['Telmisartan+Amlodipine'], interaction_type: 'food', interacting_substance: 'Excess salt', severity: 'high', description_en: 'High dietary sodium directly counteracts the antihypertensive effect of Telmisartan', description_hi: null, source: 'indian_db' },
    { drug_name: 'Telma-AM', drug_aliases: ['Telmisartan+Amlodipine'], interaction_type: 'food', interacting_substance: 'Banana', severity: 'moderate', description_en: 'Bananas are high in potassium; Telmisartan also raises potassium causing hyperkalaemia risk', description_hi: null, source: 'indian_db' },
    { drug_name: 'Metformin', drug_aliases: ['Glycomet', 'Glucophage', 'Obimet'], interaction_type: 'food', interacting_substance: 'Alcohol', severity: 'high', description_en: 'Alcohol increases risk of lactic acidosis in patients on Metformin', description_hi: null, source: 'indian_db' },
    { drug_name: 'Metformin', drug_aliases: ['Glycomet', 'Glucophage', 'Obimet'], interaction_type: 'food', interacting_substance: 'White rice in excess', severity: 'moderate', description_en: 'High glycaemic index foods reduce Metformin efficacy and spike blood sugar', description_hi: null, source: 'indian_db' },
    { drug_name: 'Amlodipine', drug_aliases: ['Amlong', 'Stamlo', 'Norvasc'], interaction_type: 'food', interacting_substance: 'Grapefruit', severity: 'moderate', description_en: 'Grapefruit juice increases amlodipine plasma levels increasing hypotension risk', description_hi: null, source: 'indian_db' },
    { drug_name: 'Warfarin', drug_aliases: ['Warf', 'Sofarin', 'Coumadin'], interaction_type: 'food', interacting_substance: 'Leafy greens (palak, methi)', severity: 'high', description_en: 'Vitamin K in leafy greens significantly reduces anticoagulant effect of Warfarin', description_hi: null, source: 'indian_db' },
    { drug_name: 'Warfarin', drug_aliases: ['Warf', 'Sofarin', 'Coumadin'], interaction_type: 'food', interacting_substance: 'Alcohol', severity: 'high', description_en: 'Alcohol unpredictably alters Warfarin metabolism increasing bleeding risk', description_hi: null, source: 'indian_db' },
    { drug_name: 'Ciprofloxacin', drug_aliases: ['Ciplox', 'Cifran', 'Ziproc'], interaction_type: 'food', interacting_substance: 'Milk and dairy', severity: 'moderate', description_en: 'Calcium in dairy chelates ciprofloxacin reducing absorption by up to 50%', description_hi: null, source: 'indian_db' },
    { drug_name: 'Ciprofloxacin', drug_aliases: ['Ciplox', 'Cifran', 'Ziproc'], interaction_type: 'food', interacting_substance: 'Iron supplements', severity: 'high', description_en: 'Iron binds ciprofloxacin in gut drastically reducing bioavailability', description_hi: null, source: 'indian_db' },
    { drug_name: 'Levothyroxine', drug_aliases: ['Eltroxin', 'Thyronorm'], interaction_type: 'food', interacting_substance: 'Soya products', severity: 'high', description_en: 'Soya isoflavones interfere with levothyroxine absorption; take 4 hours apart', description_hi: null, source: 'indian_db' },
    { drug_name: 'Levothyroxine', drug_aliases: ['Eltroxin', 'Thyronorm'], interaction_type: 'food', interacting_substance: 'Calcium-rich foods', severity: 'moderate', description_en: 'Calcium reduces levothyroxine absorption; take on empty stomach', description_hi: null, source: 'indian_db' },
    { drug_name: 'Lisinopril', drug_aliases: ['Listril', 'Lisoril', 'Zestril'], interaction_type: 'food', interacting_substance: 'Banana', severity: 'moderate', description_en: 'ACE inhibitors raise potassium; bananas add potassium load causing hyperkalaemia', description_hi: null, source: 'indian_db' },
    { drug_name: 'Lisinopril', drug_aliases: ['Listril', 'Lisoril', 'Zestril'], interaction_type: 'food', interacting_substance: 'Salt substitutes', severity: 'high', description_en: 'Many salt substitutes contain potassium chloride, dangerous with ACE inhibitors', description_hi: null, source: 'indian_db' },
    { drug_name: 'Aspirin', drug_aliases: ['Ecosprin', 'Disprin', 'Aspirin'], interaction_type: 'food', interacting_substance: 'Alcohol', severity: 'moderate', description_en: 'Alcohol increases GI bleeding risk when combined with aspirin', description_hi: null, source: 'indian_db' },
    { drug_name: 'Pantoprazole', drug_aliases: ['Pan-D', 'Pantocid', 'Pantop'], interaction_type: 'drug', interacting_substance: 'Clopidogrel', severity: 'high', description_en: 'Pantoprazole reduces antiplatelet efficacy of Clopidogrel increasing clot risk', description_hi: null, source: 'indian_db' },
    { drug_name: 'Metoprolol', drug_aliases: ['Betaloc', 'Metolar'], interaction_type: 'drug', interacting_substance: 'Verapamil', severity: 'high', description_en: 'Combined use causes severe bradycardia and heart block; never combine', description_hi: null, source: 'indian_db' },
    { drug_name: 'Dolo-650', drug_aliases: ['Paracetamol'], interaction_type: 'drug', interacting_substance: 'Other paracetamol-containing products', severity: 'high', description_en: 'Double dosing paracetamol from multiple products causes liver failure', description_hi: null, source: 'indian_db' }
];
async function seed() {
    logger_1.logger.info('[SEED] Starting Indian drug interaction seed', { count: exports.INDIAN_DRUG_INTERACTIONS.length, project: env_1.env.SUPABASE_URL });
    for (const entry of exports.INDIAN_DRUG_INTERACTIONS) {
        const { error } = await supabase_1.supabase.from('drug_interactions').upsert(entry, { onConflict: 'drug_name,interaction_type,interacting_substance' });
        if (error) {
            logger_1.logger.error('[SEED] Drug interaction upsert failed', { drug: entry.drug_name, substance: entry.interacting_substance, error: error.message });
            throw error;
        }
        logger_1.logger.info('[SEED] Drug interaction upserted', { drug: entry.drug_name, substance: entry.interacting_substance });
    }
}
if (require.main === module) {
    seed()
        .then(() => process.exit(0))
        .catch((error) => {
        logger_1.logger.error('[SEED] Failed', { message: error.message, stack: error.stack });
        process.exit(1);
    });
}
//# sourceMappingURL=indianDrugSeed.js.map