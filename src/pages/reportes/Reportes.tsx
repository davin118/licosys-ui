import { Card, Col, Row, Tabs, Tag, Typography } from "antd";
import InventarioReporte from "./InventarioReporte";
import BajoStockReporte from "./BajoStockReporte";
import ProductosPorVencerReporte from "./ProductosPorVencerReporte";
import VentasPorFechaReporte from "./VentasPorFechaReporte";
import ProductosMasVendidosReporte from "./ProductosMasVendidosReporte";
import VentasPorMetodoReporte from "./VentasPorMetodoReporte";
import VentasMaestroDetalleReporte from "./VentasMaestroDetalleReporte";
import VentasPorUsuarioReporte from "./VentasPorUsuarioReporte";

import { getUserFromToken } from "../../utils/auth";

const { Title } = Typography;

const reportCards = [
    {
        title: "Inventario",
        description: "Consulta existencias, categoría, proveedor y valor de cada producto.",
        tag: "Control",
    },
    {
        title: "Bajo Stock",
        description: "Detecta productos críticos para reposición inmediata.",
        tag: "Reposición",
    },
    {
        title: "Productos por Vencer",
        description: "Identifica productos con vencimiento próximo para reducir pérdidas.",
        tag: "Riesgo",
    },
    {
        title: "Ventas por Fecha",
        description: "Analiza el comportamiento de ventas por rango de fechas.",
        tag: "Tiempo",
    },
    {
        title: "Productos Más Vendidos",
        description: "Muestra el ranking comercial de productos con mayor salida.",
        tag: "Demanda",
    },
    {
        title: "Ventas por Método",
        description: "Resume cuánto se cobra por efectivo, transferencia u otros medios.",
        tag: "Caja",
    },
    {
        title: "Ventas Detalladas",
        description: "Presenta cada venta con su encabezado y líneas de productos.",
        tag: "Detalle",
    },
    {
        title: "Ventas por Usuario",
        description: "Compara desempeño y volumen registrado por cada usuario.",
        tag: "Equipo",
    },
];

export default function Reportes() {
    const user = getUserFromToken();
    const permiso = user?.role === "Consulta" ? "Lectura limitada" : "Acceso completo";

    return (
        <div className="page-shell p-3 md:p-6 min-h-full">
            <div className="page-hero">
                <p className="hero-kicker">Analitica</p>
                <Title level={3} style={{ color: "#fff9f5", marginBottom: 0 }}>
                    Modulo de Reportes
                </Title>
                <p className="page-subtle" style={{ marginTop: 8 }}>
                    Consulta inventario, ventas y comportamiento comercial desde una sola seccion.
                </p>
                <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Tag color={permiso === "Acceso completo" ? "blue" : "gold"}>
                        {permiso} para <strong>{user?.role || "Usuario"}</strong>
                    </Tag>
                    {user?.role === "Vendedor" && (
                        <Tag color="green">Reportes comerciales disponibles</Tag>
                    )}
                    {user?.role === "Consulta" && (
                        <Tag color="orange">Sólo visualización y KPIs</Tag>
                    )}
                </div>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                {reportCards.map((item) => (
                    <Col key={item.title} xs={24} md={12} xl={6}>
                        <Card className="report-overview-card" bordered={false}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                                <strong style={{ color: "var(--text-main)" }}>{item.title}</strong>
                                <Tag color="blue">{item.tag}</Tag>
                            </div>
                            <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.6 }}>
                                {item.description}
                            </p>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Tabs
                defaultActiveKey="1"
                destroyOnHidden
                className="panel-soft"
                items={[
                    {
                        key: "1",
                        label: "Inventario",
                        children: <InventarioReporte />,
                    },
                    {
                        key: "2",
                        label: "Bajo Stock",
                        children: <BajoStockReporte />,
                    },
                    {
                        key: "3",
                        label: "Productos por Vencer",
                        children: <ProductosPorVencerReporte />,
                    },
                    {
                        key: "4",
                        label: "Ventas por Fecha",
                        children: <VentasPorFechaReporte />,
                    },
                    {
                        key: "5",
                        label: "Productos Más Vendidos",
                        children: <ProductosMasVendidosReporte />,
                    },
                    {
                        key: "6",
                        label: "Ventas por Método",
                        children: <VentasPorMetodoReporte />,
                    },
                    {
                        key: "7",
                        label: "Ventas Detalladas",
                        children: <VentasMaestroDetalleReporte />,
                    },
                    {
                        key: "8",
                        label: "Ventas por Usuario",
                        children: <VentasPorUsuarioReporte />,
                    },
                ]}
            />
        </div>
    );
}
