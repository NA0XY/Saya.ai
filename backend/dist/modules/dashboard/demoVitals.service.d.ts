import type { DemoVital } from '../../types/database';
export declare const demoVitalsService: {
    getDemoVitals(patientId: string, metric?: string): Promise<DemoVital[]>;
    seedDemoVitals(patientId: string): Promise<void>;
};
//# sourceMappingURL=demoVitals.service.d.ts.map