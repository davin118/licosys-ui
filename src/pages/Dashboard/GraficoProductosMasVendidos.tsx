import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../api/api";
import { message } from "antd";

interface ProductoVenta {
    producto: string;
    cantidad: number;
}

const COLORS = ["#ffb703", "#fb8500", "#219ebc", "#8ecae6", "#023047"];

export default function GraficoProductosMasVendidos() {
    const [data, setData] = useState<ProductoVenta[]>([]);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await api.get("/Ventas/resumen");
                setData(res.data?.ProductosMasVendidos || []);
            } catch {
                message.error("Error al cargar productos más vendidos");
            }
        };
        cargar();
    }, []);

    // 🔹 Adaptamos los datos para Recharts
    const chartData = data.map((d) => ({
        name: d.producto,
        value: d.cantidad
    }));

    return (
        <ResponsiveContainer width="100%" height={260}>
            <PieChart>
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                >
                    {chartData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}

