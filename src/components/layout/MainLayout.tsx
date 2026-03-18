import { Layout, Menu, Avatar, Dropdown, Badge, Button, Grid, Empty, Space, Tag, Typography, type MenuProps } from "antd";
import {
    ShopOutlined,
    UserOutlined,
    TeamOutlined,
    LogoutOutlined,
    AppstoreAddOutlined,
    IdcardOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    ContactsOutlined,
    BellOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    DatabaseOutlined,
    BarChartOutlined,
    CheckOutlined,
    ClearOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { clearToken, getUserFromToken } from "../../utils/auth";
import { useEffect, useMemo, useState } from "react";
import { useNotifications } from "../../hooks/useNotifications";

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getUserFromToken();
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.lg;

    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        setCollapsed(isMobile);
    }, [isMobile]);

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

    const role = user?.role;
    const canAccess = (roles?: string[]) => !roles || (!!role && roles.includes(role));
    const canUseNotifications = canAccess(["Administrador", "Vendedor"]);
    const { contextHolder, items, status, unreadCount, markAllAsRead, clearAll } = useNotifications(canUseNotifications);

    const notificationStatusTag = useMemo(() => {
        if (status === "connected") {
            return <Tag color="green">En línea</Tag>;
        }

        if (status === "connecting") {
            return <Tag color="blue">Conectando</Tag>;
        }

        if (status === "disconnected") {
            return <Tag color="red">Sin conexión</Tag>;
        }

        return <Tag>Inactivo</Tag>;
    }, [status]);

    const menuItems: NonNullable<MenuProps["items"]> = [
        { key: "", icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
    ];

    if (canAccess(["Administrador", "Vendedor"])) {
        menuItems.push({ key: "productos", icon: <ShopOutlined />, label: <Link to="/productos">Productos</Link> });
    }

    if (canAccess(["Administrador"])) {
        menuItems.push({ key: "categorias", icon: <AppstoreAddOutlined />, label: <Link to="/categorias">Categorías</Link> });
        menuItems.push({ key: "proveedores", icon: <TeamOutlined />, label: <Link to="/proveedores">Proveedores</Link> });
        menuItems.push({ key: "compras", icon: <ShoppingOutlined />, label: <Link to="/compras">Compras</Link> });
        menuItems.push({ key: "usuarios", icon: <UserOutlined />, label: <Link to="/usuarios">Usuarios</Link> });
        menuItems.push({ key: "backup", icon: <DatabaseOutlined />, label: <Link to="/backup">Copia de seguridad</Link> });
    }

    if (canAccess(["Administrador", "Vendedor"])) {
        menuItems.push({ key: "clientes", icon: <ContactsOutlined />, label: <Link to="/clientes">Clientes</Link> });
        menuItems.push({ key: "ventas", icon: <ShoppingCartOutlined />, label: <Link to="/ventas">Ventas</Link> });
        menuItems.push({ key: "ventas-pos", icon: <ShoppingCartOutlined />, label: <Link to="/ventas-pos">POS</Link> });
    }

    if (canAccess(["Administrador", "Consulta"])) {
        menuItems.push({ key: "reportes", icon: <BarChartOutlined />, label: <Link to="/reportes">Reportes</Link> });
    }

    return (
        <Layout style={{ minHeight: "100vh", width: "100%" }}>
            {contextHolder}
            {/* Sidebar */}
            <Sider
                width={230}
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                collapsedWidth={isMobile ? 0 : 80}
                trigger={null}
                theme="light"
                style={{
                    background: "linear-gradient(180deg, #f8fbff 0%, #eff6ff 100%)",
                    borderRight: "1px solid rgba(59, 91, 148, 0.12)",
                    boxShadow: "10px 0 30px rgba(29, 78, 216, 0.08)",
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
                        color: "#163ea8",
                        borderBottom: "1px solid rgba(59, 91, 148, 0.12)",
                        background: "linear-gradient(135deg, rgba(29, 78, 216, 0.08), rgba(14, 165, 233, 0.08))",
                    }}
                >
                    🍷 {!collapsed && "LicoSys"}
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[currentPath]}
                    style={{ border: "none", marginTop: 10, background: "transparent" }}
                    items={menuItems}
                />
            </Sider>

            {isMobile && !collapsed && (
                <div
                    onClick={() => setCollapsed(true)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(15, 23, 42, 0.35)",
                        zIndex: 999,
                    }}
                />
            )}

            {/* Contenido */}
            <Layout
                style={{
                    marginLeft: isMobile ? 0 : collapsed ? 80 : 230,
                    transition: "margin-left 0.3s",
                    minHeight: "100vh",
                    width: "100%",
                }}
            >
                {/* Header fijo */}
                <Header
                    style={{
                        background: "rgba(248, 251, 255, 0.92)",
                        padding: isMobile ? "0 12px" : "0 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        borderBottom: "1px solid rgba(59, 91, 148, 0.12)",
                        backdropFilter: "blur(10px)",
                        position: "sticky",
                        top: 0,
                        zIndex: 999,
                    }}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: 18 }}
                        />
                        <h3
                            style={{
                                margin: 0,
                                color: "#163ea8",
                                fontWeight: 600,
                                fontSize: isMobile ? 16 : 18,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            Panel de Control
                        </h3>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* 🔔 Notificaciones */}
                        {canUseNotifications ? (
                            <Dropdown
                                trigger={["click"]}
                                onOpenChange={(open) => {
                                    if (open) {
                                        markAllAsRead();
                                    }
                                }}
                                dropdownRender={() => (
                                    <div style={{ padding: 12, width: 340 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                            <Space>
                                                <Text strong>Notificaciones</Text>
                                                {notificationStatusTag}
                                            </Space>
                                            <Space size="small">
                                                <Button type="text" size="small" icon={<CheckOutlined />} onClick={markAllAsRead}>
                                                    Leídas
                                                </Button>
                                                <Button type="text" size="small" icon={<ClearOutlined />} onClick={clearAll}>
                                                    Limpiar
                                                </Button>
                                            </Space>
                                        </div>

                                        {items.length === 0 ? (
                                            <Empty
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                description="No hay alertas activas."
                                            />
                                        ) : (
                                            <Space direction="vertical" size="small" style={{ display: "flex", maxHeight: 360, overflowY: "auto" }}>
                                                {items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        style={{
                                                            padding: 10,
                                                            borderRadius: 12,
                                                            border: item.leida ? "1px solid rgba(59, 91, 148, 0.12)" : "1px solid rgba(22, 119, 255, 0.2)",
                                                            background: item.leida ? "rgba(255,255,255,0.75)" : "rgba(240, 247, 255, 0.95)",
                                                        }}
                                                    >
                                                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                                                            <Text strong>{item.titulo}</Text>
                                                            <Tag color={item.tipo === "sin-stock" || item.tipo === "vencido" ? "red" : "gold"}>
                                                                {item.tipo.replace("-", " ")}
                                                            </Tag>
                                                        </div>
                                                        <Text style={{ display: "block", color: "var(--text-muted)" }}>
                                                            {item.mensaje}
                                                        </Text>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {item.fecha}
                                                        </Text>
                                                    </div>
                                                ))}
                                            </Space>
                                        )}
                                    </div>
                                )}
                            >
                                <Badge count={unreadCount} overflowCount={9}>
                                    <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />
                                </Badge>
                            </Dropdown>
                        ) : null}

                        {/* 👤 Usuario */}
                        <Dropdown menu={userMenu} placement="bottomRight">
                            <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1677ff" }} />
                                {!collapsed && !isMobile && (
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
                        margin: isMobile ? "12px" : "20px",
                        padding: isMobile ? "16px" : "24px",
                        minHeight: isMobile ? "calc(100vh - 88px)" : "calc(100vh - 110px)",
                        background: "transparent",
                        borderRadius: 8,
                        overflowX: "hidden",
                    }}
                    className="app-content-shell"
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
