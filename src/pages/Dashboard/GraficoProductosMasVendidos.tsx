import { useCallback } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { Empty, Spin } from "antd";
import { getProductosMasVendidosReporte } from "../../api/reportsApi";
import { useReportLoader } from "../../hooks/useReportLoader";
import type { ProductoMasVendidoReporteItem } from "../../interfaces/reportes";
import { chartPalette, nivoTheme } from "../../utils/chartTheme";

interface ProductoBarData {
  producto: string;
  ventas: number;
  [key: string]: string | number;
}

export default function GraficoProductosMasVendidos() {
  const fetchProductos = useCallback(async () => {
    const res = await getProductosMasVendidosReporte();
    return res.data;
  }, []);

  const { data: productos, loading } = useReportLoader<ProductoMasVendidoReporteItem>(fetchProductos);

  const data: ProductoBarData[] = productos.map((item) => ({
    producto: item.producto,
    ventas: item.cantidadVendida,
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
      <ResponsiveBar
        data={data}
        keys={["ventas"]}
        indexBy="producto"
        margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
        theme={nivoTheme}
        padding={0.3}
        colors={({ index }) => (
          [
            chartPalette.primary,
            chartPalette.accent,
            chartPalette.teal,
            chartPalette.violet,
            chartPalette.primarySoft,
            chartPalette.accentSoft,
          ][index % 6]
        )}
        borderRadius={8}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.2]],
        }}
        labelTextColor="#eff6ff"
        axisBottom={{
          legend: "Producto",
          legendOffset: 32,
          tickSize: 0,
          tickPadding: 10,
        }}
        axisLeft={{
          legend: "Ventas",
          legendOffset: -40,
          tickSize: 0,
          tickPadding: 10,
        }}
      />
    </div>
  );
}
