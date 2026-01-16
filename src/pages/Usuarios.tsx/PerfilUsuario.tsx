import { useEffect, useState } from "react";
import { Card, Avatar, Typography, Button, Form, Input, message, Modal } from "antd";
import { UserOutlined, MailOutlined, CrownOutlined, LockOutlined } from "@ant-design/icons";
import { getUserFromToken, clearToken } from "../../utils/auth";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function PerfilUsuario() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const user = getUserFromToken();
    const [loading, setLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm] = Form.useForm();

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                nombreCompleto: user.name,
                email: user.email,
                role: user.role,
            });
        }
    }, [user, form]);

    // ✅ Actualizar perfil
    const actualizarPerfil = async (values: any) => {
        try {
            setLoading(true);
            await api.put(`/Usuarios/${user?.id}/actualizar`, {
                email: values.email,
                nombreCompleto: values.nombreCompleto,
                cargo: values.cargo,
            });
            message.success("Perfil actualizado correctamente 🎉");
        } catch {
            message.error("No se pudo actualizar el perfil");
        } finally {
            setLoading(false);
        }
    };

    // 🔐 Cambiar contraseña
    const cambiarPassword = async (values: any) => {
        try {
            setLoading(true);
            await api.post("/Auth/cambiar-password", values);
            message.success("Contraseña actualizada correctamente 🔒");
            setShowPasswordModal(false);
            passwordForm.resetFields();
        } catch {
            message.error("No se pudo cambiar la contraseña");
        } finally {
            setLoading(false);
        }
    };

    // 🚪 Cerrar sesión
    const cerrarSesion = () => {
        clearToken();
        navigate("/login");
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6">
            <Card
                style={{
                    width: 450,
                    borderRadius: 16,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                }}
            >
                <div className="flex flex-col items-center mb-6">
                    <Avatar
                        size={90}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: "#1677ff", marginBottom: 10 }}
                    />
                    <Title level={4} style={{ marginBottom: 0, color: "#1677ff" }}>
                        {user?.name || "Usuario"}
                    </Title>
                    <Text type="secondary">
                        <CrownOutlined /> {user?.role || "Invitado"}
                    </Text>
                </div>

                <Form layout="vertical" form={form} onFinish={actualizarPerfil} disabled={loading}>
                    <Form.Item label="Nombre completo" name="nombreCompleto">
                        <Input prefix={<UserOutlined />} placeholder="Tu nombre" />
                    </Form.Item>

                    <Form.Item label="Correo electrónico" name="email">
                        <Input prefix={<MailOutlined />} disabled />
                    </Form.Item>

                    <Form.Item label="Rol asignado" name="role">
                        <Input prefix={<CrownOutlined />} disabled />
                    </Form.Item>

                    <div className="flex justify-between mt-6">
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Guardar cambios
                        </Button>
                        <Button danger onClick={cerrarSesion}>
                            Cerrar sesión
                        </Button>
                    </div>
                </Form>

                <div className="mt-4 text-center">
                    <Button icon={<LockOutlined />} onClick={() => setShowPasswordModal(true)}>
                        Cambiar contraseña
                    </Button>
                </div>
            </Card>

            {/* Modal de cambio de contraseña */}
            <Modal
                title="Cambiar contraseña"
                open={showPasswordModal}
                onCancel={() => setShowPasswordModal(false)}
                onOk={() => passwordForm.submit()}
                okText="Guardar"
                cancelText="Cancelar"
                confirmLoading={loading}
            >
                <Form layout="vertical" form={passwordForm} onFinish={cambiarPassword}>
                    <Form.Item label="Correo electrónico" name="email" initialValue={user?.email}>
                        <Input disabled />
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
        </div>
    );
}
