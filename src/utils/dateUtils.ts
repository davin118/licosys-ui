import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const DATE_FORMATS = [
    "YYYY-MM-DDTHH:mm:ss",
    "YYYY-MM-DDTHH:mm:ss.SSS",
    "YYYY-MM-DDTHH:mm:ssZ",
    "YYYY-MM-DDTHH:mm:ss.SSSZ",
    "YYYY-MM-DD HH:mm:ss",
    "YYYY-MM-DD",
    "DD/MM/YYYY HH:mm:ss",
    "DD/MM/YYYY HH:mm",
    "DD/MM/YYYY",
    "MM/DD/YYYY HH:mm:ss",
    "MM/DD/YYYY HH:mm",
    "MM/DD/YYYY",
];

export function parseDate(value?: string | Date | null) {
    if (!value) return null;

    if (value instanceof Date) {
        const parsed = dayjs(value);
        return parsed.isValid() ? parsed : null;
    }

    const direct = dayjs(value);
    if (direct.isValid()) {
        return direct;
    }

    for (const format of DATE_FORMATS) {
        const parsed = dayjs(value, format, true);
        if (parsed.isValid()) {
            return parsed;
        }
    }

    return null;
}

export const formatDate = (date?: string | Date | null, fallback = "-") => {
    const parsed = parseDate(date);
    return parsed ? parsed.format("DD/MM/YYYY") : fallback;
};

export const formatDateTime = (date?: string | Date | null, fallback = "-") => {
    const parsed = parseDate(date);
    return parsed ? parsed.format("DD/MM/YYYY HH:mm") : fallback;
};
