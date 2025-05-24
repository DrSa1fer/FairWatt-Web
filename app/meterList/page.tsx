"use client";

import { Button, Layout, Typography, Spin, Alert } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { withAuth } from "../hocs/withAuth";
import { MeterTable } from "../components/meterTable";
import { useEffect, useState } from "react";

const { Title } = Typography;

// Константы для API
const IS_DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
const API_HOST = process.env.NEXT_PUBLIC_API_HOST || 'http://10.8.0.99:8000';

// Тестовые данные (используются только в режиме отладки)
const TEST_DATA: Meter[] = [
    {
        meter_id: 1,
        facility_id: 101,

        rating: 78,
        address: 'Краснодар, ул. Павлова, д. 14',
        meter_details: {
            square: 74,
            facility_type_name: 'Частный дом',
            residents_count: 3,
            rooms_count: 4
        },
        client: {
            name: 'Фомин Сергей Александрович',
        },
        geodata: {
            latitude: 45.0355,
            longitude: 38.9753
        },
        is_first: null,
        verified_status: null
    },
    {
        meter_id: 2,
        facility_id: 102,

        rating: 54,
        address: 'Краснодар, ул. Севастопольская, д. 3, кв. 14',
        meter_details: {
            square: 46,
            facility_type_name: 'Квартира',
            residents_count: 2,
            rooms_count: 2
        },
        client: {
            name: 'Петров Павел Андреевич',
        },
        geodata: {
            latitude: 45.0402,
            longitude: 38.9761
        },
        is_first: null,
        verified_status: null
    },
    {
        meter_id: 3,
        facility_id: 103,
        rating: 84,
        address: 'ст. Ново-Титаровская, ул. Ленина, д. 25',
        meter_details: {
            square: 95,
            facility_type_name: 'Частный дом',
            residents_count: 5,
            rooms_count: 5
        },
        client: {
            name: 'Сидорова Анна Владимировна',
        },
        geodata: {
            latitude: 45.2345,
            longitude: 38.9876
        },
        is_first: null,
        verified_status: null
    },
    {
        meter_id: 4,
        facility_id: 104,

        rating: 62,
        address: 'Архипо-Осиповка, ул. Центральная, д. 7',
        meter_details: {
            square: 68,
            facility_type_name: 'Частный дом',
            residents_count: 4,
            rooms_count: 3
        },
        client: {
            name: 'Ковалев Дмитрий Игоревич',
        },
        geodata: {
            latitude: 44.3654,
            longitude: 38.5367
        },
        is_first: null,
        verified_status: null
    },
    {
        meter_id: 5,
        facility_id: 105,
        rating: 45,
        address: 'Краснодар, ул. Красная, д. 56, кв. 12',
        meter_details: {
            square: 52,
            facility_type_name: 'Квартира',
            residents_count: 2,
            rooms_count: 1
        },
        client: {
            name: 'Иванова Ольга Петровна',
        },
        geodata: {
            latitude: 45.0347,
            longitude: 38.9748
        },
        is_first: null,
        verified_status: null
    },
    {
        meter_id: 6,
        facility_id: 106,
        rating: 91,
        address: 'ст. Ново-Титаровская, ул. Садовая, д. 18',
        meter_details: {
            square: 110,
            facility_type_name: 'Частный дом',
            residents_count: 6,
            rooms_count: 6
        },
        client: {
            name: 'Смирнов Алексей Викторович',

        },
        geodata: {
            latitude: 45.2367,
            longitude: 38.9865
        },
        is_first: null,
        verified_status: null
    },
    {
        meter_id: 7,
        facility_id: 107,
        rating: 37,
        address: 'Архипо-Осиповка, ул. Морская, д. 3',
        meter_details: {
            square: 48,
            facility_type_name: 'Квартира',
            residents_count: 1,
            rooms_count: 1
        },
        client: {
            name: 'Кузнецова Мария Ивановна',

        },
        geodata: {
            latitude: 44.3662,
            longitude: 38.5378
        },
        is_first: null,
        verified_status: null
    },
    {
        meter_id: 8,
        facility_id: 108,
        rating: 73,
        address: 'Краснодар, ул. Гагарина, д. 89, кв. 34',
        meter_details: {
            square: 65,
            facility_type_name: 'Квартира',
            residents_count: 3,
            rooms_count: 2
        },
        client: {
            name: 'Попов Владимир Сергеевич',
        },
        geodata: {
            latitude: 45.0361,
            longitude: 38.9765
        },
        is_first: null,
        verified_status: null
    }
];

function MeterListPage() {
    const [meters, setMeters] = useState<Meter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const fetchMeters = async (page = 1, perPage = 10) => {
        if (IS_DEBUG_MODE) {
            setMeters(TEST_DATA);
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
                `${API_HOST}/api/v1/meters?page=${page}&per_page=${perPage}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: Meter[] = await response.json();
            setMeters(data);
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
        fetchMeters(pagination.current, pagination.pageSize);
    }, [pagination.current, pagination.pageSize]);

    const handleTableChange = (pagination: any) => {
        setPagination(pagination);
    };

    if (loading && !meters.length) {
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
            <Title level={3} style={{ color: "white", textAlign: "center" }}><b>Список счетчиков</b></Title>
            <br />
            <MeterTable
                meters={meters}
                pagination={pagination}
                onTableChange={handleTableChange}
                loading={loading}
            />
        </Layout>
    );
}

export default withAuth(MeterListPage);