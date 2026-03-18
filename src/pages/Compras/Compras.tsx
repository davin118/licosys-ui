import { useEffect, useMemo, useState } from "react";
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    Grid,
    InputNumber,
    message,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import {
    PlusOutlined,
    ShoppingOutlined,
    DeleteOutlined,
    DollarOutlined,
    InboxOutlined,
} from "@ant-design/icons";
import api from "../../api/api";
import type { IProducto } from "../../interfaces/IProducto";
import { formatCurrency } from "../../utils/formatUtils";
import { formatDateTime } from "../../utils/dateUtils";

const { Title, Text } = Typography;

interface ProveedorOption {
    id: number;
    nombre: string;
}

interface CompraDetalle {
    id?: number;
    productoId: number;
    producto?: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

interface CompraItem {
    id: number;
    fecha: string;
    metodoPago?: string;
    total: number;
    proveedorId: number;
    proveedor?: string;
    detalles: CompraDetalle[];
}

interface CompraFormValues {
    proveedorId: number;
    metodoPago: string;
}

interface DraftItem {
    productoId: number;
    producto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export default function Compras() {
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;
    const [compras, setCompras] = useState<CompraItem[]>([]);
    const [proveedores, setProveedores] = useState<ProveedorOption[]>([]);
    const [productos, setProductos] = useState<IProducto[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [items, setItems] = useState<DraftItem[]>([]);
    const [selectedProductoId, setSelectedProductoId] = useState<number | null>(null);
    const [cantidad, setCantidad] = useState<number>(1);
    const [precioUnitario, setPrecioUnitario] = useState<number>(0);
    const [form] = Form.useForm<CompraFormValues>();

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [comprasRes, proveedoresRes, productosRes] = await Promise.all([
                api.get<CompraItem[]>("/Compras"),
                api.get<ProveedorOption[]>("/Proveedores"),
                api.get<IProducto[]>("/Productos"),
            ]);

            setCompras(comprasRes.data);
            setProveedores(proveedoresRes.data);
            setProductos(productosRes.data);
        } catch {
            message.error("No se pudo cargar el módulo de compras");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const productoSeleccionado = useMemo(
        () => productos.find((producto) => producto.id === selectedProductoId) ?? null,
        [productos, selectedProductoId]
    );

    useEffect(() => {
        if (!productoSeleccionado) {
            setPrecioUnitario(0);
            return;
        }

        setPrecioUnitario(productoSeleccionado.costo);
    }, [productoSeleccionado]);

    const totalCompras = useMemo(
        () => compras.reduce((acc, compra) => acc + compra.total, 0),
        [compras]
    );

    const totalItems = useMemo(
        () => compras.reduce((acc, compra) => acc + compra.detalles.reduce((sum, item) => sum + item.cantidad, 0), 0),
        [compras]
    );

    const totalDraft = useMemo(
        () => items.reduce((acc, item) => acc + item.subtotal, 0),
        [items]
    );

    const agregarItem = () => {
        if (!productoSeleccionado) {
            message.warning("Selecciona un producto");
            return;
        }

        if (cantidad <= 0 || precioUnitario <= 0) {
            message.warning("Cantidad y costo deben ser mayores a cero");
            return;
        }

        setItems((prev) => {
            const current = prev.find((item) => item.productoId === productoSeleccionado.id);
            if (current) {
                return prev.map((item) =>
                    item.productoId === productoSeleccionado.id
                        ? {
                            ...item,
                            cantidad: item.cantidad + cantidad,
                            precioUnitario,
                            subtotal: (item.cantidad + cantidad) * precioUnitario,
                        }
                        : item
                );
            }

            return [
                ...prev,
                {
                    productoId: productoSeleccionado.id,
                    producto: productoSeleccionado.nombre,
                    cantidad,
                    precioUnitario,
                    subtotal: cantidad * precioUnitario,
                },
            ];
        });

        setSelectedProductoId(null);
        setCantidad(1);
        setPrecioUnitario(0);
    };

    const eliminarItem = (productoId: number) => {
        setItems((prev) => prev.filter((item) => item.productoId !== productoId));
    };

    const abrirModal = () => {
        form.setFieldsValue({ metodoPago: "Efectivo" });
        setItems([]);
        setSelectedProductoId(null);
        setCantidad(1);
        setPrecioUnitario(0);
        setOpen(true);
    };

    const crearCompra = async () => {
        try {
            const values = await form.validateFields();
            if (items.length === 0) {
                message.warning("Agrega al menos un producto a la compra");
                return;
            }

            setSaving(true);
            await api.post("/Compras", {
                proveedorId: values.proveedorId,
                metodoPago: values.metodoPago,
                total: totalDraft,
                detalles: items.map((item) => ({
                    productoId: item.productoId,
                    cantidad: item.cantidad,
                    precioUnitario: item.precioUnitario,
                })),
            });

            message.success("Compra registrada correctamente");
            setOpen(false);
            await cargarDatos();
        } catch {
            message.error("No se pudo registrar la compra");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-shell p-3 md:p-6 min-h-full">
            <div className="page-hero">
                <p className="hero-kicker">Abastecimiento</p>
                <Title level={3} style={{ color: "#fff9f5", marginBottom: 0 }}>
                    Gestión de Compras
                </Title>
                <p className="page-subtle" style={{ marginTop: 8 }}>
                    Registra ingresos de inventario y consulta el historial de compras a proveedores.
                </p>
            </div>

            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} md={8}>
                    <Card className="metric-card" bordered={false}>
                        <Text type="secondary">Compras registradas</Text>
                        <Title level={3} style={{ margin: 0 }}>{compras.length}</Title>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="metric-card" bordered={false}>
                        <Text type="secondary">Total comprado</Text>
                        <Title level={3} style={{ margin: 0, color: "#1677ff" }}>{formatCurrency(totalCompras)}</Title>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="metric-card" bordered={false}>
                        <Text type="secondary">Unidades ingresadas</Text>
                        <Title level={3} style={{ margin: 0, color: "#52c41a" }}>{totalItems}</Title>
                    </Card>
                </Col>
            </Row>

            <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
                <Title level={4} style={{ margin: 0 }}>Historial de Compras</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={abrirModal} className="brand-button">
                    Nueva compra
                </Button>
            </div>

            <div className="table-scroll">
                <Table
                    loading={loading}
                    dataSource={compras}
                    rowKey="id"
                    pagination={{ pageSize: 6 }}
                    scroll={{ x: 900 }}
                    className="panel-soft"
                    expandable={{
                        expandedRowRender: (record) => (
                            <Table
                                dataSource={record.detalles}
                                rowKey={(detalle) => `${record.id}-${detalle.productoId}-${detalle.id ?? "draft"}`}
                                pagination={false}
                                size="small"
                                columns={[
                                    { title: "Producto", dataIndex: "producto" },
                                    { title: "Cantidad", dataIndex: "cantidad", align: "right" },
                                    {
                                        title: "Costo unitario",
                                        dataIndex: "precioUnitario",
                                        align: "right",
                                        render: (value: number) => formatCurrency(value),
                                    },
                                    {
                                        title: "Subtotal",
                                        dataIndex: "subtotal",
                                        align: "right",
                                        render: (value: number) => formatCurrency(value),
                                    },
                                ]}
                            />
                        ),
                    }}
                    columns={[
                        {
                            title: "Fecha",
                            dataIndex: "fecha",
                            render: (value: string) => formatDateTime(value),
                        },
                        { title: "Proveedor", dataIndex: "proveedor" },
                        {
                            title: "Método",
                            dataIndex: "metodoPago",
                            render: (value?: string) => <Tag color="blue">{value || "N/D"}</Tag>,
                        },
                        {
                            title: "Productos",
                            render: (_, record) => record.detalles.length,
                            align: "right",
                        },
                        {
                            title: "Total",
                            dataIndex: "total",
                            align: "right",
                            render: (value: number) => <strong>{formatCurrency(value)}</strong>,
                        },
                    ]}
                />
            </div>

            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                onOk={crearCompra}
                okText="Registrar compra"
                cancelText="Cancelar"
                confirmLoading={saving}
                width={900}
                title="Registrar nueva compra"
            >
                <Form layout="vertical" form={form}>
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Proveedor"
                                name="proveedorId"
                                rules={[{ required: true, message: "Selecciona un proveedor" }]}
                            >
                                <Select
                                    placeholder="Selecciona un proveedor"
                                    options={proveedores.map((proveedor) => ({
                                        value: proveedor.id,
                                        label: proveedor.nombre,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Método de pago"
                                name="metodoPago"
                                rules={[{ required: true, message: "Selecciona un método de pago" }]}
                            >
                                <Select
                                    options={[
                                        { value: "Efectivo", label: "Efectivo" },
                                        { value: "Transferencia", label: "Transferencia" },
                                        { value: "Tarjeta", label: "Tarjeta" },
                                        { value: "Crédito", label: "Crédito" },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                <Divider>Agregar productos</Divider>

                <Space direction={isMobile ? "vertical" : "horizontal"} style={{ width: "100%", marginBottom: 16 }}>
                    <Select
                        showSearch
                        placeholder="Producto"
                        value={selectedProductoId ?? undefined}
                        onChange={(value) => setSelectedProductoId(value)}
                        style={{ width: isMobile ? "100%" : 320 }}
                        options={productos.map((producto) => ({
                            value: producto.id,
                            label: `${producto.nombre} · Stock actual ${producto.stock}`,
                        }))}
                    />

                    <InputNumber
                        min={1}
                        value={cantidad}
                        onChange={(value) => setCantidad(Number(value ?? 1))}
                        placeholder="Cantidad"
                        style={{ width: isMobile ? "100%" : 120 }}
                    />

                    <InputNumber
                        min={0.01}
                        value={precioUnitario}
                        onChange={(value) => setPrecioUnitario(Number(value ?? 0))}
                        placeholder="Costo"
                        prefix="C$"
                        style={{ width: isMobile ? "100%" : 140 }}
                    />

                    <Button type="primary" icon={<ShoppingOutlined />} onClick={agregarItem} className="brand-button">
                        Agregar
                    </Button>
                </Space>

                <div className="table-scroll">
                    <Table
                        locale={{
                            emptyText: (
                                <div style={{ padding: 24 }}>
                                    <InboxOutlined style={{ fontSize: 24, color: "#94a3b8" }} />
                                    <div>No has agregado productos a la compra.</div>
                                </div>
                            ),
                        }}
                        dataSource={items}
                        rowKey="productoId"
                        pagination={false}
                        size="small"
                        scroll={{ x: 620 }}
                        columns={[
                            { title: "Producto", dataIndex: "producto" },
                            { title: "Cantidad", dataIndex: "cantidad", align: "right" },
                            {
                                title: "Costo",
                                dataIndex: "precioUnitario",
                                align: "right",
                                render: (value: number) => formatCurrency(value),
                            },
                            {
                                title: "Subtotal",
                                dataIndex: "subtotal",
                                align: "right",
                                render: (value: number) => formatCurrency(value),
                            },
                            {
                                title: "",
                                align: "center",
                                render: (_, record) => (
                                    <Button
                                        danger
                                        type="text"
                                        icon={<DeleteOutlined />}
                                        onClick={() => eliminarItem(record.productoId)}
                                    />
                                ),
                            },
                        ]}
                    />
                </div>

                <div className="flex justify-end mt-4">
                    <Card size="small" bordered={false} className="metric-card" style={{ minWidth: 220 }}>
                        <Text type="secondary">Total de la compra</Text>
                        <Title level={4} style={{ margin: 0 }}>
                            <DollarOutlined /> {formatCurrency(totalDraft)}
                        </Title>
                    </Card>
                </div>
            </Modal>
        </div>
    );
}
