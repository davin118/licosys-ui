import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../api/api";
import { message } from "antd";

interface MetodoVenta {
  metodo: string;
  total: number;
}

const COLORS = ["#22c55e", "#3b82f6", "#eab308", "#ef4444", "#a855f7"];

export default function GraficoVentasPorMetodo() {
  const [data, setData] = useState<MetodoVenta[]>([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get("/Ventas/resumen");
        setData(res.data?.VentasPorMetodo || []);
      } catch {
        message.error("Error al cargar ventas por método de pago");
      }
    };
    cargar();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data as any}
          dataKey="total"
          nameKey="metodo"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
