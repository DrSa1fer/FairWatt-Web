"use client";

import { useState } from "react";
import { Layout, Space, Typography, DatePicker } from "antd";
import '@ant-design/v5-patch-for-react-19';

import { ConsumptionChart } from "../components/consumptionChart";
import '../styles/PriceChart.css';
import dayjs, { Dayjs } from "dayjs";
import { withAuth } from "../hocs/withAuth";

const { Title } = Typography;
const { RangePicker } = DatePicker;

function ConsumptionChartPage() {
    const today = dayjs(); // сегодняшняя дата
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
        today.subtract(7, "day"),
        today.add(7, "day")
    ]);

    const onDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates) {
            setDateRange(dates);
        }
    };

    return (
        <Layout style={{ background: "transparent", minHeight: "100vh", padding: "2rem" }} className="app">
            <Space direction="vertical" size="large" style={{ width: "100%", color: "white" }}>
                <Title level={3} style={{ color: "white", textAlign: "center" }}><b>График потребления</b></Title>
                <Space direction="horizontal" style={{ justifyContent: "center", width: "100%" }}>
                    <RangePicker
                        style={{ backgroundColor: "white", borderRadius: 8 }}
                        value={dateRange}
                        onChange={onDateChange}
                        allowClear={false}
                        format="DD.MM.YYYY"
                        placeholder={['Начальная дата', 'Конечная дата']}
                    />
                </Space>
                {dateRange[0] && dateRange[1] && (
                    <ConsumptionChart
                        meterId={1}
                        startDate={dateRange[0].format("YYYY-MM-DD")}
                        endDate={dateRange[1].format("YYYY-MM-DD")}
                    />
                )}
            </Space>
        </Layout>
    );
}

export default withAuth(ConsumptionChartPage);