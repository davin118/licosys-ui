import { useEffect, useState } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Tag,
    message,
    Popconfirm,
    Space,
    Typography,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    KeyOutlined,
    CopyOutlined,
} from "@ant-design/icons";
import api from "../../api/api";
import type { IUsuario } from "../../interfaces/IUsuario";

const { Text } = Typography;

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
    const [visible, setVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<IUsuario | null>(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm<IUsuario>();
    const [modalPassword, setModalPassword] = useState(false);
    const [passwordForm] = Form.useForm();
    const [passwordTemporal, setPasswordTemporal] = useState<string | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // 🔹 Cargar lista de usuarios
    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const res = await api.get("/Usuarios");
            setUsuarios(res.data);
        } catch {
            message.error("Error al cargar los usuarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    // 🔹 Abrir modal de creación o edición
    const abrirModal = (user?: IUsuario) => {
        if (user) {
            setEditingUser(user);
            form.setFieldsValue(user);
        } else {
            setEditingUser(null);
            form.resetFields();
        }
        setVisible(true);
    };

    // 🔹 Guardar usuario (crear o actualizar)
    const guardarUsuario = async () => {
        try {
            const values = await form.validateFields();

            if (editingUser) {
                // Actualizar usuario existente
                await api.put(`/Usuarios/${editingUser.id}/actualizar`, values);
                message.success("Usuario actualizado correctamente");
            } else {
                // Crear nuevo usuario
                const res = await api.post("/Usuarios/crear", values);
                setPasswordTemporal(res.data.passwordTemporal);
                setShowPasswordModal(true);
            }

            setVisible(false);
            cargarUsuarios();
        } catch {
            message.error("Error al guardar usuario");
        }
    };

    // 🔹 Eliminar usuario
    const eliminarUsuario = async (id: string) => {
        try {
            await api.delete(`/Usuarios/${id}`);
            message.success("Usuario eliminado correctamente");
            cargarUsuarios();
        } catch {
            message.error("Error al eliminar usuario");
        }
    };

    // 🔹 Cambiar contraseña de usuario
    const cambiarPassword = async (values: any) => {
        try {
            setLoading(true);
            await api.post("/Auth/cambiar-password", values);
            message.success("Contraseña actualizada correctamente 🔒");
            setModalPassword(false);
            passwordForm.resetFields();
        } catch {
            message.error("No se pudo cambiar la contraseña");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Copiar contraseña al portapapeles
    const copiarPassword = async () => {
        if (passwordTemporal) {
            await navigator.clipboard.writeText(passwordTemporal);
            message.success("Contraseña copiada al portapapeles 📋");
        }
    };

    return (
        <div>
            <div
                style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}
            >
                <h2 style={{ color: "#1677ff", fontWeight: 600 }}>Gestión de Usuarios</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => abrirModal()}
                >
                    Nuevo Usuario
                </Button>
            </div>

            <Table
                loading={loading}
                dataSource={usuarios}
                rowKey="id"
                pagination={{ pageSize: 6 }}
                bordered
                columns={[
                    { title: "Correo", dataIndex: "email" },
                    { title: "Usuario", dataIndex: "userName" },
                    {
                        title: "Rol",
                        dataIndex: "rol",
                        render: (rol: string) => (
                            <Tag color={rol === "Administrador" ? "blue" : "green"}>
                                {rol || "Sin rol"}
                            </Tag>
                        ),
                    },
                    {
                        title: "Activo",
                        dataIndex: "activo",
                        render: (activo: boolean) => (
                            <Tag color={activo ? "green" : "red"}>
                                {activo ? "Sí" : "No"}
                            </Tag>
                        ),
                    },
                    {
                        title: "Acciones",
                        align: "center",
                        render: (_, record) => (
                            <Space>
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={() => abrirModal(record)}
                                >
                                    Editar
                                </Button>

                                <Button
                                    icon={<KeyOutlined />}
                                    onClick={() => setModalPassword(true)}
                                >
                                    Cambiar contraseña
                                </Button>

                                <Popconfirm
                                    title="¿Eliminar usuario?"
                                    okText="Sí"
                                    cancelText="No"
                                    onConfirm={() => eliminarUsuario(record.id!)}
                                >
                                    <Button danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            </Space>
                        ),
                    },
                ]}
            />

            {/* 🧾 Modal para crear/editar usuario */}
            <Modal
                title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                open={visible}
                onCancel={() => setVisible(false)}
                onOk={guardarUsuario}
                okText="Guardar"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="email"
                        label="Correo electrónico"
                        rules={[{ required: true, type: "email" }]}
                    >
                        <Input placeholder="ejemplo@pharmasys.com" />
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item name="password" label="Contraseña (opcional)">
                            <Input.Password placeholder="Si la dejas vacía, se generará una automática" />
                        </Form.Item>
                    )}

                    <Form.Item name="rol" label="Rol" rules={[{ required: true }]}>
                        <Select placeholder="Seleccione un rol">
                            <Select.Option value="Administrador">Administrador</Select.Option>
                            <Select.Option value="Vendedor">Vendedor</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="nombreCompleto" label="Nombre completo">
                        <Input placeholder="Ej: Juan Pérez" />
                    </Form.Item>

                    <Form.Item name="cargo" label="Cargo o puesto">
                        <Input placeholder="Ej: Encargado de ventas" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 🔐 Modal para cambiar contraseña */}
            <Modal
                title="Cambiar contraseña"
                open={modalPassword}
                onCancel={() => setModalPassword(false)}
                onOk={() => passwordForm.submit()}
                okText="Guardar"
                cancelText="Cancelar"
                confirmLoading={loading}
            >
                <Form layout="vertical" form={passwordForm} onFinish={cambiarPassword}>
                    <Form.Item
                        label="Correo del usuario"
                        name="email"
                        rules={[{ required: true, type: "email" }]}
                    >
                        <Input placeholder="usuario@pharmasys.com" />
                    </Form.Item>

                    <Form.Item
                        label="Contraseña actual"
                        name="contraseñaActual"
                        rules={[{ required: true }]}
                    >
                        <Input.Password placeholder="********" />
                    </Form.Item>

                    <Form.Item
                        label="Nueva contraseña"
                        name="nuevaContraseña"
                        rules={[{ required: true, min: 6 }]}
                    >
                        <Input.Password placeholder="********" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 🔑 Modal de contraseña temporal */}
            <Modal
                title="Usuario creado correctamente 🎉"
                open={showPasswordModal}
                onCancel={() => setShowPasswordModal(false)}
                footer={[
                    <Button key="copy" icon={<CopyOutlined />} onClick={copiarPassword}>
                        Copiar contraseña
                    </Button>,
                    <Button key="ok" type="primary" onClick={() => setShowPasswordModal(false)}>
                        Entendido
                    </Button>,
                ]}
            >
                <p>Se ha creado el usuario exitosamente. Aquí está la contraseña temporal:</p>
                <div
                    style={{
                        backgroundColor: "#f0f5ff",
                        padding: 12,
                        borderRadius: 6,
                        textAlign: "center",
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#1677ff",
                        marginBottom: 10,
                    }}
                >
                    {passwordTemporal}
                </div>
                <Text type="secondary">
                    El usuario deberá cambiar su contraseña al iniciar sesión por primera vez.
                </Text>
            </Modal>
        </div>
    );
}
