import { useCallback } from "react";
import { ResponsiveLine } from "@nivo/line";
import dayjs from "dayjs";
import { Empty, Spin } from "antd";
import { getVentasPorFechaReporte } from "../../api/reportsApi";
import { useReportLoader } from "../../hooks/useReportLoader";
import type { VentaPorFechaReporteItem } from "../../interfaces/reportes";
import { parseDate } from "../../utils/dateUtils";
import { chartPalette, nivoTheme } from "../../utils/chartTheme";

interface SerieVentaMensual {
  id: string;
  data: Array<{ x: string; y: number }>;
}

export default function GraficoVentasMensuales() {
  const fetchVentas = useCallback(async () => {
    const inicio = dayjs().startOf("year").format("YYYY-MM-DD");
    const fin = dayjs().endOf("year").format("YYYY-MM-DD");
    const res = await getVentasPorFechaReporte(inicio, fin);
    return res.data;
  }, []);

  const { data: ventas, loading } = useReportLoader<VentaPorFechaReporteItem>(fetchVentas);

  const agrupado = ventas.reduce<Record<string, number>>((acc, venta) => {
    const fecha = parseDate(venta.fecha);
    if (!fecha) {
      return acc;
    }

    const mes = fecha.format("MMM");
    acc[mes] = (acc[mes] ?? 0) + venta.total;
    return acc;
  }, {});

  const data: SerieVentaMensual[] = [
    {
      id: "Ventas",
      data: Object.entries(agrupado).map(([mes, total]) => ({
        x: mes,
        y: total,
      })),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 320 }}>
        <Spin />
      </div>
    );
  }

  if (data[0].data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: 320 }}>
        <Empty description="Sin datos para graficar" />
      </div>
    );
  }

  return (
    <div style={{ height: 320 }}>
      <ResponsiveLine
        data={data}
        margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
        theme={nivoTheme}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", stacked: false }}
        colors={[chartPalette.primary]}
        pointSize={8}
        pointColor="#ffffff"
        pointBorderWidth={3}
        pointBorderColor={chartPalette.primary}
        lineWidth={4}
        enableArea
        areaOpacity={0.12}
        enableGridX={false}
        curve="monotoneX"
        axisBottom={{
          tickSize: 0,
          tickPadding: 12,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 10,
          format: (value) => `C$ ${value}`,
        }}
        useMesh
      />
    </div>
  );
}
