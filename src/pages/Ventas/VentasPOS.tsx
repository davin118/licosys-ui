import { useEffect, useMemo, useRef, useState } from "react";
import {
    Table,
    Input,
    InputNumber,
    Button,
    message,
    Divider,
    Card,
    Modal,
    Tag,
    Typography,
    Select,
    Grid,
    Alert,
    Form,
    Space,
} from "antd";
import {
    SearchOutlined,
    DeleteOutlined,
    ShoppingCartOutlined,
    ReloadOutlined,
    PrinterOutlined,
    DollarOutlined,
    CreditCardOutlined,
    FileTextOutlined,
    UserOutlined,
} from "@ant-design/icons";
import api from "../../api/api";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import type { ICliente } from "../../interfaces/ICliente";

const { Title, Text } = Typography;

interface Producto {
    id: number;
    nombre: string;
    precio: number;
    stock: number;
}

interface Cliente {
    id: number;
    nombre: string;
    telefono?: string;
    direccion?: string;
}

interface ItemVenta extends Producto {
    cantidad: number;
    subtotal: number;
}

interface FacturaDetalle {
    producto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

interface Factura {
    id: number;
    numeroDocumento: string;
    serie: string;
    subtotal?: number;
    impuesto?: number;
    fecha: string;
    usuario: string;
    cliente?: string | null;
    clienteId?: number | null;
    metodoPago: string;
    tipoComprobante: string;
    total: number;
    montoPagado?: number;
    vuelto?: number;
    detalles: FacturaDetalle[];
}

export default function VentasPOS() {
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;
    const [productos, setProductos] = useState<Producto[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [items, setItems] = useState<ItemVenta[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(false);
    const [clienteModalOpen, setClienteModalOpen] = useState(false);
    const [creatingCliente, setCreatingCliente] = useState(false);
    const [clienteForm] = Form.useForm<ICliente>();

    const [metodoPago, setMetodoPago] = useState<string>("Efectivo");
    const [clienteId, setClienteId] = useState<number | undefined>();
    const [montoPagado, setMontoPagado] = useState<number>(0);
    const [vuelto, setVuelto] = useState<number>(0);

    const [visibleFactura, setVisibleFactura] = useState(false);
    const [factura, setFactura] = useState<Factura | null>(null);
    const facturaRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: facturaRef,
        documentTitle: factura ? `${factura.tipoComprobante}_${factura.id}` : "Comprobante_LicoSys",
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

    const cargarDatos = async () => {
        setLoading(true);
        const [productosRes, clientesRes] = await Promise.allSettled([
            api.get<Producto[]>("/Productos"),
            api.get<Cliente[]>("/Clientes"),
        ]);

        if (productosRes.status === "fulfilled") {
            setProductos(productosRes.value.data);
        } else {
            const errorMessage = axios.isAxiosError(productosRes.reason)
                ? productosRes.reason.response?.data?.mensaje ?? productosRes.reason.response?.data?.error
                : null;
            message.error(errorMessage ?? "No se pudieron cargar los productos");
        }

        if (clientesRes.status === "fulfilled") {
            setClientes(clientesRes.value.data);
        } else {
            const errorMessage = axios.isAxiosError(clientesRes.reason)
                ? clientesRes.reason.response?.data?.mensaje ?? productosRes.status === "rejected"
                    ? null
                    : clientesRes.reason.response?.data?.error
                : null;
            message.warning(errorMessage ?? "No se pudieron cargar los clientes. El ticket sigue disponible.");
        }

        setLoading(false);
    };

    const crearClienteRapido = async () => {
        try {
            const values = await clienteForm.validateFields();
            setCreatingCliente(true);

            const res = await api.post<Cliente>("/Clientes", values);
            const clienteCreado = res.data;

            setClientes((prev) => [clienteCreado, ...prev]);
            setClienteId(clienteCreado.id);
            setClienteModalOpen(false);
            clienteForm.resetFields();
            message.success("Cliente creado correctamente");
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.mensaje ?? error.response?.data?.error
                : null;

            if (!errorMessage && error instanceof Error && error.message.includes("validate")) {
                return;
            }

            message.error(errorMessage ?? "No se pudo crear el cliente");
        } finally {
            setCreatingCliente(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const agregarProducto = (producto: Producto) => {
        if (producto.stock <= 0) {
            message.warning("Producto sin stock disponible");
            return;
        }

        setItems((prev) => {
            const existente = prev.find((p) => p.id === producto.id);
            if (existente) {
                if (existente.cantidad + 1 > producto.stock) {
                    message.warning("Stock insuficiente");
                    return prev;
                }
                return prev.map((p) =>
                    p.id === producto.id
                        ? { ...p, cantidad: p.cantidad + 1, subtotal: (p.cantidad + 1) * p.precio }
                        : p
                );
            }
            return [...prev, { ...producto, cantidad: 1, subtotal: producto.precio }];
        });
    };

    const eliminarItem = (id: number) => {
        setItems((prev) => prev.filter((p) => p.id !== id));
    };

    const actualizarCantidad = (id: number, cantidad: number | null) => {
        if (!cantidad || cantidad <= 0) {
            eliminarItem(id);
            return;
        }

        const producto = productos.find((item) => item.id === id);
        if (!producto) {
            return;
        }

        if (cantidad > producto.stock) {
            message.warning("La cantidad supera el stock disponible.");
            return;
        }

        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, cantidad, subtotal: cantidad * item.precio }
                    : item
            )
        );
    };

    const subtotal = useMemo(() => items.reduce((acc, p) => acc + p.subtotal, 0), [items]);
    const iva = useMemo(() => subtotal * 0.15, [subtotal]);
    const total = useMemo(() => subtotal + iva, [subtotal, iva]);

    const tipoComprobante: "Ticket" | "Factura" = clienteId ? "Factura" : "Ticket";

    useEffect(() => {
        if (metodoPago === "Efectivo" && montoPagado >= total) {
            setVuelto(montoPagado - total);
            return;
        }

        setVuelto(0);
    }, [montoPagado, total, metodoPago]);

    const finalizarVenta = async () => {
        if (items.length === 0) {
            message.warning("Agrega productos al carrito antes de finalizar la venta");
            return;
        }

        if (metodoPago === "Efectivo" && montoPagado < total) {
            message.warning("El monto pagado no es suficiente para cubrir el total.");
            return;
        }

        const clienteSeleccionado = clientes.find((cliente) => cliente.id === clienteId);

        Modal.confirm({
            title: `Confirmar ${tipoComprobante.toLowerCase()}`,
            content: (
                <div>
                    <p><b>Comprobante:</b> {tipoComprobante}</p>
                    {tipoComprobante === "Factura" && <p><b>Cliente:</b> {clienteSeleccionado?.nombre}</p>}
                    <p><b>Método:</b> {metodoPago}</p>
                    <p><b>Total:</b> C$ {total.toFixed(2)}</p>
                    {metodoPago === "Efectivo" && (
                        <>
                            <p><b>Pagó con:</b> C$ {montoPagado.toFixed(2)}</p>
                            <p><b>Vuelto:</b> C$ {vuelto.toFixed(2)}</p>
                        </>
                    )}
                </div>
            ),
            okText: "Confirmar",
            cancelText: "Cancelar",
            async onOk() {
                try {
                    setLoading(true);

                    const res = await api.post("/Ventas", {
                        tipoComprobante,
                        clienteId: clienteId ?? null,
                        metodoPago,
                        montoPagado: metodoPago === "Efectivo" ? montoPagado : total,
                        vuelto: metodoPago === "Efectivo" ? vuelto : 0,
                        detalles: items.map((i) => ({
                            productoId: i.id,
                            cantidad: i.cantidad,
                            precioUnitario: i.precio,
                            subtotal: i.subtotal,
                        })),
                    });

                    const comprobante = res.data.factura as Factura;

                    setFactura({
                        ...comprobante,
                        cliente: comprobante.cliente ?? (tipoComprobante === "Factura" ? clienteSeleccionado?.nombre : "Consumidor final"),
                    });

                    message.success(`${tipoComprobante} registrada correctamente`);
                    setVisibleFactura(true);
                    setItems([]);
                    setMontoPagado(0);
                    setVuelto(0);
                    setClienteId(undefined);
                    await cargarDatos();
                } catch (error) {
                    const errorMessage = axios.isAxiosError(error)
                        ? error.response?.data?.mensaje ?? error.response?.data?.error
                        : null;
                    message.error(errorMessage ?? "Error al registrar la venta");
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const productosFiltrados = productos.filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="page-shell p-3 md:p-6 bg-gray-50 min-h-full">
            <Title level={3} style={{ color: "#1677ff", marginBottom: 24 }}>
                <ShoppingCartOutlined /> Punto de Venta (POS)
            </Title>

            <div className="flex flex-wrap gap-3 mb-6 items-center">
                <Input
                    placeholder="Buscar producto..."
                    prefix={<SearchOutlined />}
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ width: isMobile ? "100%" : 350 }}
                />
                <Button
                    icon={<ReloadOutlined />}
                    onClick={cargarDatos}
                    loading={loading}
                    style={{ width: isMobile ? "100%" : undefined }}
                >
                    Actualizar lista
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card title="Productos disponibles" bordered>
                    <div className="table-scroll">
                        <Table
                            dataSource={productosFiltrados}
                            rowKey="id"
                            size="small"
                            pagination={{ pageSize: 6 }}
                            scroll={{ x: 520 }}
                            columns={[
                                { title: "Nombre", dataIndex: "nombre" },
                                {
                                    title: "Precio",
                                    dataIndex: "precio",
                                    render: (v) => `C$ ${v.toFixed(2)}`,
                                },
                                {
                                    title: "Stock",
                                    dataIndex: "stock",
                                    render: (v) => (
                                        <Tag color={v > 5 ? "green" : v > 0 ? "orange" : "red"}>
                                            {v}
                                        </Tag>
                                    ),
                                },
                                {
                                    title: "",
                                    align: "center",
                                    render: (_, record) => (
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={() => agregarProducto(record)}
                                            disabled={record.stock === 0}
                                        >
                                            Agregar
                                        </Button>
                                    ),
                                },
                            ]}
                        />
                    </div>
                </Card>

                <Card title="Carrito de Venta" bordered>
                    <div className="table-scroll">
                        <Table
                            dataSource={items}
                            rowKey="id"
                            size="small"
                            pagination={false}
                            scroll={{ x: 560 }}
                            columns={[
                                { title: "Producto", dataIndex: "nombre" },
                                {
                                    title: "Cant.",
                                    dataIndex: "cantidad",
                                    render: (value, record) => (
                                        <InputNumber
                                            min={1}
                                            max={record.stock}
                                            value={value}
                                            onChange={(cantidad) => actualizarCantidad(record.id, cantidad)}
                                            size="small"
                                            style={{ width: 72 }}
                                        />
                                    ),
                                },
                                {
                                    title: "Precio (C$)",
                                    dataIndex: "precio",
                                    render: (v) => v.toFixed(2),
                                },
                                {
                                    title: "Subtotal (C$)",
                                    dataIndex: "subtotal",
                                    render: (v) => v.toFixed(2),
                                },
                                {
                                    title: "",
                                    render: (_, record) => (
                                        <Button icon={<DeleteOutlined />} danger size="small" onClick={() => eliminarItem(record.id)} />
                                    ),
                                },
                            ]}
                        />
                    </div>

                    <Divider />

                    <div className="text-right space-y-2">
                        <div>Subtotal: <b>C$ {subtotal.toFixed(2)}</b></div>
                        <div>IVA (15%): <b>C$ {iva.toFixed(2)}</b></div>
                        <div>Total: <b className="text-green-600 text-lg">C$ {total.toFixed(2)}</b></div>
                    </div>

                    <Divider />

                    <div className="grid gap-3">
                        <div>
                            <Text strong><FileTextOutlined /> Tipo de Comprobante:</Text>
                            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <Tag color={tipoComprobante === "Factura" ? "blue" : "green"}>
                                    {tipoComprobante}
                                </Tag>
                                <Tag color={clienteId ? "cyan" : "default"}>
                                    {clienteId ? "Cliente asignado" : "Consumidor final"}
                                </Tag>
                            </div>
                            <Alert
                                style={{ marginTop: 8 }}
                                type="info"
                                showIcon
                                message={
                                    tipoComprobante === "Factura"
                                        ? "Se generará factura porque la venta tiene un cliente asignado."
                                        : "Se generará ticket porque la venta no tiene cliente asignado."
                                }
                            />
                            <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                                Cliente seleccionado: <b>{clienteId ? "Si" : "No"}</b>
                            </div>
                        </div>

                        <div>
                            <Text strong><UserOutlined /> Cliente:</Text>
                            <Space.Compact style={{ width: "100%", marginTop: 6 }}>
                                <Select
                                    allowClear
                                    showSearch
                                    value={clienteId}
                                    onChange={(value) => setClienteId(value)}
                                    placeholder="Consumidor final"
                                    style={{ width: "100%" }}
                                    options={clientes.map((cliente) => ({
                                        value: cliente.id,
                                        label: cliente.nombre,
                                    }))}
                                />
                                <Button onClick={() => setClienteModalOpen(true)}>
                                    Nuevo
                                </Button>
                            </Space.Compact>
                        </div>

                        <div>
                            <Text strong><CreditCardOutlined /> Método de Pago:</Text>
                            <Select
                                value={metodoPago}
                                onChange={setMetodoPago}
                                style={{ width: "100%", marginTop: 6 }}
                                options={[
                                    { value: "Efectivo", label: "Efectivo" },
                                    { value: "Tarjeta", label: "Tarjeta" },
                                    { value: "Transferencia", label: "Transferencia" },
                                ]}
                            />
                        </div>

                        {metodoPago === "Efectivo" && (
                            <div>
                                <Text strong><DollarOutlined /> Monto recibido:</Text>
                                <Input
                                    type="number"
                                    min={0}
                                    value={montoPagado}
                                    onChange={(e) => setMontoPagado(Number(e.target.value))}
                                    style={{ marginTop: 6 }}
                                />
                                <div className="mt-2 text-right">
                                    Vuelto: <b>C$ {vuelto.toFixed(2)}</b>
                                </div>
                            </div>
                        )}
                    </div>

                    <Divider />

                    <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        size="large"
                        block
                        onClick={finalizarVenta}
                        className="brand-button"
                    >
                        Finalizar {tipoComprobante}
                    </Button>
                </Card>
            </div>

            <Modal
                open={visibleFactura}
                onCancel={() => setVisibleFactura(false)}
                footer={[
                    <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => handlePrint()}>
                        Imprimir
                    </Button>,
                    <Button key="close" onClick={() => setVisibleFactura(false)}>
                        Cerrar
                    </Button>,
                ]}
                width={420}
                title={factura?.tipoComprobante ?? "Comprobante"}
            >
                <div ref={facturaRef}>
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
                                {factura?.tipoComprobante ?? "Comprobante"}
                            </div>
                            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700 }}>
                                {factura?.numeroDocumento ?? ""}
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
                            <div><b>Fecha:</b> {factura?.fecha}</div>
                            <div><b>Vendedor:</b> {factura?.usuario}</div>
                            <div><b>Cliente:</b> {factura?.cliente || "Consumidor final"}</div>
                            <div><b>Pago:</b> {factura?.metodoPago}</div>
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

                            {factura?.detalles.map((detalle, index) => (
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
                                        <span>{detalle.cantidad} x C$ {detalle.precioUnitario.toFixed(2)}</span>
                                        <span>C$ {detalle.subtotal.toFixed(2)}</span>
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
                                <span>C$ {(factura?.subtotal ?? 0).toFixed(2)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span>IVA</span>
                                <span>C$ {(factura?.impuesto ?? 0).toFixed(2)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span>Total</span>
                                <strong style={{ fontSize: 15 }}>C$ {factura?.total.toFixed(2)}</strong>
                            </div>
                            {factura?.metodoPago === "Efectivo" && (
                                <>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span>Recibido</span>
                                        <span>C$ {(factura?.montoPagado ?? 0).toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Vuelto</span>
                                        <span>C$ {(factura?.vuelto ?? 0).toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div
                            style={{
                                marginTop: 14,
                                textAlign: "center",
                                borderTop: "1px dashed #d1d5db",
                                paddingTop: 10,
                                fontSize: 10,
                                color: "#4b5563",
                            }}
                        >
                            <div>Gracias por su compra</div>
                            <div>Conserve este comprobante</div>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal
                title="Crear cliente rápido"
                open={clienteModalOpen}
                onCancel={() => {
                    setClienteModalOpen(false);
                    clienteForm.resetFields();
                }}
                onOk={crearClienteRapido}
                okText="Guardar"
                cancelText="Cancelar"
                confirmLoading={creatingCliente}
            >
                <Form form={clienteForm} layout="vertical">
                    <Form.Item
                        name="nombre"
                        label="Nombre"
                        rules={[
                            { required: true, message: "Ingresa el nombre del cliente" },
                            { min: 3, message: "El nombre debe tener al menos 3 caracteres" },
                        ]}
                    >
                        <Input placeholder="Nombre del cliente" />
                    </Form.Item>
                    <Form.Item name="telefono" label="Teléfono">
                        <Input placeholder="88888888" />
                    </Form.Item>
                    <Form.Item name="direccion" label="Dirección">
                        <Input placeholder="Dirección del cliente" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
