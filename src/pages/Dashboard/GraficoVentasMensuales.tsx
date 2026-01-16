import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../api/api";
import { message } from "antd";

interface VentaMes {
  mes: string;
  total: number;
}

export default function GraficoVentasMensuales() {
  const [data, setData] = useState<VentaMes[]>([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get("/Ventas/resumen");
        const ventasMes = res.data?.ResumenMensual || [];
        setData(ventasMes);
      } catch {
        message.error("Error al cargar las ventas mensuales");
      }
    };
    cargar();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" name="Ventas (C$)" fill="#facc15" />
      </BarChart>
    </ResponsiveContainer>
  );
}
