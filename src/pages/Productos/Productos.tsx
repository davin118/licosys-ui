import { useEffect, useState } from "react";
import {
    Table,
    Button,
    message,
    Tag,
    Select,
    AutoComplete,
    Input,
    Grid,
} from "antd";
import type { TableProps } from "antd";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import api from "../../api/api";
import type { IProducto } from "../../interfaces/IProducto";
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    FilterOutlined,
    SearchOutlined,
    FileExcelOutlined,
} from "@ant-design/icons";
import ProductoModal from "../../components/modals/ProductoModal";
import { motion } from "framer-motion";
import { Card, Statistic } from "antd";
import { Popconfirm } from "antd";
import { getUserFromToken } from "../../utils/auth";

export default function Productos() {
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;
    const user = getUserFromToken();
    const esAdministrador = user?.role === "Administrador";

    const columnasBase: TableProps<IProducto>["columns"] = [
        { title: "Nombre", dataIndex: "nombre" },
        {
            title: () => (
                <span>
                    Precio <span style={{ color: "#1677ff", fontWeight: 600 }}>C$</span>
                </span>
            ),
            dataIndex: "precio",
            render: (valor: number) => valor.toFixed(2),
        },
        {
            title: () => (
                <span>
                    Costo <span style={{ color: "#faad14", fontWeight: 600 }}>C$</span>
                </span>
            ),
            dataIndex: "costo",
            render: (valor: number) => valor.toFixed(2),
        },
        { title: "Stock", dataIndex: "stock" },
        {
            title: "Vencimiento",
            dataIndex: "fechaVencimiento",
            render: (fecha?: string) => {
                const estado = getEstadoVencimiento(fecha);
                return (
                    <div style={{ fontWeight: "bold", color: estado.color, minWidth: 150 }}>
                        {fecha ? dayjs(fecha).format("DD/MM/YYYY") : "Sin vencimiento"}{" "}
                        <Tag color={estado.color}>{estado.label}</Tag>
                    </div>
                );
            },
        },
        {
            title: "Categoría",
            dataIndex: ["categoria", "nombre"],
            render: (valor?: string) => valor || "-",
        },
        {
            title: "Proveedor",
            dataIndex: ["proveedor", "nombre"],
            render: (valor?: string) => valor || "-",
        },
    ];

    const columnas: TableProps<IProducto>["columns"] = esAdministrador
        ? [
              ...columnasBase,
              {
                  title: "Acciones",
                  render: (_, record) => (
                      <div className="flex gap-2">
                          <Button icon={<EditOutlined />} onClick={() => abrirEdicion(record)}>
                              Editar
                          </Button>
                          <Popconfirm
                              title="¿Eliminar producto?"
                              okText="Sí"
                              cancelText="No"
                              onConfirm={() => eliminarProducto(record.id)}
                          >
                              <Button icon={<DeleteOutlined />} danger>
                                  Eliminar
                              </Button>
                          </Popconfirm>
                      </div>
                  ),
              },
          ]
        : columnasBase;
    const [productos, setProductos] = useState<IProducto[]>([]);
    const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
    const [proveedores, setProveedores] = useState<{ id: number; nombre: string }[]>([]);
    const [visible, setVisible] = useState(false);
    const [productoEditando, setProductoEditando] = useState<IProducto | null>(null);
    const [loading, setLoading] = useState(false);

    // Filtros
    const [filtroEstado, setFiltroEstado] = useState<string | null>(null);
    const [filtroCategoria, setFiltroCategoria] = useState<number | null>(null);
    const [filtroProveedor, setFiltroProveedor] = useState<number | null>(null);
    const [busqueda, setBusqueda] = useState<string>("");
    const [sugerencias, setSugerencias] = useState<{ value: string }[]>([]);

    // 🔹 Cargar productos
    const cargarProductos = async () => {
        try {
            const res = await api.get("/Productos");
            setProductos(res.data);
        } catch {
            message.error("Error al cargar los productos");
        }
    };

    // 🔹 Cargar categorías y proveedores
    const cargarCategoriasYProveedores = async () => {
        const [catRes, provRes] = await Promise.all([
            api.get("/categorias"),
            api.get("/proveedores"),
        ]);
        setCategorias(catRes.data);
        setProveedores(provRes.data);
    };

    useEffect(() => {
        cargarProductos();
        cargarCategoriasYProveedores();
    }, []);

    // 🔹 Crear producto
    const crearProducto = async (values: any) => {
        try {
            setLoading(true);
            const payload = {
                ...values,
                fechaVencimiento: values.fechaVencimiento
                    ? values.fechaVencimiento.format("YYYY-MM-DD")
                    : null,
            };

            if (productoEditando) {
                await api.put(`/Productos/${productoEditando.id}`, payload);
                message.success("Producto actualizado correctamente 🍷");
            } else {
                await api.post("/Productos", payload);
                message.success("Producto agregado correctamente 🍷");
            }

            setVisible(false);
            setProductoEditando(null);
            cargarProductos();
        } catch {
            message.error("Error al guardar el producto");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Eliminar producto
    const eliminarProducto = async (id: number) => {
        try {
            await api.delete(`/Productos/${id}`);
            message.success("Producto eliminado");
            cargarProductos();
        } catch {
            message.error("No se pudo eliminar el producto");
        }
    };

    const abrirEdicion = (producto: IProducto) => {
        setProductoEditando({
            ...producto,
            fechaVencimiento: producto.fechaVencimiento ? dayjs(producto.fechaVencimiento) as any : null,
        } as IProducto);
        setVisible(true);
    };

    // 🔹 Obtener estado visual del vencimiento
    const getEstadoVencimiento = (fecha?: string | null) => {
        if (!fecha) {
            return { label: "Sin vencimiento", color: "blue" };
        }

        const hoy = dayjs();
        const vencimiento = dayjs(fecha);
        const diff = vencimiento.diff(hoy, "day");

        if (diff < 0) return { label: "Vencido", color: "red" };
        if (diff <= 30) return { label: "Por vencer", color: "orange" };
        return { label: "Vigente", color: "green" };
    };

    // 🔹 Generar sugerencias al escribir
    const manejarBusqueda = (value: string) => {
        setBusqueda(value);
        if (value.trim() === "") {
            setSugerencias([]);
            return;
        }

        const sugeridos = productos
            .filter((p) => p.nombre.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 5)
            .map((p) => ({ value: p.nombre }));

        setSugerencias(sugeridos);
    };

    // 🔹 Filtrar productos
    const productosFiltrados = productos.filter((p) => {
        const estado = getEstadoVencimiento(p.fechaVencimiento);
        const coincideEstado = !filtroEstado || filtroEstado === estado.label;
        const coincideCategoria = !filtroCategoria || p.categoriaId === filtroCategoria;
        const coincideProveedor = !filtroProveedor || p.proveedorId === filtroProveedor;
        const coincideBusqueda =
            !busqueda ||
            p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.categoria?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.proveedor?.nombre?.toLowerCase().includes(busqueda.toLowerCase());

        return coincideEstado && coincideCategoria && coincideProveedor && coincideBusqueda;
    });

    // 🔹 Estadísticas para dashboard
    const totalPorVencer = productos.filter(
        (p) => getEstadoVencimiento(p.fechaVencimiento).label === "Por vencer"
    ).length;
    const totalVencidos = productos.filter(
        (p) => getEstadoVencimiento(p.fechaVencimiento).label === "Vencido"
    ).length;

    // 🔹 Exportar Excel
    const exportarExcel = () => {
        const datos = productosFiltrados.map((p) => ({
            Nombre: p.nombre,
            Precio: p.precio,
            Costo: p.costo,
            Stock: p.stock,
            "Fecha Vencimiento": p.fechaVencimiento
                ? dayjs(p.fechaVencimiento).format("DD/MM/YYYY")
                : "Sin vencimiento",
            Categoría: p.categoria?.nombre,
            Proveedor: p.proveedor?.nombre,
        }));

        const hoja = XLSX.utils.json_to_sheet(datos);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Productos");
        XLSX.writeFile(libro, "productos_licosys.xlsx");

        message.success("Exportado a Excel correctamente ✅");
    };

    return (
        <div className="page-shell p-3 md:p-6">
            <div className="page-hero">
                <p className="hero-kicker">Catalogo</p>
                <h2 className="text-2xl md:text-3xl font-bold">Gestion de Productos</h2>
                <p className="page-subtle mt-2">
                    Controla stock, vigencia y proveedores desde una vista mas ordenada.
                </p>
            </div>

            {/* 🔹 Dashboard superior animado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                {[
                    { title: "Productos totales", value: productos.length, color: "#1677ff" },
                    { title: "Por vencer", value: totalPorVencer, color: "orange" },
                    { title: "Vencidos", value: totalVencidos, color: "red" },
                ].map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                        <Card
                            size="small"
                            bodyStyle={{ padding: "10px 16px", textAlign: "center" }}
                            className="metric-card"
                            bordered={false}
                        >
                            <Statistic
                                title={<span style={{ fontSize: 13 }}>{card.title}</span>}
                                value={card.value}
                                valueStyle={{ color: card.color, fontSize: 20, fontWeight: 600 }}
                            />
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* 🔹 Encabezado */}
            <div className="flex flex-wrap justify-between mb-6 items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-[#65142d]">Herramientas de Producto</h2>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Button icon={<FilterOutlined />} onClick={() => {
                        setFiltroEstado(null);
                        setFiltroCategoria(null);
                        setFiltroProveedor(null);
                        setBusqueda("");
                        setSugerencias([]);
                        message.info("Filtros limpiados 🧹");
                    }}>
                        Limpiar filtros
                    </Button>

                    <Button
                        icon={<FileExcelOutlined />}
                        onClick={exportarExcel}
                        style={{ width: isMobile ? "100%" : undefined }}
                    >
                        Exportar Excel
                    </Button>

                    {esAdministrador && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setProductoEditando(null);
                                setVisible(true);
                            }}
                            className="brand-button"
                            style={{ width: isMobile ? "100%" : undefined }}
                        >
                            Nuevo Producto
                        </Button>
                    )}
                </div>
            </div>

            {/* 🔹 Filtros */}
            <div className="filters-wrap flex flex-wrap gap-3 mb-4 items-center toolbar-soft">
                <AutoComplete
                    options={sugerencias}
                    style={{ width: isMobile ? "100%" : 220 }}
                    onSearch={manejarBusqueda}
                    onSelect={(value) => setBusqueda(value)}
                    value={busqueda}
                    placeholder="Buscar producto..."
                >
                    <Input prefix={<SearchOutlined />} allowClear />
                </AutoComplete>

                <Select
                    placeholder="Filtrar por estado"
                    allowClear
                    value={filtroEstado || undefined}
                    onChange={(v) => setFiltroEstado(v || null)}
                    style={{ width: isMobile ? "100%" : 180 }}
                >
                    <Select.Option value="Vigente">Vigente</Select.Option>
                    <Select.Option value="Por vencer">Por vencer</Select.Option>
                    <Select.Option value="Vencido">Vencido</Select.Option>
                </Select>

                <Select
                    placeholder="Filtrar por categoría"
                    allowClear
                    value={filtroCategoria || undefined}
                    onChange={(v) => setFiltroCategoria(v || null)}
                    style={{ width: isMobile ? "100%" : 220 }}
                >
                    {categorias.map((cat) => (
                        <Select.Option key={cat.id} value={cat.id}>
                            {cat.nombre}
                        </Select.Option>
                    ))}
                </Select>

                <Select
                    placeholder="Filtrar por proveedor"
                    allowClear
                    value={filtroProveedor || undefined}
                    onChange={(v) => setFiltroProveedor(v || null)}
                    style={{ width: isMobile ? "100%" : 220 }}
                >
                    {proveedores.map((prov) => (
                        <Select.Option key={prov.id} value={prov.id}>
                            {prov.nombre}
                        </Select.Option>
                    ))}
                </Select>

                <span className="text-gray-500 md:ml-3 w-full md:w-auto">
                    Mostrando <b>{productosFiltrados.length}</b> de <b>{productos.length}</b> productos
                </span>
            </div>

            {/* 🔹 Tabla principal */}
            <div className="table-scroll">
                <Table
                    dataSource={productosFiltrados}
                    rowKey="id"
                    bordered
                    pagination={{ pageSize: 6 }}
                    scroll={{ x: 980 }}
                    columns={columnas}
                    className="panel-soft"
                />
            </div>

            {/* 🔹 Modal de producto */}
            <ProductoModal
                open={visible}
                onCancel={() => {
                    setVisible(false);
                    setProductoEditando(null);
                }}
                onOk={crearProducto}
                confirmLoading={loading}
                categorias={categorias}
                proveedores={proveedores}
                initialValues={productoEditando ?? undefined}
                modo={productoEditando ? "editar" : "crear"}
            />
        </div>
    );
}
