import { useCallback, useMemo } from "react";
import { Alert, Card, Empty, Space, Table, Tag } from "antd";
import type { TableProps } from "antd";
import ExportButtons from "../../components/ExportButtons";
import ReportSummary from "../../components/reportes/ReportSummary";
import { getVentasMaestroDetalleReporte } from "../../api/reportsApi";
import { useReportLoader } from "../../hooks/useReportLoader";
import type {
    VentaMaestroDetalleReporteDetalleItem,
    VentaMaestroDetalleReporteItem,
} from "../../interfaces/reportes";
import { formatDateTime } from "../../utils/dateUtils";
import { formatCurrency } from "../../utils/formatUtils";

export default function VentasMaestroDetalleReporte() {
    const fetchVentasMaestroDetalle = useCallback(async () => {
        const res = await getVentasMaestroDetalleReporte();
        return res.data;
    }, []);

    const { data, error, loading } = useReportLoader<VentaMaestroDetalleReporteItem>(fetchVentasMaestroDetalle);

    const summary = useMemo(() => {
        const totalVentas = data.reduce((acc, item) => acc + item.total, 0);
        const lineas = data.reduce((acc, item) => acc + item.detalles.length, 0);

        return (
            <ReportSummary
                items={[
                    { label: "Ventas", value: data.length },
                    { label: "Líneas vendidas", value: lineas },
                    { label: "Total facturado", value: formatCurrency(totalVentas) },
                ]}
            />
        );
    }, [data]);

    const columns: TableProps<VentaMaestroDetalleReporteItem>["columns"] = [
        { title: "Documento", dataIndex: "numeroDocumento" },
        {
            title: "Fecha",
            dataIndex: "fecha",
            render: (value: string) => formatDateTime(value),
        },
        { title: "Usuario", dataIndex: "usuario" },
        { title: "Cliente", dataIndex: "cliente" },
        { title: "Método", dataIndex: "metodoPago" },
        {
            title: "Comprobante",
            dataIndex: "tipoComprobante",
            render: (value: string) => (
                <Tag color={value === "Factura" ? "blue" : "green"}>
                    {value}
                </Tag>
            ),
        },
        {
            title: "Total",
            dataIndex: "total",
            align: "right",
            render: (value: number) => formatCurrency(value),
        },
    ];

    const detailColumns: TableProps<VentaMaestroDetalleReporteDetalleItem>["columns"] = [
        { title: "Producto", dataIndex: "producto" },
        { title: "Cantidad", dataIndex: "cantidad" },
        {
            title: "Precio Unitario",
            dataIndex: "precioUnitario",
            render: (value: number) => formatCurrency(value),
        },
        {
            title: "Subtotal",
            dataIndex: "subtotal",
            render: (value: number) => formatCurrency(value),
        },
    ];

    const exportRows = data.flatMap((venta) =>
        venta.detalles.map((detalle) => [
            venta.numeroDocumento,
            formatDateTime(venta.fecha),
            venta.usuario,
            venta.cliente,
            venta.metodoPago,
            venta.tipoComprobante,
            detalle.producto,
            detalle.cantidad,
            formatCurrency(detalle.precioUnitario),
            formatCurrency(detalle.subtotal),
            formatCurrency(venta.total),
        ])
    );

    return (
        <Card className="panel-soft" bordered={false}>
            <Space direction="vertical" size="middle" style={{ display: "flex", width: "100%" }}>
                {summary}

                <ExportButtons
                    data={data}
                    fileName="ventas_maestro_detalle"
                    columns={[
                        "Documento",
                        "Fecha",
                        "Usuario",
                        "Cliente",
                        "Método",
                        "Comprobante",
                        "Producto",
                        "Cantidad",
                        "Precio Unitario",
                        "Subtotal",
                        "Total Venta",
                    ]}
                    rows={exportRows}
                />

                {error ? <Alert type="error" message={error} showIcon /> : null}

                <div className="table-scroll">
                    <Table<VentaMaestroDetalleReporteItem>
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                        rowKey="ventaId"
                        scroll={{ x: 980 }}
                        expandable={{
                            expandedRowRender: (record) => (
                                <Table<VentaMaestroDetalleReporteDetalleItem>
                                    columns={detailColumns}
                                    dataSource={record.detalles}
                                    pagination={false}
                                    rowKey={(item) => `${record.ventaId}-${item.producto}-${item.cantidad}`}
                                    size="small"
                                />
                            ),
                        }}
                        locale={{
                            emptyText: loading
                                ? "Cargando..."
                                : <Empty description="No hay ventas registradas para el reporte maestro-detalle." />,
                        }}
                    />
                </div>
            </Space>
        </Card>
    );
}
