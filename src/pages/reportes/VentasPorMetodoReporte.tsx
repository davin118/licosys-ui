import { useCallback, useMemo } from "react";
import type { TableProps } from "antd";
import { getVentasPorMetodoReporte } from "../../api/reportsApi";
import ReportTableCard from "../../components/reportes/ReportTableCard";
import ReportSummary from "../../components/reportes/ReportSummary";
import { useReportLoader } from "../../hooks/useReportLoader";
import type { VentaPorMetodoReporteItem } from "../../interfaces/reportes";
import { formatCurrency } from "../../utils/formatUtils";

export default function VentasPorMetodoReporte() {
    const fetchVentasPorMetodo = useCallback(async () => {
        const res = await getVentasPorMetodoReporte();
        return res.data;
    }, []);

    const { data, error, loading } = useReportLoader<VentaPorMetodoReporteItem>(fetchVentasPorMetodo);

    const summary = useMemo(() => {
        const totalVentas = data.reduce((acc, item) => acc + item.totalVentas, 0);
        const transacciones = data.reduce((acc, item) => acc + item.cantidadVentas, 0);

        return (
            <ReportSummary
                items={[
                    { label: "Métodos activos", value: data.length },
                    { label: "Transacciones", value: transacciones },
                    { label: "Total cobrado", value: formatCurrency(totalVentas) },
                    { label: "Método principal", value: data[0]?.metodoPago ?? "Sin datos" },
                ]}
            />
        );
    }, [data]);

    const columns: TableProps<VentaPorMetodoReporteItem>["columns"] = [
        { title: "Método de Pago", dataIndex: "metodoPago" },
        { title: "Ventas", dataIndex: "cantidadVentas" },
        {
            title: "Total",
            dataIndex: "totalVentas",
            render: (value: number) => formatCurrency(value),
        },
    ];

    return (
        <ReportTableCard
            columns={columns}
            data={data}
            emptyDescription="No hay ventas registradas por método de pago."
            error={error}
            exportColumns={["Método de Pago", "Cantidad de Ventas", "Total"]}
            exportRows={data.map((item) => [
                item.metodoPago,
                item.cantidadVentas,
                formatCurrency(item.totalVentas),
            ])}
            fileName="ventas_por_metodo"
            loading={loading}
            rowKey="metodoPago"
            summary={summary}
        />
    );
}
