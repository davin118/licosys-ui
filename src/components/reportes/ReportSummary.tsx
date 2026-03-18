import { Card, Col, Row, Statistic } from "antd";

interface SummaryItem {
    label: string;
    value: number | string;
    precision?: number;
    prefix?: string;
    suffix?: string;
}

interface ReportSummaryProps {
    items: SummaryItem[];
}

export default function ReportSummary({ items }: ReportSummaryProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <Row gutter={[12, 12]}>
            {items.map((item) => (
                <Col key={item.label} xs={24} sm={12} lg={8} xl={6}>
                    <Card bordered={false} style={{ background: "rgba(255,255,255,0.78)" }}>
                        <Statistic
                            title={item.label}
                            value={item.value}
                            precision={item.precision}
                            prefix={item.prefix}
                            suffix={item.suffix}
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );
}
