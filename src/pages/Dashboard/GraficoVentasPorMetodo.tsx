import { useCallback } from "react";
import { ResponsivePie } from "@nivo/pie";
import { Empty, Spin } from "antd";
import { getVentasPorMetodoReporte } from "../../api/reportsApi";
import { useReportLoader } from "../../hooks/useReportLoader";
import type { VentaPorMetodoReporteItem } from "../../interfaces/reportes";
import { categoricalBluePalette, nivoTheme } from "../../utils/chartTheme";

interface MetodoPieData {
  id: string;
  label: string;
  value: number;
}

export default function GraficoVentasPorMetodo() {
  const fetchVentasPorMetodo = useCallback(async () => {
    const res = await getVentasPorMetodoReporte();
    return res.data;
  }, []);

  const { data: metodos, loading } = useReportLoader<VentaPorMetodoReporteItem>(fetchVentasPorMetodo);

  const data: MetodoPieData[] = metodos.map((item) => ({
    id: item.metodoPago,
    label: item.metodoPago,
    value: item.totalVentas,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 300 }}>
        <Spin />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: 300 }}>
        <Empty description="Sin datos para graficar" />
      </div>
    );
  }

  return (
    <div style={{ height: 300 }}>
      <ResponsivePie
        data={data}
        theme={nivoTheme}
        innerRadius={0.6}
        padAngle={1}
        cornerRadius={6}
        activeOuterRadiusOffset={10}
        colors={categoricalBluePalette}
        borderWidth={2}
        borderColor="#f8fbff"
        arcLinkLabelsColor="#64748b"
        arcLinkLabelsThickness={1.5}
        arcLabelsTextColor="#eff6ff"
      />
    </div>
  );
}
