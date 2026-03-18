import { useCallback, useMemo } from "react";
import type { TableProps } from "antd";
import ReportTableCard from "../../components/reportes/ReportTableCard";
import ReportSummary from "../../components/reportes/ReportSummary";
import { getBajoStockReporte } from "../../api/reportsApi";
import { useReportLoader } from "../../hooks/useReportLoader";
import type { BajoStockReporteItem } from "../../interfaces/reportes";

export default function BajoStockReporte() {
    const fetchBajoStock = useCallback(async () => {
        const res = await getBajoStockReporte();
        return res.data;
    }, []);

    const { data, error, loading } = useReportLoader<BajoStockReporteItem>(fetchBajoStock);

    const summary = useMemo(() => {
        const deficitTotal = data.reduce((acc, item) => acc + Math.max(item.stockMinimo - item.stock, 0), 0);

        return (
            <ReportSummary
                items={[
                    { label: "Productos críticos", value: data.length },
                    { label: "Unidades por reponer", value: deficitTotal },
                    {
                        label: "Caso más urgente",
                        value: data[0] ? `${data[0].producto} (${data[0].stock}/${data[0].stockMinimo})` : "Sin alertas",
                    },
                ]}
            />
        );
    }, [data]);

    const columns: TableProps<BajoStockReporteItem>["columns"] = [
        { title: "Producto", dataIndex: "producto" },
        { title: "Categoría", dataIndex: "categoria" },
        { title: "Proveedor", dataIndex: "proveedor" },
        { title: "Stock Actual", dataIndex: "stock" },
        { title: "Stock Mínimo", dataIndex: "stockMinimo" },
    ];

    return (
        <ReportTableCard
            columns={columns}
            data={data}
            emptyDescription="No hay productos en nivel de stock crítico."
            error={error}
            exportColumns={["Producto", "Categoría", "Proveedor", "Stock Actual", "Stock Mínimo"]}
            exportRows={data.map((item) => [
                item.producto,
                item.categoria,
                item.proveedor,
                item.stock,
                item.stockMinimo,
            ])}
            fileName="bajo-stock"
            loading={loading}
            rowKey="producto"
            summary={summary}
        />
    );
}
