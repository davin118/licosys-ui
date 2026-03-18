import { useEffect, useMemo, useState } from "react";
import { Alert, Card, Col, List, Row, Spin, Tag, Typography } from "antd";
import {
  WarningOutlined,
  StopOutlined,
  ClockCircleOutlined,
  BugOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import api from "../../api/api";
import type { IProducto } from "../../interfaces/IProducto";
import { parseDate } from "../../utils/dateUtils";
import { formatCurrency } from "../../utils/formatUtils";
import { getUserFromToken } from "../../utils/auth";
import GraficoVentasMensuales from "./GraficoVentasMensuales";
import GraficoProductosMasVendidos from "./GraficoProductosMasVendidos";
import GraficoVentasPorMetodo from "./GraficoVentasPorMetodo";

const { Title, Paragraph } = Typography;

interface DashboardVenta {
  id: number;
  fecha: string;
  total: number;
  clienteId?: number | null;
}

type Role = "Administrador" | "Vendedor" | "Consulta" | string;

const reportLinks = [
  {
    key: "inventario",
    title: "Inventario",
    description: "Consulta existencias, categorías y proveedores.",
    to: "/reportes",
  },
  {
    key: "ventas-metodo",
    title: "Ventas por Método",
    description: "Analiza los métodos de pago y el monto acumulado.",
    to: "/reportes",
  },
  {
    key: "productos-top",
    title: "Productos Más Vendidos",
    description: "Identifica el comportamiento comercial de los productos top.",
    to: "/reportes",
  },
];

export default function Dashboard() {
  const user = getUserFromToken();
  const role = (user?.role ?? "") as Role;
  const canSeeOperationalDashboard = role === "Administrador" || role === "Vendedor";
  const canSeeCommercialCharts = role === "Administrador";

  const [loading, setLoading] = useState(canSeeOperationalDashboard);
  const [error, setError] = useState<string | null>(null);
  const [productos, setProductos] = useState<IProducto[]>([]);
  const [ventas, setVentas] = useState<DashboardVenta[]>([]);

  useEffect(() => {
    if (!canSeeOperationalDashboard) {
      setLoading(false);
      return;
    }

    let active = true;

    async function cargarDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [productosRes, ventasRes] = await Promise.all([
          api.get<IProducto[]>("/Productos"),
          api.get<DashboardVenta[]>("/Ventas"),
        ]);

        if (!active) return;

        setProductos(productosRes.data);
        setVentas(ventasRes.data);
      } catch (err) {
        console.error("Error al cargar dashboard", err);
        if (active) {
          setError("No se pudo cargar la información del dashboard.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    cargarDashboard();

    return () => {
      active = false;
    };
  }, [canSeeOperationalDashboard]);

  const hoy = dayjs();
  const inicioMes = hoy.startOf("month");
  const finMes = hoy.endOf("month");

  const bajoStock = useMemo(
    () => productos.filter((producto) => producto.stock > 0 && producto.stock <= 5),
    [productos]
  );
  const sinStock = useMemo(
    () => productos.filter((producto) => producto.stock <= 0),
    [productos]
  );
  const porVencer = useMemo(
    () =>
      productos.filter((producto) => {
        if (!producto.fechaVencimiento) return false;
        const dias = dayjs(producto.fechaVencimiento).diff(hoy, "day");
        return dias >= 0 && dias <= 30;
      }),
    [hoy, productos]
  );
  const vencidos = useMemo(
    () =>
      productos.filter(
        (producto) =>
          !!producto.fechaVencimiento &&
          dayjs(producto.fechaVencimiento).diff(hoy, "day") < 0
      ),
    [hoy, productos]
  );

  const ventasDelMes = useMemo(
    () =>
      ventas
        .filter((venta) => {
          const fecha = parseDate(venta.fecha);
          return !!fecha && !fecha.isBefore(inicioMes, "day") && !fecha.isAfter(finMes, "day");
        })
        .reduce((acc, venta) => acc + venta.total, 0),
    [finMes, inicioMes, ventas]
  );

  const ventasDeHoy = useMemo(
    () =>
      ventas
        .filter((venta) => {
          const fecha = parseDate(venta.fecha);
          return !!fecha && fecha.isSame(hoy, "day");
        })
        .reduce((acc, venta) => acc + venta.total, 0),
    [hoy, ventas]
  );

  const clientesConCompras = useMemo(() => {
    const ids = ventas
      .map((venta) => venta.clienteId)
      .filter((clienteId): clienteId is number => typeof clienteId === "number");
    return new Set(ids).size;
  }, [ventas]);

  const renderLista = (items: IProducto[], color: string, vacio: string) => (
    <List
      dataSource={items}
      locale={{ emptyText: vacio }}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            title={<b>{item.nombre}</b>}
            description={
              <>
                Stock: <b>{item.stock}</b>{" "}
                <Tag color={color}>
                  {item.fechaVencimiento
                    ? dayjs(item.fechaVencimiento).format("DD/MM/YYYY")
                    : "Sin vencimiento"}
                </Tag>
              </>
            }
          />
        </List.Item>
      )}
    />
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!canSeeOperationalDashboard) {
    return (
      <div className="page-shell p-4 md:p-6 min-h-full">
        <div className="page-hero">
          <p className="hero-kicker">Centro de Consulta</p>
          <Title level={2} style={{ margin: 0, color: "#fff9f5" }}>
            Reportes Disponibles
          </Title>
          <p className="page-subtle" style={{ marginTop: 8 }}>
            Tu perfil tiene acceso de consulta. Desde aquí puedes abrir los reportes habilitados.
          </p>
        </div>

        <Row gutter={[24, 24]}>
          {reportLinks.map((item) => (
            <Col key={item.key} xs={24} md={12} xl={8}>
              <Card className="panel-soft" bordered={false}>
                <div className="flex items-start gap-3">
                  <BarChartOutlined style={{ fontSize: 22, color: "#2563eb", marginTop: 4 }} />
                  <div>
                    <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
                      {item.title}
                    </Title>
                    <Paragraph style={{ marginBottom: 16 }}>
                      {item.description}
                    </Paragraph>
                    <Link to={item.to}>
                      <FileTextOutlined /> Abrir módulo de reportes
                    </Link>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  return (
    <div className="page-shell p-4 md:p-6 min-h-full">
      <div className="page-hero">
        <p className="hero-kicker">
          {role === "Administrador" ? "Resumen Ejecutivo" : "Panel Operativo"}
        </p>
        <Title level={2} style={{ margin: 0, color: "#fff9f5" }}>
          {role === "Administrador" ? "Vista General del Negocio" : "Seguimiento Diario de Ventas"}
        </Title>
        <p className="page-subtle" style={{ marginTop: 8 }}>
          {role === "Administrador"
            ? "Ventas, alertas e indicadores comerciales con una lectura más clara."
            : "Consulta tus ventas, movimiento reciente e inventario clave para la operación."}
        </p>
      </div>

      {error ? (
        <Alert
          type="error"
          message={error}
          showIcon
          style={{ marginBottom: 24 }}
        />
      ) : null}

      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card" bordered={false}>
            <p className="metric-label">Ventas del Mes</p>
            <h2 className="text-3xl font-bold text-blue-600">
              {formatCurrency(ventasDelMes)}
            </h2>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card" bordered={false}>
            <p className="metric-label">Productos</p>
            <h2 className="text-3xl font-bold text-purple-600">{productos.length}</h2>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card" bordered={false}>
            <p className="metric-label">Clientes con compras</p>
            <h2 className="text-3xl font-bold text-green-600">{clientesConCompras}</h2>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card" bordered={false}>
            <p className="metric-label">Ventas Hoy</p>
            <h2 className="text-3xl font-bold text-orange-500">
              {formatCurrency(ventasDeHoy)}
            </h2>
          </Card>
        </Col>
      </Row>

      <Title level={4} className="section-heading">
        {canSeeCommercialCharts ? "Estadísticas Generales" : "Actividad Comercial"}
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card
            title="Ventas Mensuales"
            className="panel-soft"
            bordered={false}
          >
            <GraficoVentasMensuales />
          </Card>
        </Col>

        {canSeeCommercialCharts && (
          <>
            <Col xs={24} md={12}>
              <Card
                title="Productos Más Vendidos"
                className="panel-soft"
                bordered={false}
              >
                <GraficoProductosMasVendidos />
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                title="Métodos de Pago"
                className="panel-soft"
                bordered={false}
              >
                <GraficoVentasPorMetodo />
              </Card>
            </Col>
          </>
        )}
      </Row>

      <Title level={4} className="section-heading mt-8 md:mt-12">
        <ShoppingOutlined /> Alertas de Inventario
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12} lg={6}>
          <Card
            title={<span className="text-yellow-600"><WarningOutlined /> Bajo Stock ({bajoStock.length})</span>}
            className="panel-soft"
            bordered={false}
          >
            {renderLista(bajoStock, "gold", "No hay productos con stock bajo.")}
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card
            title={<span className="text-red-500"><StopOutlined /> Sin Stock ({sinStock.length})</span>}
            className="panel-soft"
            bordered={false}
          >
            {renderLista(sinStock, "red", "No hay productos agotados.")}
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card
            title={<span className="text-blue-500"><ClockCircleOutlined /> Por Vencer ({porVencer.length})</span>}
            className="panel-soft"
            bordered={false}
          >
            {renderLista(porVencer, "blue", "No hay productos próximos a vencer.")}
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card
            title={<span className="text-rose-500"><BugOutlined /> Vencidos ({vencidos.length})</span>}
            className="panel-soft"
            bordered={false}
          >
            {renderLista(vencidos, "volcano", "No hay productos vencidos.")}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
