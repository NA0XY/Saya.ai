"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toIST = toIST;
exports.formatIST = formatIST;
exports.parseScheduleTime = parseScheduleTime;
exports.getNextOccurrence = getNextOccurrence;
exports.isoNow = isoNow;
const date_fns_1 = require("date-fns");
const IST_OFFSET_MINUTES = 330;
function toIST(date) {
    const parsed = typeof date === 'string' ? new Date(date) : date;
    return new Date(parsed.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
}
function formatIST(date, formatStr) {
    return (0, date_fns_1.format)(toIST(date), formatStr);
}
function parseScheduleTime(timeStr) {
    const match = /^(\d{2}):(\d{2})$/.exec(timeStr);
    if (!match)
        throw new Error('Schedule time must be in HH:MM format');
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59)
        throw new Error('Schedule time must be a valid HH:MM time');
    return { hours, minutes };
}
function getNextOccurrence(timeStr) {
    const { hours, minutes } = parseScheduleTime(timeStr);
    const nowUtc = new Date();
    const nowIst = toIST(nowUtc);
    const nextIst = new Date(nowIst);
    nextIst.setHours(hours, minutes, 0, 0);
    const finalIst = nextIst.getTime() <= nowIst.getTime() ? (0, date_fns_1.addDays)(nextIst, 1) : nextIst;
    return new Date(finalIst.getTime() - IST_OFFSET_MINUTES * 60 * 1000);
}
function isoNow() {
    return new Date().toISOString();
}
//# sourceMappingURL=dateTime.js.map