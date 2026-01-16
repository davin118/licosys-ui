import { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Spin, message, Tag, List } from "antd";
import {
    WarningOutlined,
    StopOutlined,
    ClockCircleOutlined,
    BugOutlined,
    ShoppingOutlined,
} from "@ant-design/icons";
import api from "../../api/api";
import dayjs from "dayjs";
import GraficoProductosMasVendidos from "./GraficoProductosMasVendidos";
import GraficoVentasPorMetodo from "./GraficoVentasPorMetodo";
import GraficoVentasMensuales from "./GraficoVentasMensuales";

const { Title } = Typography;

interface Producto {
    id: number;
    nombre: string;
    stock: number;
    fechaVencimiento: string;
}

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [bajoStock, setBajoStock] = useState<Producto[]>([]);
    const [sinStock, setSinStock] = useState<Producto[]>([]);
    const [porVencer, setPorVencer] = useState<Producto[]>([]);
    const [vencidos, setVencidos] = useState<Producto[]>([]);

    // 🔹 Cargar datos desde API
    const cargarDatos = async () => {
        try {
            setLoading(true);
            const res = await api.get("/Productos/estado-general");
            setBajoStock(res.data.bajoStock);
            setSinStock(res.data.sinStock);
            setPorVencer(res.data.porVencer);
            setVencidos(res.data.vencidos);
        } catch {
            message.error("Error al obtener los datos del dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // 🔹 Render genérico de listas
    const renderLista = (items: Producto[], color: string, vacio: string) => (
        <List
            dataSource={items}
            locale={{ emptyText: vacio }}
            renderItem={(item) => (
                <List.Item>
                    <List.Item.Meta
                        title={<b>{item.nombre}</b>}
                        description={
                            <span>
                                Stock: <b>{item.stock}</b>{" "}
                                {item.fechaVencimiento && (
                                    <Tag color={color}>
                                        {dayjs(item.fechaVencimiento).format("DD/MM/YYYY")}
                                    </Tag>
                                )}
                            </span>
                        }
                    />
                </List.Item>
            )}
        />
    );

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* 🔹 Resumen de Productos */}
            <Title level={3} className="text-blue-600 mb-6 flex items-center gap-2">
                <ShoppingOutlined /> Resumen de Productos
            </Title>

            <Row gutter={[24, 24]}>
                {/* Bajo Stock */}
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        title={
                            <span className="text-yellow-600 font-semibold flex items-center gap-2">
                                <WarningOutlined /> Bajo Stock ({bajoStock.length})
                            </span>
                        }
                        className="rounded-xl shadow-md border-t-4 border-yellow-500 hover:shadow-lg transition"
                        bodyStyle={{ maxHeight: 260, overflowY: "auto", padding: 12 }}
                    >
                        {renderLista(bajoStock, "gold", "No hay productos con bajo stock")}
                    </Card>
                </Col>

                {/* Sin Stock */}
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        title={
                            <span className="text-red-600 font-semibold flex items-center gap-2">
                                <StopOutlined /> Sin Stock ({sinStock.length})
                            </span>
                        }
                        className="rounded-xl shadow-md border-t-4 border-red-500 hover:shadow-lg transition"
                        bodyStyle={{ maxHeight: 260, overflowY: "auto", padding: 12 }}
                    >
                        {renderLista(sinStock, "red", "No hay productos sin stock")}
                    </Card>
                </Col>

                {/* Por vencer */}
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        title={
                            <span className="text-orange-600 font-semibold flex items-center gap-2">
                                <ClockCircleOutlined /> Por Vencer ({porVencer.length})
                            </span>
                        }
                        className="rounded-xl shadow-md border-t-4 border-orange-500 hover:shadow-lg transition"
                        bodyStyle={{ maxHeight: 260, overflowY: "auto", padding: 12 }}
                    >
                        {renderLista(
                            porVencer,
                            "orange",
                            "No hay productos próximos a vencer"
                        )}
                    </Card>
                </Col>

                {/* Vencidos */}
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        title={
                            <span className="text-gray-600 font-semibold flex items-center gap-2">
                                <BugOutlined /> Vencidos ({vencidos.length})
                            </span>
                        }
                        className="rounded-xl shadow-md border-t-4 border-gray-500 hover:shadow-lg transition"
                        bodyStyle={{ maxHeight: 260, overflowY: "auto", padding: 12 }}
                    >
                        {renderLista(vencidos, "gray", "No hay productos vencidos")}
                    </Card>
                </Col>
            </Row>

            {/* 🔹 Gráficos estadísticos */}
            <Title level={3} className="text-blue-600 mt-10 mb-4">
                📊 Estadísticas Generales
            </Title>

            <Row gutter={[24, 24]}>
                <Col xs={24} md={12} lg={8}>
                    <Card
                        title="Ventas Mensuales"
                        className="rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        <GraficoVentasMensuales />
                    </Card>
                </Col>

                <Col xs={24} md={12} lg={8}>
                    <Card
                        title="Productos Más Vendidos"
                        className="rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        <GraficoProductosMasVendidos />
                    </Card>
                </Col>

                <Col xs={24} md={12} lg={8}>
                    <Card
                        title="Métodos de Pago"
                        className="rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        <GraficoVentasPorMetodo />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
