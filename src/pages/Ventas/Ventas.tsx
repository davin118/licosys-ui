import { useEffect, useState } from "react";
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
} from "antd";
import {
    DownloadOutlined,
    FilterOutlined,
    DollarOutlined,
    UserOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import api from "../../api/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface Venta {
    id: number;
    fecha: string;
    usuario: string;
    total: number;
    metodoPago: string;
    estado: string;
}

export default function Ventas() {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [usuarios, setUsuarios] = useState<string[]>([]);
    const [filtroUsuario, setFiltroUsuario] = useState<string | null>(null);
    const [filtroFecha, setFiltroFecha] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
    const [loading, setLoading] = useState(false);

    // 🔹 Cargar ventas desde API
    const cargarVentas = async () => {
        try {
            setLoading(true);
            const res = await api.get<Venta[]>("/Ventas"); // 👈 Tipo explícito
            console.log(res.data);
            setVentas(res.data);

            // ✅ Crear lista única de usuarios sin error de tipo
            const listaUsuarios: string[] = [...new Set(res.data.map((v) => v.usuario))];
            setUsuarios(listaUsuarios);
        } catch {
            message.error("Error al cargar las ventas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarVentas();
    }, []);

    // 🔹 Filtrar ventas
    const ventasFiltradas = ventas.filter((v) => {
        const coincideUsuario = !filtroUsuario || v.usuario === filtroUsuario;
        const coincideFecha =
            !filtroFecha ||
            (dayjs(v.fecha).isAfter(filtroFecha[0], "day") &&
                dayjs(v.fecha).isBefore(filtroFecha[1], "day"));
        return coincideUsuario && coincideFecha;
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
                Fecha: dayjs(v.fecha).format("DD/MM/YYYY HH:mm"),
                Usuario: v.usuario,
                "Método de Pago": v.metodoPago,
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
        message.info("Filtros restablecidos 🧹");
    };

    return (
        <div className="p-6">
            <Title level={3} style={{ color: "#1677ff", marginBottom: 20 }}>
                Historial de Ventas
            </Title>

            {/* 🧾 Resumen rápido */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card
                        bordered={false}
                        style={{
                            borderLeft: "5px solid #1677ff",
                            textAlign: "center",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                        }}
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
                        style={{
                            borderLeft: "5px solid #52c41a",
                            textAlign: "center",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                        }}
                    >
                        <Text type="secondary">Total vendido</Text>
                        <Title level={3} style={{ margin: 0, color: "#52c41a" }}>
                            C$ {totalVentas.toFixed(2)}
                        </Title>
                    </Card>
                </Col>
            </Row>

            {/* 🔍 Filtros */}
            <Space className="mb-4 flex-wrap">
                <Select
                    placeholder="Filtrar por usuario"
                    allowClear
                    prefix={<UserOutlined />}
                    style={{ width: 220 }}
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
                    onChange={(v) => setFiltroFecha(v as any)}
                    placeholder={["Desde", "Hasta"]}
                    suffixIcon={<CalendarOutlined />}
                />

                <Button icon={<FilterOutlined />} onClick={limpiarFiltros}>
                    Limpiar filtros
                </Button>

                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={exportarExcel}
                    className="!bg-blue-600 hover:!bg-blue-700"
                >
                    Exportar Excel
                </Button>
            </Space>

            {/* 📊 Tabla */}
            <Table
                loading={loading}
                dataSource={ventasFiltradas}
                rowKey="id"
                bordered
                size="middle"
                pagination={{ pageSize: 8 }}
                columns={[
                    {
                        title: "Fecha",
                        dataIndex: "fecha",
                        render: (f) => dayjs(f).format("DD/MM/YYYY"),
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
                            <strong style={{ color: "#1677ff" }}>
                                C$ {v.toFixed(2)}
                            </strong>
                        ),
                    },
                ]}
            />
        </div>
    );
}
