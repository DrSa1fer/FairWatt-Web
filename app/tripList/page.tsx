"use client";

import { Button, Layout, Typography, Spin, Alert } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { withAuth } from "../hocs/withAuth";
import { useEffect, useState } from "react";

const { Title } = Typography;

// Константы для API
const IS_DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
const API_HOST = process.env.NEXT_PUBLIC_API_HOST || 'http://10.8.0.99:8000';

// Тестовые данные (используются только в режиме отладки)
const TEST_DATA: Trip[] = [

];

function TripListPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const fetchTrips = async (page = 1, perPage = 10) => {
        if (IS_DEBUG_MODE) {
            setTrips(TEST_DATA);
            setPagination(prev => ({
                ...prev,
                total: TEST_DATA.length
            }));
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${API_HOST}/api/v1/trips?page=${page}&per_page=${perPage}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: Trip[] = await response.json();
            setTrips(data);
            setPagination(prev => ({
                ...prev,
                total: data.length
            }));
        } catch (err: any) {
            console.error("Failed to fetch meters:", err);
            setError(err.message || "Не удалось загрузить данные");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips(pagination.current, pagination.pageSize);
    }, [pagination.current, pagination.pageSize]);

    const handleTableChange = (pagination: any) => {
        setPagination(pagination);
    };

    if (loading && !trips.length) {
        return (
            <Layout style={{ padding: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Spin size="large" />
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout style={{ padding: 20 }}>
                <Alert
                    message="Ошибка загрузки данных"
                    description={error}
                    type="error"
                    showIcon
                    closable
                />
            </Layout>
        );
    }

    return (
        <Layout style={{ padding: 20, background: "transparent" }}>
            <Title level={3} style={{ color: "white", textAlign: "center" }}><b>Список выездов</b></Title>
            <br />
            {/* <TripsTable
                pagination={pagination}
                onTableChange={handleTableChange}
                loading={loading}
            /> */}
        </Layout>
    );
}

export default withAuth(TripListPage);