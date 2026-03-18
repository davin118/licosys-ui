import { Alert, Card, Empty, Space, Table } from "antd";
import type { TableProps } from "antd";
import type { ReactNode } from "react";
import ExportButtons from "../ExportButtons";

interface ReportTableCardProps<T extends object> {
    columns: TableProps<T>["columns"];
    data: T[];
    emptyDescription: string;
    error: string | null;
    exportColumns: string[];
    exportRows: Array<Array<string | number>>;
    fileName: string;
    loading: boolean;
    rowKey: TableProps<T>["rowKey"];
    summary?: ReactNode;
    toolbar?: ReactNode;
}

export default function ReportTableCard<T extends object>({
    columns,
    data,
    emptyDescription,
    error,
    exportColumns,
    exportRows,
    fileName,
    loading,
    rowKey,
    summary,
    toolbar,
}: ReportTableCardProps<T>) {
    return (
        <Card className="panel-soft" bordered={false}>
            <Space
                direction="vertical"
                size="middle"
                style={{ display: "flex", width: "100%" }}
            >
                {toolbar}
                {summary}

                <ExportButtons
                    data={data}
                    fileName={fileName}
                    columns={exportColumns}
                    rows={exportRows}
                />

                {error ? <Alert type="error" message={error} showIcon /> : null}

                <div className="table-scroll">
                    <Table<T>
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                        locale={{
                            emptyText: loading ? "Cargando..." : <Empty description={emptyDescription} />,
                        }}
                        rowKey={rowKey}
                        scroll={{ x: 720 }}
                    />
                </div>
            </Space>
        </Card>
    );
}
