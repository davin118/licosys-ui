import { useCallback, useMemo, useState } from "react";
import { Button, DatePicker, Space } from "antd";
import type { TableProps } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { getVentasPorFechaReporte } from "../../api/reportsApi";
import ReportTableCard from "../../components/reportes/ReportTableCard";
import ReportSummary from "../../components/reportes/ReportSummary";
import { useReportLoader } from "../../hooks/useReportLoader";
import type { VentaPorFechaReporteItem } from "../../interfaces/reportes";
import { formatDate } from "../../utils/dateUtils";
import { formatCurrency } from "../../utils/formatUtils";

const { RangePicker } = DatePicker;

type DateRangeValue = [Dayjs, Dayjs] | null;

export default function VentasPorFechaReporte() {
    const [fechas, setFechas] = useState<DateRangeValue>([dayjs().startOf("month"), dayjs().endOf("month")]);

    const fetchVentasPorFecha = useCallback(async () => {
        if (!fechas) return [];

        const [inicio, fin] = fechas;
        const res = await getVentasPorFechaReporte(
            inicio.format("YYYY-MM-DD"),
            fin.format("YYYY-MM-DD")
        );
        return res.data;
    }, [fechas]);

    const { data, error, loading, reload } = useReportLoader<VentaPorFechaReporteItem>(
        fetchVentasPorFecha
    );

    const summary = useMemo(() => {
        const totalVendido = data.reduce((acc, item) => acc + item.total, 0);
        const productos = data.reduce((acc, item) => acc + item.cantidadProductos, 0);

        return (
            <ReportSummary
                items={[
                    { label: "Ventas encontradas", value: data.length },
                    { label: "Productos movidos", value: productos },
                    { label: "Total vendido", value: formatCurrency(totalVendido) },
                ]}
            />
        );
    }, [data]);

    const columns: TableProps<VentaPorFechaReporteItem>["columns"] = [
        {
            title: "Fecha",
            dataIndex: "fecha",
            render: (value: string) => formatDate(value),
        },
        { title: "Usuario", dataIndex: "usuario" },
        { title: "Productos", dataIndex: "cantidadProductos" },
        { title: "Método", dataIndex: "metodoPago" },
        {
            title: "Total",
            dataIndex: "total",
            render: (value: number) => formatCurrency(value),
        },
    ];

    const toolbar = useMemo(
        () => (
            <Space className="filters-wrap" wrap>
                <RangePicker
                    value={fechas}
                    onChange={(value) => {
                        if (!value || !value[0] || !value[1]) {
                            setFechas(null);
                            return;
                        }

                        setFechas([value[0], value[1]]);
                    }}
                    format="DD/MM/YYYY"
                />
                <Button type="primary" onClick={reload}>
                    Buscar
                </Button>
            </Space>
        ),
        [fechas, reload]
    );

    return (
        <ReportTableCard
            columns={columns}
            data={data}
            emptyDescription="No hay ventas en el rango seleccionado."
            error={error}
            exportColumns={["Fecha", "Usuario", "Productos", "Método", "Total"]}
            exportRows={data.map((item) => [
                formatDate(item.fecha),
                item.usuario,
                item.cantidadProductos,
                item.metodoPago,
                formatCurrency(item.total),
            ])}
            fileName="ventas_por_fecha"
            loading={loading}
            rowKey="ventaId"
            summary={summary}
            toolbar={toolbar}
        />
    );
}
