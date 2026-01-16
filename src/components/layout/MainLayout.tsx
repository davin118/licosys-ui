import { Layout, Menu, Avatar, Dropdown, Badge, Button, notification } from "antd";
import {
    ShopOutlined,
    UserOutlined,
    TeamOutlined,
    LogoutOutlined,
    AppstoreAddOutlined,
    IdcardOutlined,
    ShoppingCartOutlined,
    BellOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { clearToken, getUserFromToken } from "../../utils/auth";
import * as signalR from "@microsoft/signalr";
import { useEffect, useState } from "react";

const { Sider, Content, Header } = Layout;

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getUserFromToken();

    const [collapsed, setCollapsed] = useState(false);
    const [notificaciones, setNotificaciones] = useState<any[]>([]);

    // ✅ Conexión a SignalR (notificaciones en tiempo real)
    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7107/hubs/notificaciones", { withCredentials: true })
            .withAutomaticReconnect()
            .build();

        connection.start()
            .then(() => console.log("✅ Conectado al servidor de notificaciones"))
            .catch(err => console.error("❌ Error al conectar con SignalR:", err));

        connection.on("RecibirNotificacion", (data) => {
            setNotificaciones(prev => [data, ...prev]);

            notification.open({
                message: data.Titulo,
                description: data.Mensaje,
                duration: 6,
                icon: <BellOutlined style={{ color: "#1677ff" }} />,
            });
        });

        return () => {
            connection.stop();
        };
    }, []);

    // ✅ Cerrar sesión
    const logout = () => {
        clearToken();
        navigate("/login");
    };

    // ✅ Menú de usuario
    const userMenu = {
        items: [
            {
                key: "perfil",
                label: "Mi perfil",
                icon: <IdcardOutlined />,
                onClick: () => navigate("/perfil"),
            },
            {
                key: "logout",
                label: "Cerrar sesión",
                icon: <LogoutOutlined />,
                onClick: logout,
            },
        ],
    };

    // ✅ Determinar la ruta activa
    const currentPath = location.pathname.startsWith("/")
        ? location.pathname.split("/")[1] || ""
        : "";

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Sidebar */}
            <Sider
                width={230}
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                theme="light"
                style={{
                    boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
                    position: "fixed",
                    height: "100vh",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 1000,
                }}
            >
                <div
                    style={{
                        height: 64,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: collapsed ? 20 : 18,
                        color: "#1677ff",
                        borderBottom: "1px solid #f0f0f0",
                    }}
                >
                    💊 {!collapsed && "PharmaSys"}
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[currentPath]}
                    style={{ border: "none", marginTop: 10 }}
                    items={[
                        { key: "", icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
                        { key: "productos", icon: <ShopOutlined />, label: <Link to="/productos">Productos</Link> },
                        { key: "categorias", icon: <AppstoreAddOutlined />, label: <Link to="/categorias">Categorías</Link> },
                        { key: "proveedores", icon: <TeamOutlined />, label: <Link to="/proveedores">Proveedores</Link> },
                        { key: "ventas", icon: <ShoppingCartOutlined />, label: <Link to="/ventas">Ventas</Link> },
                        { key: "ventas-pos", icon: <ShoppingCartOutlined />, label: <Link to="/ventas-pos">POS</Link> },
                        { key: "usuarios", icon: <UserOutlined />, label: <Link to="/usuarios">Usuarios</Link> },
                    ]}
                />
            </Sider>

            {/* Contenido */}
            <Layout
                style={{
                    marginLeft: collapsed ? 80 : 230,
                    transition: "margin-left 0.3s",
                    minHeight: "100vh",
                }}
            >
                {/* Header fijo */}
                <Header
                    style={{
                        background: "#fff",
                        padding: "0 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid #f0f0f0",
                        position: "sticky",
                        top: 0,
                        zIndex: 999,
                    }}
                >
                    <div className="flex items-center gap-3">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: 18 }}
                        />
                        <h3 style={{ margin: 0, color: "#1677ff", fontWeight: 600 }}>Panel de Control</h3>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* 🔔 Notificaciones */}
                        <Dropdown
                            trigger={["click"]}
                            dropdownRender={() => (
                                <div style={{ padding: 10, width: 300 }}>
                                    <h4 style={{ marginBottom: 8 }}>🔔 Notificaciones</h4>
                                    {notificaciones.length === 0 ? (
                                        <p style={{ color: "#999" }}>No hay notificaciones recientes</p>
                                    ) : (
                                        notificaciones.slice(0, 5).map((n, i) => (
                                            <div key={i} style={{ marginBottom: 8, borderBottom: "1px solid #f0f0f0" }}>
                                                <p style={{ margin: 0, fontWeight: 500 }}>{n.Titulo}</p>
                                                <p style={{ margin: 0, fontSize: 13, color: "#555" }}>{n.Mensaje}</p>
                                                <span style={{ fontSize: 12, color: "#999" }}>{n.Fecha}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        >
                            <Badge count={notificaciones.length} overflowCount={9}>
                                <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />
                            </Badge>
                        </Dropdown>

                        {/* 👤 Usuario */}
                        <Dropdown menu={userMenu} placement="bottomRight">
                            <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1677ff" }} />
                                {!collapsed && (
                                    <span style={{ marginLeft: 8, fontWeight: 500 }}>
                                        {user?.name || user?.email || "Usuario"}
                                    </span>
                                )}
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                {/* Contenido dinámico */}
                <Content
                    style={{
                        margin: "20px",
                        padding: "24px",
                        minHeight: "calc(100vh - 110px)",
                        background: "#fff",
                        borderRadius: 8,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
