import axios from "axios";
import { useCallback, useEffect, useState } from "react";

interface UseReportLoaderOptions {
    immediate?: boolean;
}

export function useReportLoader<T>(
    fetcher: () => Promise<T[]>,
    options: UseReportLoaderOptions = {}
) {
    const { immediate = true } = options;
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetcher();
            setData(result);
        } catch (err) {
            console.error("Error al cargar reporte", err);
            if (axios.isAxiosError(err)) {
                const responseMessage =
                    typeof err.response?.data?.mensaje === "string"
                        ? err.response.data.mensaje
                        : typeof err.response?.data?.error === "string"
                            ? err.response.data.error
                            : null;

                setError(responseMessage ?? err.message ?? "No se pudo cargar el reporte. Intenta nuevamente.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("No se pudo cargar el reporte. Intenta nuevamente.");
            }
        } finally {
            setLoading(false);
        }
    }, [fetcher]);

    useEffect(() => {
        if (!immediate) {
            setLoading(false);
            return;
        }

        load();
    }, [immediate, load]);

    return {
        data,
        error,
        loading,
        setData,
        reload: load,
    };
}
