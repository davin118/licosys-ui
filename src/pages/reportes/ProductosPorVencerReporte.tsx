import { useCallback, useMemo } from "react";
import type { TableProps } from "antd";
import ReportTableCard from "../../components/reportes/ReportTableCard";
import ReportSummary from "../../components/reportes/ReportSummary";
import { getProductosPorVencerReporte } from "../../api/reportsApi";
import { useReportLoader } from "../../hooks/useReportLoader";
import type { ProductoPorVencerReporteItem } from "../../interfaces/reportes";
import { formatDate } from "../../utils/dateUtils";

export default function ProductosPorVencerReporte() {
    const fetchProductosPorVencer = useCallback(async () => {
        const res = await getProductosPorVencerReporte();
        return res.data;
    }, []);

    const { data, error, loading } = useReportLoader<ProductoPorVencerReporteItem>(fetchProductosPorVencer);

    const summary = useMemo(() => {
        const masUrgente = data.reduce<ProductoPorVencerReporteItem | null>(
            (actual, item) => (!actual || item.diasRestantes < actual.diasRestantes ? item : actual),
            null
        );

        return (
            <ReportSummary
                items={[
                    { label: "Productos próximos", value: data.length },
                    {
                        label: "Vence primero",
                        value: masUrgente ? `${masUrgente.producto} (${masUrgente.diasRestantes} días)` : "Sin alertas",
                    },
                ]}
            />
        );
    }, [data]);

    const columns: TableProps<ProductoPorVencerReporteItem>["columns"] = [
        { title: "Producto", dataIndex: "producto" },
        { title: "Categoría", dataIndex: "categoria" },
        { title: "Proveedor", dataIndex: "proveedor" },
        {
            title: "Fecha de Vencimiento",
            dataIndex: "fechaVencimiento",
            render: (value: string) => formatDate(value),
        },
        { title: "Días Restantes", dataIndex: "diasRestantes" },
    ];

    return (
        <ReportTableCard
            columns={columns}
            data={data}
            emptyDescription="No hay productos próximos a vencer."
            error={error}
            exportColumns={["Producto", "Categoría", "Proveedor", "Fecha de Vencimiento", "Días Restantes"]}
            exportRows={data.map((item) => [
                item.producto,
                item.categoria,
                item.proveedor,
                formatDate(item.fechaVencimiento),
                item.diasRestantes,
            ])}
            fileName="productos-por-vencer"
            loading={loading}
            rowKey="producto"
            summary={summary}
        />
    );
}
