export declare function toIST(date: Date | string): Date;
export declare function formatIST(date: Date | string, formatStr: string): string;
export declare function parseScheduleTime(timeStr: string): {
    hours: number;
    minutes: number;
};
export declare function shiftTimeByMinutes(timeStr: string, deltaMinutes: number): string;
export declare function convertLocalTimeToIst(timeStr: string, timezoneOffsetMinutes?: number): string;
export declare function getNextOccurrence(timeStr: string): Date;
export declare function isoNow(): string;
//# sourceMappingURL=dateTime.d.ts.map