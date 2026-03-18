import { useCallback, useMemo } from "react";
import type { TableProps } from "antd";
import { getProductosMasVendidosReporte } from "../../api/reportsApi";
import ReportTableCard from "../../components/reportes/ReportTableCard";
import ReportSummary from "../../components/reportes/ReportSummary";
import { useReportLoader } from "../../hooks/useReportLoader";
import type { ProductoMasVendidoReporteItem } from "../../interfaces/reportes";

export default function ProductosMasVendidosReporte() {
    const fetchProductos = useCallback(async () => {
        const res = await getProductosMasVendidosReporte();
        return res.data;
    }, []);

    const { data, error, loading } = useReportLoader<ProductoMasVendidoReporteItem>(fetchProductos);

    const summary = useMemo(() => {
        const unidadesVendidas = data.reduce((acc, item) => acc + item.cantidadVendida, 0);

        return (
            <ReportSummary
                items={[
                    { label: "Productos en ranking", value: data.length },
                    { label: "Unidades vendidas", value: unidadesVendidas },
                    { label: "Producto líder", value: data[0]?.producto ?? "Sin ventas" },
                ]}
            />
        );
    }, [data]);

    const columns: TableProps<ProductoMasVendidoReporteItem>["columns"] = [
        { title: "Producto", dataIndex: "producto" },
        { title: "Cantidad Vendida", dataIndex: "cantidadVendida" },
    ];

    return (
        <ReportTableCard
            columns={columns}
            data={data}
            emptyDescription="No hay ventas suficientes para generar este reporte."
            error={error}
            exportColumns={["Producto", "Cantidad Vendida"]}
            exportRows={data.map((item) => [item.producto, item.cantidadVendida])}
            fileName="productos_mas_vendidos"
            loading={loading}
            rowKey="producto"
            summary={summary}
        />
    );
}
