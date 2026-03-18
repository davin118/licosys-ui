import { useCallback, useMemo } from "react";
import type { TableProps } from "antd";
import { getVentasPorUsuarioReporte } from "../../api/reportsApi";
import ReportTableCard from "../../components/reportes/ReportTableCard";
import ReportSummary from "../../components/reportes/ReportSummary";
import { useReportLoader } from "../../hooks/useReportLoader";
import type { VentaPorUsuarioReporteItem } from "../../interfaces/reportes";
import { formatCurrency } from "../../utils/formatUtils";

export default function VentasPorUsuarioReporte() {
    const fetchVentasPorUsuario = useCallback(async () => {
        const res = await getVentasPorUsuarioReporte();
        return res.data;
    }, []);

    const { data, error, loading } = useReportLoader<VentaPorUsuarioReporteItem>(fetchVentasPorUsuario);

    const summary = useMemo(() => {
        const totalVentas = data.reduce((acc, item) => acc + item.totalVentas, 0);
        const operaciones = data.reduce((acc, item) => acc + item.cantidadVentas, 0);

        return (
            <ReportSummary
                items={[
                    { label: "Usuarios con ventas", value: data.length },
                    { label: "Operaciones", value: operaciones },
                    { label: "Total vendido", value: formatCurrency(totalVentas) },
                    { label: "Mejor vendedor", value: data[0]?.usuario ?? "Sin datos" },
                ]}
            />
        );
    }, [data]);

    const columns: TableProps<VentaPorUsuarioReporteItem>["columns"] = [
        { title: "Usuario", dataIndex: "usuario" },
        { title: "Ventas Registradas", dataIndex: "cantidadVentas" },
        {
            title: "Total Vendido",
            dataIndex: "totalVentas",
            render: (value: number) => formatCurrency(value),
        },
    ];

    return (
        <ReportTableCard
            columns={columns}
            data={data}
            emptyDescription="No hay ventas registradas por usuario."
            error={error}
            exportColumns={["Usuario", "Cantidad de Ventas", "Total Vendido"]}
            exportRows={data.map((item) => [
                item.usuario,
                item.cantidadVentas,
                formatCurrency(item.totalVentas),
            ])}
            fileName="ventas_por_usuario"
            loading={loading}
            rowKey="usuario"
            summary={summary}
        />
    );
}
