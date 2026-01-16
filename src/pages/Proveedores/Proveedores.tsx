import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../../api/api";

interface IProveedor {
    id?: number;
    nombre: string;
    contacto?: string;
    telefono?: string;
    email?: string;
}

export default function Proveedores() {
    const [proveedores, setProveedores] = useState<IProveedor[]>([]);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const cargarProveedores = async () => {
        try {
            setLoading(true);
            const res = await api.get("/Proveedores");
            setProveedores(res.data);
        } catch {
            message.error("Error al cargar proveedores");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarProveedores();
    }, []);

    const crearProveedor = async () => {
        try {
            const values = await form.validateFields();
            await api.post("/Proveedores", values);
            message.success("Proveedor agregado correctamente");
            setVisible(false);
            form.resetFields();
            cargarProveedores();
        } catch {
            message.error("Error al guardar proveedor");
        }
    };

    const eliminarProveedor = async (id: number) => {
        try {
            await api.delete(`/Proveedores/${id}`);
            message.success("Proveedor eliminado");
            cargarProveedores();
        } catch {
            message.error("No se pudo eliminar el proveedor");
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ color: "#1677ff", fontWeight: 600 }}>Gestión de Proveedores</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setVisible(true)}>
                    Nuevo Proveedor
                </Button>
            </div>

            <Table
                loading={loading}
                dataSource={proveedores}
                rowKey="id"
                pagination={{ pageSize: 6 }}
                bordered
                columns={[
                    { title: "Nombre", dataIndex: "nombre" },
                    { title: "Contacto", dataIndex: "contacto" },
                    { title: "Teléfono", dataIndex: "telefono" },
                    { title: "Email", dataIndex: "email" },
                    {
                        title: "Acciones",
                        align: "center",
                        render: (_, record) => (
                            <Space>
                                <Popconfirm
                                    title="¿Eliminar proveedor?"
                                    okText="Sí"
                                    cancelText="No"
                                    onConfirm={() => eliminarProveedor(record.id!)}
                                >
                                    <Button danger icon={<DeleteOutlined />}>
                                        Eliminar
                                    </Button>
                                </Popconfirm>
                            </Space>
                        ),
                    },
                ]}
            />

            <Modal
                title="Registrar nuevo proveedor"
                open={visible}
                onCancel={() => setVisible(false)}
                onOk={crearProveedor}
                okText="Guardar"
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: "Ingrese el nombre del proveedor" }]}>
                        <Input placeholder="Ejemplo: Laboratorios GlobalPharma" />
                    </Form.Item>
                    <Form.Item name="contacto" label="Contacto">
                        <Input placeholder="Nombre del contacto" />
                    </Form.Item>
                    <Form.Item name="telefono" label="Teléfono">
                        <Input placeholder="Ejemplo: +34 600 123 456" />
                    </Form.Item>
                    <Form.Item name="email" label="Correo electrónico" rules={[{ type: "email", message: "Correo no válido" }]}>
                        <Input placeholder="correo@empresa.com" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
