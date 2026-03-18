import { useCallback, useMemo } from "react";
import type { TableProps } from "antd";
import ReportTableCard from "../../components/reportes/ReportTableCard";
import ReportSummary from "../../components/reportes/ReportSummary";
import { getInventarioReporte } from "../../api/reportsApi";
import { useReportLoader } from "../../hooks/useReportLoader";
import type { InventarioReporteItem } from "../../interfaces/reportes";
import { formatCurrency } from "../../utils/formatUtils";

export default function InventarioReporte() {
    const fetchInventario = useCallback(async () => {
        const res = await getInventarioReporte();
        return res.data;
    }, []);

    const { data, error, loading } = useReportLoader<InventarioReporteItem>(fetchInventario);

    const summary = useMemo(() => {
        const totalStock = data.reduce((acc, item) => acc + item.stock, 0);
        const valorEstimado = data.reduce((acc, item) => acc + (item.stock * item.precio), 0);

        return (
            <ReportSummary
                items={[
                    { label: "Productos", value: data.length },
                    { label: "Unidades en stock", value: totalStock },
                    { label: "Valor estimado", value: formatCurrency(valorEstimado) },
                ]}
            />
        );
    }, [data]);

    const columns: TableProps<InventarioReporteItem>["columns"] = [
        { title: "Producto", dataIndex: "producto" },
        { title: "Categoría", dataIndex: "categoria" },
        { title: "Proveedor", dataIndex: "proveedor" },
        { title: "Stock", dataIndex: "stock" },
        {
            title: "Precio",
            dataIndex: "precio",
            render: (value: number) => formatCurrency(value),
        },
    ];

    return (
        <ReportTableCard
            columns={columns}
            data={data}
            emptyDescription="No hay registros de inventario para mostrar."
            error={error}
            exportColumns={["Producto", "Categoría", "Proveedor", "Stock", "Precio"]}
            exportRows={data.map((item) => [
                item.producto,
                item.categoria,
                item.proveedor,
                item.stock,
                formatCurrency(item.precio),
            ])}
            fileName="inventario"
            loading={loading}
            rowKey="producto"
            summary={summary}
        />
    );
}
