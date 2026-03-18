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
    KeyOutlined,
    CopyOutlined,
    StopOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import api from "../../api/api";
import type { IUsuario } from "../../interfaces/IUsuario";

const { Text } = Typography;

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
    const [visible, setVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<IUsuario | null>(null);
    const [selectedUserForReset, setSelectedUserForReset] = useState<IUsuario | null>(null);
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

    // 🔹 Activar / desactivar usuario
    const cambiarEstadoUsuario = async (usuario: IUsuario) => {
        try {
            await api.put(`/Usuarios/${usuario.id}/activar`);
            message.success(usuario.activo ? "Usuario desactivado correctamente" : "Usuario activado correctamente");
            cargarUsuarios();
        } catch {
            message.error("Error al actualizar el estado del usuario");
        }
    };

    // 🔹 Restablecer contraseña de usuario y generar temporal
    const restablecerPassword = async () => {
        try {
            setLoading(true);
            if (!selectedUserForReset?.id) {
                message.error("Selecciona un usuario válido para restablecer la contraseña");
                return;
            }

            const values = await passwordForm.validateFields();
            const res = await api.put(
                `/Usuarios/${selectedUserForReset.id}/restablecer-contraseña`,
                {
                    nuevaContraseña: values.nuevaContraseña?.trim() || undefined,
                }
            );

            setPasswordTemporal(res.data.nuevaContraseña);
            setShowPasswordModal(true);
            setModalPassword(false);
            passwordForm.resetFields();
            setSelectedUserForReset(null);
            message.success("Contraseña restablecida correctamente");
        } catch {
            message.error("No se pudo restablecer la contraseña");
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
                                    onClick={() => {
                                        setSelectedUserForReset(record);
                                        passwordForm.resetFields();
                                        setModalPassword(true);
                                    }}
                                >
                                    Reset clave
                                </Button>

                                <Popconfirm
                                    title={record.activo ? "¿Desactivar usuario?" : "¿Activar usuario?"}
                                    description={
                                        record.activo
                                            ? "El usuario ya no podrá iniciar sesión hasta ser activado nuevamente."
                                            : "El usuario podrá volver a ingresar al sistema."
                                    }
                                    okText={record.activo ? "Desactivar" : "Activar"}
                                    cancelText="Cancelar"
                                    onConfirm={() => cambiarEstadoUsuario(record)}
                                >
                                    <Button
                                        danger={record.activo}
                                        icon={record.activo ? <StopOutlined /> : <CheckCircleOutlined />}
                                    >
                                        {record.activo ? "Desactivar" : "Activar"}
                                    </Button>
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
                        <Input placeholder="ejemplo@licosys.com" />
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
                        <Select.Option value="Consulta">Consulta</Select.Option>
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

            {/* 🔐 Modal para restablecer contraseña */}
            <Modal
                title="Restablecer contraseña"
                open={modalPassword}
                onCancel={() => {
                    setModalPassword(false);
                    setSelectedUserForReset(null);
                }}
                onOk={restablecerPassword}
                okText="Restablecer"
                cancelText="Cancelar"
                confirmLoading={loading}
            >
                <Form layout="vertical" form={passwordForm}>
                    <Form.Item label="Usuario">
                        <Input value={selectedUserForReset?.email} disabled />
                    </Form.Item>
                    <Form.Item
                        label="Contraseña temporal"
                        name="nuevaContraseña"
                        extra="Déjala vacía para que el sistema genere una automáticamente."
                        rules={[{ min: 6, message: "La contraseña debe tener al menos 6 caracteres." }]}
                    >
                        <Input.Password placeholder="Temporal opcional" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 🔑 Modal de contraseña temporal */}
            <Modal
                title="Contraseña temporal"
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
                <p>Aquí está la contraseña temporal generada para el usuario:</p>
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
