import dayjs from "dayjs";

export const formatDate = (date?: string) =>
    date ? dayjs(date).format("DD/MM/YYYY") : "";
