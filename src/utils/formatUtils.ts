export const formatCurrency = (value: number) =>
    value.toLocaleString("es-NI", {
        style: "currency",
        currency: "NIO",
    });
