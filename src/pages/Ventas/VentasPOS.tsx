import { useEffect, useState, useRef } from "react";
import {
    Table,
    Input,
    Button,
    message,
    Divider,
    Card,
    Modal,
    Tag,
    Typography,
    Select,
} from "antd";
import {
    SearchOutlined,
    DeleteOutlined,
    ShoppingCartOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    PrinterOutlined,
    DollarOutlined,
    CreditCardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../api/api";
import { getUserFromToken } from "../../utils/auth";
import { useReactToPrint } from "react-to-print";

const { Title } = Typography;

interface Producto {
    id: number;
    nombre: string;
    precio: number;
    stock: number;
}

interface ItemVenta extends Producto {
    cantidad: number;
    subtotal: number;
}

interface Factura {
    id: number;
    fecha: string;
    usuario: string;
    metodoPago: string;
    total: number;
    montoPagado: number;
    vuelto: number;
    detalles: {
        producto: string;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
    }[];
}

export default function VentasPOS() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [items, setItems] = useState<ItemVenta[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const usuario = getUserFromToken();
    const [loading, setLoading] = useState(false);

    // 💳 Variables de pago
    const [metodoPago, setMetodoPago] = useState<string>("Efectivo");
    const [montoPagado, setMontoPagado] = useState<number>(0);
    const [vuelto, setVuelto] = useState<number>(0);

    // 🧾 Factura
    const [visibleFactura, setVisibleFactura] = useState(false);
    const [factura, setFactura] = useState<Factura | null>(null);
    const facturaRef = useRef<HTMLDivElement>(null);

    // 🖨️ Configurar impresión POS
    const handlePrint = useReactToPrint({
        contentRef: facturaRef,
        documentTitle: factura ? `Factura_${factura.id}` : "Ticket_PharmaSys",
        onAfterPrint: () => message.success("🧾 Ticket impreso correctamente"),
        pageStyle: `
            @page { size: 80mm auto; margin: 0; }
            @media print {
                html, body {
                    width: 80mm;
                    margin: 0;
                    padding: 0;
                    font-family: monospace;
                    font-size: 11px;
                }
            }
        `,
    });

    // 🔹 Cargar productos
    const cargarProductos = async () => {
        try {
            setLoading(true);
            const res = await api.get<Producto[]>("/Productos");
            setProductos(res.data);
        } catch {
            message.error("Error al cargar los productos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    // 🔹 Agregar producto al carrito
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
                        ? {
                            ...p,
                            cantidad: p.cantidad + 1,
                            subtotal: (p.cantidad + 1) * p.precio,
                        }
                        : p
                );
            }
            return [...prev, { ...producto, cantidad: 1, subtotal: producto.precio }];
        });
    };

    // 🔹 Eliminar producto
    const eliminarItem = (id: number) => {
        setItems((prev) => prev.filter((p) => p.id !== id));
    };

    // 🔹 Calcular totales
    const subtotal = items.reduce((acc, p) => acc + p.subtotal, 0);
    const iva = subtotal * 0.15;
    const total = subtotal + iva;

    // 💵 Calcular vuelto automáticamente
    useEffect(() => {
        if (metodoPago === "Efectivo" && montoPagado >= total)
            setVuelto(montoPagado - total);
        else setVuelto(0);
    }, [montoPagado, total, metodoPago]);

    // 🔹 Finalizar venta
    const finalizarVenta = async () => {
        if (items.length === 0) {
            message.warning("Agrega productos al carrito antes de finalizar la venta");
            return;
        }

        if (metodoPago === "Efectivo" && montoPagado < total) {
            message.warning("El monto pagado no es suficiente para cubrir el total.");
            return;
        }

        Modal.confirm({
            title: "Confirmar venta",
            content: (
                <div>
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
                        usuarioEmail: usuario?.email,
                        fecha: dayjs().toISOString(),
                        total,
                        metodoPago,
                        detalles: items.map((i) => ({
                            productoId: i.id,
                            cantidad: i.cantidad,
                            precioUnitario: i.precio,
                            subtotal: i.subtotal,
                        })),
                    });

                    message.success("✅ Venta registrada correctamente");

                    setFactura({
                        id: res.data.venta?.id || Date.now(),
                        fecha: dayjs().format("DD/MM/YYYY HH:mm"),
                        usuario: usuario?.name || usuario?.email || "Vendedor",
                        metodoPago,
                        total,
                        montoPagado,
                        vuelto,
                        detalles: items.map((i) => ({
                            producto: i.nombre,
                            cantidad: i.cantidad,
                            precioUnitario: i.precio,
                            subtotal: i.subtotal,
                        })),
                    });

                    setVisibleFactura(true);
                    setItems([]);
                    setMontoPagado(0);
                    await cargarProductos();
                } catch {
                    message.error("Error al registrar la venta");
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
        <div className="p-8 bg-gray-50 min-h-screen">
            <Title level={3} style={{ color: "#1677ff", marginBottom: 24 }}>
                <ShoppingCartOutlined /> Punto de Venta (POS)
            </Title>

            {/* 🔍 Buscador */}
            <div className="flex flex-wrap gap-3 mb-6 items-center">
                <Input
                    placeholder="Buscar producto..."
                    prefix={<SearchOutlined />}
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ width: 350 }}
                />
                <Button icon={<ReloadOutlined />} onClick={cargarProductos} loading={loading}>
                    Actualizar lista
                </Button>
            </div>

            {/* 🧾 Sección principal */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Catálogo */}
                <Card title="Productos disponibles" bordered>
                    <Table
                        dataSource={productosFiltrados}
                        rowKey="id"
                        size="small"
                        pagination={{ pageSize: 6 }}
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
                </Card>

                {/* Carrito */}
                <Card title="Carrito de Venta" bordered>
                    <Table
                        dataSource={items}
                        rowKey="id"
                        size="small"
                        pagination={false}
                        columns={[
                            { title: "Producto", dataIndex: "nombre" },
                            { title: "Cant.", dataIndex: "cantidad" },
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
                                    <Button
                                        icon={<DeleteOutlined />}
                                        danger
                                        size="small"
                                        onClick={() => eliminarItem(record.id)}
                                    />
                                ),
                            },
                        ]}
                    />

                    <Divider />

                    <div className="text-right space-y-2">
                        <div>Subtotal: <b>C$ {subtotal.toFixed(2)}</b></div>
                        <div>IVA (15%): <b>C$ {iva.toFixed(2)}</b></div>
                        <div>Total: <b className="text-green-600 text-lg">C$ {total.toFixed(2)}</b></div>
                    </div>

                    <Divider />

                    {/* 💳 Método de pago */}
                    <div className="mb-3">
                        <span className="font-medium">
                            <CreditCardOutlined /> Método de Pago:
                        </span>
                        <Select
                            value={metodoPago}
                            onChange={(v) => setMetodoPago(v)}
                            style={{ width: "100%", marginTop: 6 }}
                            options={[
                                { value: "Efectivo", label: "Efectivo 💵" },
                                { value: "Tarjeta", label: "Tarjeta 💳" },
                                { value: "Transferencia", label: "Transferencia 🏦" },
                            ]}
                        />
                    </div>

                    {/* 💵 Monto pagado y vuelto (solo efectivo) */}
                    {metodoPago === "Efectivo" && (
                        <>
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium">
                                    <DollarOutlined /> Monto Pagado:
                                </span>
                                <Input
                                    type="number"
                                    min={0}
                                    value={montoPagado}
                                    onChange={(e) => setMontoPagado(parseFloat(e.target.value) || 0)}
                                    style={{ width: 150 }}
                                    prefix="C$"
                                />
                            </div>

                            <div className="text-right text-blue-600 font-semibold">
                                {montoPagado > 0 && (
                                    <p>
                                        Vuelto:{" "}
                                        <span className="text-green-600">
                                            C$ {vuelto.toFixed(2)}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    <Button
                        type="primary"
                        size="large"
                        className="!bg-green-600 hover:!bg-green-700 mt-3 w-full"
                        loading={loading}
                        icon={<CheckCircleOutlined />}
                        onClick={finalizarVenta}
                    >
                        Finalizar Venta
                    </Button>
                </Card>
            </div>

            {/* 🧾 Modal de Factura */}
            <Modal
                title="Factura generada"
                open={visibleFactura}
                onCancel={() => setVisibleFactura(false)}
                footer={[
                    <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
                        Imprimir Ticket
                    </Button>,
                    <Button key="close" onClick={() => setVisibleFactura(false)}>
                        Cerrar
                    </Button>,
                ]}
                width={420}
            >
                {factura && (
                    <div ref={facturaRef} style={{ width: "80mm", fontFamily: "monospace", fontSize: "12px", padding: "10px" }}>
                        <div style={{ textAlign: "center", marginBottom: "8px" }}>
                            <h3 style={{ margin: 0 }}>💊 <b>PharmaSys</b></h3>
                            <p style={{ margin: 0, fontSize: "11px" }}>Farmacia y Bienestar</p>
                            <p style={{ margin: "4px 0", fontSize: "10px" }}>
                                Fecha: {factura.fecha}<br />
                                Vendedor: {factura.usuario}
                            </p>
                            <hr style={{ border: "1px dashed #000" }} />
                        </div>

                        <table style={{ width: "100%", fontSize: "11px" }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "left" }}>Producto</th>
                                    <th style={{ textAlign: "center" }}>Cant</th>
                                    <th style={{ textAlign: "right" }}>Sub</th>
                                </tr>
                            </thead>
                            <tbody>
                                {factura.detalles.map((item, i) => (
                                    <tr key={i}>
                                        <td>{item.producto}</td>
                                        <td style={{ textAlign: "center" }}>{item.cantidad}</td>
                                        <td style={{ textAlign: "right" }}>C$ {item.subtotal.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <hr style={{ border: "1px dashed #000" }} />

                        <div style={{ textAlign: "right" }}>
                            <p><b>Total:</b> C$ {factura.total.toFixed(2)}</p>
                            <p><b>Método:</b> {factura.metodoPago}</p>
                            {factura.metodoPago === "Efectivo" && (
                                <>
                                    <p><b>Pagó:</b> C$ {factura.montoPagado.toFixed(2)}</p>
                                    <p><b>Vuelto:</b> C$ {factura.vuelto.toFixed(2)}</p>
                                </>
                            )}
                        </div>

                        <div style={{
                            textAlign: "center",
                            marginTop: "10px",
                            fontSize: "10px",
                            borderTop: "1px dashed #000",
                            paddingTop: "4px",
                        }}>
                            ¡Gracias por su compra! 💙<br />
                            PharmaSys - Sistema de Gestión Farmacéutica
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
