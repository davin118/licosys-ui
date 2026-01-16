import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../../api/api";

interface ICategoria {
    id?: number;
    nombre: string;
}

export default function Categorias() {
    const [categorias, setCategorias] = useState<ICategoria[]>([]);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const cargarCategorias = async () => {
        try {
            setLoading(true);
            const res = await api.get("/Categorias");
            setCategorias(res.data);
            console.log(res.data);
        } catch {
            message.error("Error al cargar categorías");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCategorias();
    }, []);

    const crearCategoria = async () => {
        try {
            const values = await form.validateFields();
            await api.post("/Categorias", values);
            message.success("Categoría agregada correctamente");
            setVisible(false);
            form.resetFields();
            cargarCategorias();
        } catch {
            message.error("Error al crear categoría");
        }
    };

    const eliminarCategoria = async (id: number) => {
        try {
            await api.delete(`/Categorias/${id}`);
            message.success("Categoría eliminada correctamente");
            cargarCategorias();
        } catch {
            message.error("Error al eliminar categoría");
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ color: "#1677ff", fontWeight: 600 }}>Gestión de Categorías</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setVisible(true)}>
                    Nueva Categoría
                </Button>
            </div>

            <Table
                loading={loading}
                dataSource={categorias}
                rowKey="id"
                pagination={{ pageSize: 6 }}
                bordered
                columns={[
                    { title: "Nombre", dataIndex: "nombre" },
                    {
                        title: "Acciones",
                        align: "center",
                        render: (_, record) => (
                            <Space>
                                <Popconfirm
                                    title="¿Eliminar categoría?"
                                    okText="Sí"
                                    cancelText="No"
                                    onConfirm={() => eliminarCategoria(record.id!)}
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
                title="Registrar nueva categoría"
                open={visible}
                onCancel={() => setVisible(false)}
                onOk={crearCategoria}
                okText="Guardar"
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: "Ingrese el nombre de la categoría" }]}>
                        <Input placeholder="Ejemplo: Analgésicos, Antibióticos..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
