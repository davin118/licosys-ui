import { useEffect, useState } from "react";
import { Card, Avatar, Typography, Button, Form, Input, message } from "antd";
import { UserOutlined, MailOutlined, CrownOutlined } from "@ant-design/icons";
import { clearToken, getUserFromToken } from "../../utils/auth";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";
import type { IUsuario } from "../../interfaces/IUsuario";

const { Title, Text } = Typography;

export default function PerfilUsuario() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const user = getUserFromToken();
    const [profile, setProfile] = useState<IUsuario | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;

        async function cargarPerfil() {
            try {
                const res = await api.get("/Usuarios/me");
                if (!active) {
                    return;
                }

                const currentProfile: IUsuario = {
                    id: res.data.id,
                    email: res.data.email,
                    userName: res.data.userName,
                    rol: res.data.rol,
                    activo: res.data.activo,
                    debeCambiarPassword: res.data.debeCambiarPassword,
                    nombreCompleto: res.data.nombreCompleto,
                    cargo: res.data.cargo,
                    fechaRegistro: res.data.fechaRegistro,
                };

                setProfile(currentProfile);
                form.setFieldsValue({
                    nombreCompleto: currentProfile.nombreCompleto,
                    email: currentProfile.email,
                    role: currentProfile.rol,
                    cargo: currentProfile.cargo,
                });
            } catch {
                if (active) {
                    message.error("No se pudo cargar el perfil");
                }
            }
        }

        if (user) {
            cargarPerfil();
        }

        return () => {
            active = false;
        };
    }, [user, form]);

    const actualizarPerfil = async (values: {
        email: string;
        nombreCompleto?: string;
        cargo?: string;
    }) => {
        try {
            setLoading(true);
            await api.put(`/Usuarios/${profile?.id ?? user?.id}/actualizar`, {
                email: values.email,
                nombreCompleto: values.nombreCompleto,
                cargo: values.cargo,
            });
            setProfile((current) => current ? {
                ...current,
                nombreCompleto: values.nombreCompleto,
                cargo: values.cargo,
            } : current);
            message.success("Perfil actualizado correctamente");
        } catch {
            message.error("No se pudo actualizar el perfil");
        } finally {
            setLoading(false);
        }
    };

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
                        {profile?.nombreCompleto || user?.name || "Usuario"}
                    </Title>
                    <Text type="secondary">
                        <CrownOutlined /> {profile?.rol || user?.role || "Invitado"}
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

                    <Form.Item label="Cargo" name="cargo">
                        <Input prefix={<CrownOutlined />} placeholder="Tu cargo o puesto" />
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
            </Card>
        </div>
    );
}
