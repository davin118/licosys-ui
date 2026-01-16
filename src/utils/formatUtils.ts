export const formatCurrency = (value: number) =>
    value.toLocaleString("es-ES", {
        style: "currency",
        currency: "EUR",
    });
