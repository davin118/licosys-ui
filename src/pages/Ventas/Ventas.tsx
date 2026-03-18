import { useEffect, useRef, useState } from "react";
import {
    Table,
    Button,
    DatePicker,
    Select,
    Space,
    Tag,
    message,
    Card,
    Row,
    Col,
    Typography,
    Grid,
    Input,
    Modal,
} from "antd";
import {
    DownloadOutlined,
    FilterOutlined,
    DollarOutlined,
    UserOutlined,
    CalendarOutlined,
    SearchOutlined,
    FileTextOutlined,
    PrinterOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import api from "../../api/api";
import dayjs from "dayjs";
import { formatDate, formatDateTime, parseDate } from "../../utils/dateUtils";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { formatCurrency } from "../../utils/formatUtils";

const { Title, Text } = Typography;

interface Venta {
    id: number;
    numeroDocumento: string;
    serie: string;
    tipoComprobante: string;
    fecha: string;
    usuario: string;
    total: number;
    metodoPago: string;
    estado: string;
}

interface VentaDetalle {
    producto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

interface VentaDetalleResponse extends Venta {
    subtotal: number;
    impuesto: number;
    cliente?: string | null;
    montoPagado?: number;
    vuelto?: number;
    detalles: VentaDetalle[];
}

export default function Ventas() {
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [usuarios, setUsuarios] = useState<string[]>([]);
    const [filtroUsuario, setFiltroUsuario] = useState<string | null>(null);
    const [filtroFecha, setFiltroFecha] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
    const [busquedaDocumento, setBusquedaDocumento] = useState("");
    const [loading, setLoading] = useState(false);
    const [printingVenta, setPrintingVenta] = useState<VentaDetalleResponse | null>(null);
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [printLoading, setPrintLoading] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: printingVenta ? printingVenta.numeroDocumento : "Comprobante_LicoSys",
        onAfterPrint: () => message.success("Comprobante enviado a impresión"),
        pageStyle: `
            @page { size: 80mm auto; margin: 0; }
            @media print {
                html, body {
                    width: 80mm;
                    margin: 0;
                    padding: 0;
                    font-family: monospace;
                    font-size: 11px;
                    background: #fff;
                }

                body * {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        `,
    });

    // 🔹 Cargar ventas desde API
    const cargarVentas = async () => {
        try {
            setLoading(true);
            const res = await api.get<Venta[]>("/Ventas"); // 👈 Tipo explícito
            setVentas(res.data);

            // ✅ Crear lista única de usuarios sin error de tipo
            const listaUsuarios: string[] = [...new Set(res.data.map((v) => v.usuario))];
            setUsuarios(listaUsuarios);
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.mensaje ?? error.response?.data?.error
                : null;
            message.error(errorMessage ?? "Error al cargar las ventas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarVentas();
    }, []);

    // 🔹 Filtrar ventas
    const ventasFiltradas = ventas.filter((v) => {
        const fechaVenta = parseDate(v.fecha);
        const coincideUsuario = !filtroUsuario || v.usuario === filtroUsuario;
        const coincideFecha =
            !filtroFecha ||
            (!!fechaVenta &&
                !fechaVenta.isBefore(filtroFecha[0], "day") &&
                !fechaVenta.isAfter(filtroFecha[1], "day"));
        const coincideDocumento =
            !busquedaDocumento ||
            v.numeroDocumento.toLowerCase().includes(busquedaDocumento.toLowerCase()) ||
            v.id.toString().includes(busquedaDocumento);

        return coincideUsuario && coincideFecha && coincideDocumento;
    });

    // 🔹 Totales
    const totalVentas = ventasFiltradas.reduce((acc, v) => acc + v.total, 0);

    // 🔹 Exportar a Excel
    const exportarExcel = () => {
        if (!ventasFiltradas.length) {
            message.warning("No hay ventas para exportar");
            return;
        }

        const hoja = XLSX.utils.json_to_sheet(
            ventasFiltradas.map((v) => ({
                Fecha: formatDateTime(v.fecha),
                Documento: v.numeroDocumento,
                Usuario: v.usuario,
                "Método de Pago": v.metodoPago,
                "Tipo de Comprobante": v.tipoComprobante,
                Estado: v.estado,
                Total: v.total,
            }))
        );

        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Ventas");

        const fechaActual = dayjs().format("YYYY-MM-DD_HHmm");
        XLSX.writeFile(libro, `Historial_Ventas_${fechaActual}.xlsx`);
        message.success("Archivo Excel exportado correctamente ✅");
    };

    // 🔹 Limpiar filtros
    const limpiarFiltros = () => {
        setFiltroUsuario(null);
        setFiltroFecha(null);
        setBusquedaDocumento("");
        message.info("Filtros restablecidos 🧹");
    };

    const abrirReimpresion = async (ventaId: number) => {
        try {
            setPrintLoading(true);
            const res = await api.get<VentaDetalleResponse>(`/Ventas/${ventaId}`);
            setPrintingVenta(res.data);
            setPrintModalOpen(true);
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.mensaje ?? error.response?.data?.error
                : null;
            message.error(errorMessage ?? "No se pudo cargar el comprobante.");
        } finally {
            setPrintLoading(false);
        }
    };

    return (
        <div className="page-shell p-3 md:p-6">
            <div className="page-hero">
                <p className="hero-kicker">Operacion Comercial</p>
                <Title level={3} style={{ color: "#fff9f5", marginBottom: 0 }}>
                    Historial de Ventas
                </Title>
                <p className="page-subtle" style={{ marginTop: 8 }}>
                    Revisa movimiento por usuario, fecha y metodo de pago con una lectura mas limpia.
                </p>
            </div>

            {/* 🧾 Resumen rápido */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card
                        bordered={false}
                        className="metric-card"
                    >
                        <Text type="secondary">Ventas registradas</Text>
                        <Title level={3} style={{ margin: 0, color: "#1677ff" }}>
                            {ventasFiltradas.length}
                        </Title>
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card
                        bordered={false}
                        className="metric-card"
                    >
                        <Text type="secondary">Total vendido</Text>
                        <Title level={3} style={{ margin: 0, color: "#52c41a" }}>
                            C$ {totalVentas.toFixed(2)}
                        </Title>
                    </Card>
                </Col>
            </Row>

            {/* 🔍 Filtros */}
            <Space className="filters-wrap mb-4 flex-wrap toolbar-soft" style={{ width: "100%" }}>
                <Input
                    allowClear
                    value={busquedaDocumento}
                    onChange={(e) => setBusquedaDocumento(e.target.value)}
                    prefix={<SearchOutlined />}
                    placeholder="Buscar por ticket o factura"
                    style={{ width: isMobile ? "100%" : 260 }}
                />

                <Select
                    placeholder="Filtrar por usuario"
                    allowClear
                    prefix={<UserOutlined />}
                    style={{ width: isMobile ? "100%" : 220 }}
                    value={filtroUsuario || undefined}
                    onChange={(v) => setFiltroUsuario(v || null)}
                >
                    {usuarios.map((u) => (
                        <Select.Option key={u} value={u}>
                            {u}
                        </Select.Option>
                    ))}
                </Select>

                <DatePicker.RangePicker
                    allowClear
                    onChange={(v) => setFiltroFecha(v ? [v[0]!, v[1]!] : null)}
                    placeholder={["Desde", "Hasta"]}
                    suffixIcon={<CalendarOutlined />}
                    style={{ width: isMobile ? "100%" : undefined }}
                />

                <Button icon={<FilterOutlined />} onClick={limpiarFiltros} style={{ width: isMobile ? "100%" : undefined }}>
                    Limpiar filtros
                </Button>

                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={exportarExcel}
                    className="brand-button"
                    style={{ width: isMobile ? "100%" : undefined }}
                >
                    Exportar Excel
                </Button>
            </Space>

            {/* 📊 Tabla */}
            <div className="table-scroll">
                <Table
                    loading={loading}
                    dataSource={ventasFiltradas}
                    rowKey="id"
                    bordered
                    size="middle"
                    pagination={{ pageSize: 8 }}
                    scroll={{ x: 760 }}
                    columns={[
                        {
                            title: "Documento",
                            dataIndex: "numeroDocumento",
                            render: (_, record) => (
                                <div>
                                    <strong style={{ color: "#163ea8" }}>
                                        <FileTextOutlined style={{ marginRight: 6 }} />
                                        {record.numeroDocumento}
                                    </strong>
                                    <div style={{ fontSize: 12, color: "#64748b" }}>
                                        {record.tipoComprobante}
                                    </div>
                                </div>
                            ),
                        },
                        {
                        title: "Fecha",
                        dataIndex: "fecha",
                        render: (f) => formatDate(f),
                    },
                        {
                            title: "Usuario",
                            dataIndex: "usuario",
                            render: (u) => (
                                <span>
                                    <UserOutlined style={{ color: "#1677ff", marginRight: 5 }} />
                                    {u}
                                </span>
                            ),
                        },
                        { title: "Método de Pago", dataIndex: "metodoPago" },
                        {
                            title: "Estado",
                            dataIndex: "estado",
                            render: (estado) => (
                                <Tag color={estado === "Completada" ? "green" : "orange"}>
                                    {estado}
                                </Tag>
                            ),
                        },
                        {
                            title: (
                                <span>
                                    Total <DollarOutlined style={{ color: "#1677ff" }} />
                                </span>
                            ),
                            dataIndex: "total",
                            align: "right",
                            render: (v) => (
                                <strong style={{ color: "#1677ff", minWidth: 110, display: "inline-block" }}>
                                    C$ {v.toFixed(2)}
                                </strong>
                            ),
                        },
                        {
                            title: "Acciones",
                            align: "center",
                            render: (_, record) => (
                                <Button
                                    icon={<PrinterOutlined />}
                                    onClick={() => abrirReimpresion(record.id)}
                                    loading={printLoading && printingVenta?.id === record.id}
                                >
                                    Reimprimir
                                </Button>
                            ),
                        },
                    ]}
                    className="panel-soft"
                />
            </div>

            <Modal
                open={printModalOpen}
                onCancel={() => setPrintModalOpen(false)}
                footer={[
                    <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => handlePrint()}>
                        Imprimir
                    </Button>,
                    <Button key="close" onClick={() => setPrintModalOpen(false)}>
                        Cerrar
                    </Button>,
                ]}
                width={420}
                title={printingVenta?.tipoComprobante ?? "Comprobante"}
            >
                <div ref={printRef}>
                    <div
                        style={{
                            width: "100%",
                            maxWidth: 300,
                            margin: "0 auto",
                            padding: "6px 4px 12px",
                            color: "#111827",
                            fontFamily: "monospace",
                        }}
                    >
                        <div style={{ textAlign: "center", marginBottom: 12 }}>
                            <img
                                src="/logo-licosys.svg"
                                alt="LicoSys"
                                style={{ width: 58, height: 58, objectFit: "contain", margin: "0 auto 6px" }}
                            />
                            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0.8 }}>LicoSys</div>
                            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2 }}>
                                Sistema de Licoreria
                            </div>
                            <div
                                style={{
                                    marginTop: 8,
                                    display: "inline-block",
                                    padding: "4px 8px",
                                    border: "1px solid #111827",
                                    borderRadius: 999,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: 0.8,
                                }}
                            >
                                {printingVenta?.tipoComprobante ?? "Comprobante"}
                            </div>
                            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700 }}>
                                {printingVenta?.numeroDocumento ?? ""}
                            </div>
                        </div>

                        <div
                            style={{
                                borderTop: "1px dashed #6b7280",
                                borderBottom: "1px dashed #6b7280",
                                padding: "8px 0",
                                fontSize: 11,
                                lineHeight: 1.6,
                            }}
                        >
                            <div><b>Fecha:</b> {printingVenta?.fecha}</div>
                            <div><b>Vendedor:</b> {printingVenta?.usuario}</div>
                            <div><b>Cliente:</b> {printingVenta?.cliente || "Consumidor final"}</div>
                            <div><b>Pago:</b> {printingVenta?.metodoPago}</div>
                        </div>

                        <div style={{ marginTop: 10 }}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr auto",
                                    gap: 8,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    borderBottom: "1px dashed #9ca3af",
                                    paddingBottom: 6,
                                    marginBottom: 8,
                                }}
                            >
                                <span>Detalle</span>
                                <span>Importe</span>
                            </div>

                            {printingVenta?.detalles.map((detalle, index) => (
                                <div
                                    key={`${detalle.producto}-${index}`}
                                    style={{
                                        marginBottom: 8,
                                        paddingBottom: 8,
                                        borderBottom: "1px dotted #d1d5db",
                                    }}
                                >
                                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{detalle.producto}</div>
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr auto",
                                            gap: 8,
                                            fontSize: 11,
                                        }}
                                    >
                                        <span>{detalle.cantidad} x {formatCurrency(detalle.precioUnitario)}</span>
                                        <span>{formatCurrency(detalle.subtotal)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div
                            style={{
                                marginTop: 10,
                                borderTop: "1px dashed #6b7280",
                                paddingTop: 10,
                                fontSize: 11,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span>Subtotal</span>
                                <span>{formatCurrency(printingVenta?.subtotal ?? 0)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span>IVA</span>
                                <span>{formatCurrency(printingVenta?.impuesto ?? 0)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span>Total</span>
                                <strong style={{ fontSize: 15 }}>{formatCurrency(printingVenta?.total ?? 0)}</strong>
                            </div>
                            {printingVenta?.metodoPago === "Efectivo" && (
                                <>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span>Recibido</span>
                                        <span>{formatCurrency(printingVenta?.montoPagado ?? 0)}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Vuelto</span>
                                        <span>{formatCurrency(printingVenta?.vuelto ?? 0)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
