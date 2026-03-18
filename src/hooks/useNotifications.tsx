import { BellOutlined } from "@ant-design/icons";
import { notification } from "antd";
import * as signalR from "@microsoft/signalr";
import { useEffect, useMemo, useState } from "react";
import api, { API_ORIGIN } from "../api/api";
import { getToken } from "../utils/auth";

export interface NotificacionItem {
    id: string;
    tipo: string;
    titulo: string;
    mensaje: string;
    fecha: string;
    leida: boolean;
}

type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected";

const MAX_NOTIFICACIONES = 20;

export function useNotifications(enabled: boolean) {
    const [notificationApi, contextHolder] = notification.useNotification();
    const [items, setItems] = useState<NotificacionItem[]>([]);
    const [status, setStatus] = useState<ConnectionStatus>("idle");

    useEffect(() => {
        if (!enabled) {
            setItems([]);
            setStatus("idle");
            return;
        }

        let mounted = true;
        setStatus("connecting");

        const loadInitialNotifications = async () => {
            try {
                const res = await api.get("/Notificaciones");
                if (!mounted) {
                    return;
                }

                const initialItems = (res.data as Omit<NotificacionItem, "leida">[]).map((item) => ({
                    ...item,
                    leida: false,
                }));

                setItems(initialItems.slice(0, MAX_NOTIFICACIONES));
            } catch (error) {
                console.error("Error al cargar notificaciones iniciales", error);
            }
        };

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_ORIGIN}/hubs/notificaciones`, {
                accessTokenFactory: () => getToken() ?? "",
            })
            .withAutomaticReconnect()
            .build();

        connection.onreconnecting(() => {
            if (mounted) {
                setStatus("connecting");
            }
        });

        connection.onreconnected(() => {
            if (mounted) {
                setStatus("connected");
            }
        });

        connection.onclose(() => {
            if (mounted) {
                setStatus("disconnected");
            }
        });

        connection.on("RecibirNotificacion", (data: Omit<NotificacionItem, "leida">) => {
            if (!mounted) {
                return;
            }

            setItems((prev) => {
                const nextItem: NotificacionItem = { ...data, leida: false };
                const filtered = prev.filter((item) => item.id !== data.id);
                return [nextItem, ...filtered].slice(0, MAX_NOTIFICACIONES);
            });

            notificationApi.open({
                key: data.id,
                message: data.titulo,
                description: data.mensaje,
                duration: 6,
                icon: <BellOutlined style={{ color: "#1677ff" }} />,
            });
        });

        void loadInitialNotifications();

        connection
            .start()
            .then(() => {
                if (mounted) {
                    setStatus("connected");
                }
            })
            .catch((error) => {
                console.error("Error al conectar con SignalR", error);
                if (mounted) {
                    setStatus("disconnected");
                }
            });

        return () => {
            mounted = false;
            connection.off("RecibirNotificacion");
            void connection.stop();
        };
    }, [enabled, notificationApi]);

    const unreadCount = useMemo(
        () => items.filter((item) => !item.leida).length,
        [items]
    );

    const markAllAsRead = () => {
        setItems((prev) => prev.map((item) => ({ ...item, leida: true })));
    };

    const clearAll = () => {
        setItems([]);
    };

    return {
        contextHolder,
        items,
        status,
        unreadCount,
        markAllAsRead,
        clearAll,
    };
}
