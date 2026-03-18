import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Typography } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import api from "../../api/api";

interface ICliente {
    id?: number;
    nombre: string;
    direccion?: string;
    telefono?: string;
}

const { Title } = Typography;

export default function Clientes() {
    const [clientes, setClientes] = useState<ICliente[]>([]);
    const [visible, setVisible] = useState(false);
    const [editingCliente, setEditingCliente] = useState<ICliente | null>(null);
    const [form] = Form.useForm<ICliente>();
    const [loading, setLoading] = useState(false);

    const cargarClientes = async () => {
        try {
            setLoading(true);
            const res = await api.get<ICliente[]>("/Clientes");
            setClientes(res.data);
        } catch {
            message.error("Error al cargar clientes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarClientes();
    }, []);

    const abrirModal = (cliente?: ICliente) => {
        if (cliente) {
            setEditingCliente(cliente);
            form.setFieldsValue(cliente);
        } else {
            setEditingCliente(null);
            form.resetFields();
        }

        setVisible(true);
    };

    const guardarCliente = async () => {
        try {
            const values = await form.validateFields();

            if (editingCliente?.id) {
                await api.put(`/Clientes/${editingCliente.id}`, values);
                message.success("Cliente actualizado correctamente");
            } else {
                await api.post("/Clientes", values);
                message.success("Cliente agregado correctamente");
            }

            setVisible(false);
            setEditingCliente(null);
            form.resetFields();
            cargarClientes();
        } catch {
            message.error("No se pudo guardar el cliente");
        }
    };

    const eliminarCliente = async (id: number) => {
        try {
            await api.delete(`/Clientes/${id}`);
            message.success("Cliente eliminado correctamente");
            cargarClientes();
        } catch {
            message.error("No se pudo eliminar el cliente");
        }
    };

    return (
        <div className="page-shell p-3 md:p-6 min-h-full">
            <div className="page-hero">
                <p className="hero-kicker">Relacion Comercial</p>
                <Title level={3} style={{ color: "#fff9f5", marginBottom: 0 }}>
                    Gestión de Clientes
                </Title>
                <p className="page-subtle" style={{ marginTop: 8 }}>
                    Administra la cartera de clientes para registrar ventas con datos más completos.
                </p>
            </div>

            <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
                <Title level={4} style={{ margin: 0 }}>Listado de Clientes</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => abrirModal()} className="brand-button">
                    Nuevo cliente
                </Button>
            </div>

            <div className="table-scroll">
                <Table
                    loading={loading}
                    dataSource={clientes}
                    rowKey="id"
                    pagination={{ pageSize: 6 }}
                    bordered
                    className="panel-soft"
                    scroll={{ x: 760 }}
                    columns={[
                        { title: "Nombre", dataIndex: "nombre" },
                        { title: "Dirección", dataIndex: "direccion", render: (value) => value || "-" },
                        { title: "Teléfono", dataIndex: "telefono", render: (value) => value || "-" },
                        {
                            title: "Acciones",
                            align: "center",
                            render: (_, record) => (
                                <Space>
                                    <Button icon={<EditOutlined />} onClick={() => abrirModal(record)}>
                                        Editar
                                    </Button>
                                    <Popconfirm
                                        title="¿Eliminar cliente?"
                                        okText="Sí"
                                        cancelText="No"
                                        onConfirm={() => eliminarCliente(record.id!)}
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
            </div>

            <Modal
                title={editingCliente ? "Editar cliente" : "Registrar nuevo cliente"}
                open={visible}
                onCancel={() => {
                    setVisible(false);
                    setEditingCliente(null);
                    form.resetFields();
                }}
                onOk={guardarCliente}
                okText="Guardar"
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="nombre"
                        label="Nombre"
                        rules={[{ required: true, message: "Ingresa el nombre del cliente" }]}
                    >
                        <Input placeholder="Ejemplo: Juan Pérez" />
                    </Form.Item>
                    <Form.Item name="direccion" label="Dirección">
                        <Input placeholder="Dirección del cliente" />
                    </Form.Item>
                    <Form.Item name="telefono" label="Teléfono">
                        <Input placeholder="Ejemplo: 8888-8888" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
