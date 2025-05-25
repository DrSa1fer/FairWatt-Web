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
            resident_count: 3,
            room_count: 4,
            tariff_type_name: 'Потребительский',
            tariff_price: 4.5
        },
        client: {
            client_id: 1001,
            name: 'Фомин Сергей Александрович',
            phone: 89181234567,
            email: 'fomin.sa@example.com'
        },
        geodata: {
            latitude: 45.0355,
            longitude: 38.9753
        },
        is_first: true,
        is_iot: false,
        verified_status: null,
        consumption: [120, 135, 142, 118, 125],
        notes: 'Дом с зелеными воротами'
    },
    {
        meter_id: 2,
        facility_id: 102,
        rating: 54,
        address: 'Краснодар, ул. Севастопольская, д. 3, кв. 14',
        meter_details: {
            square: 46,
            facility_type_name: 'Квартира',
            resident_count: 2,
            room_count: 2,
            tariff_type_name: 'Льготный',
            tariff_price: 3.2
        },
        client: {
            client_id: 1002,
            name: 'Петров Павел Андреевич',
            phone: 89187654321,
            email: 'petrov.pa@example.com'
        },
        geodata: {
            latitude: 45.0402,
            longitude: 38.9761
        },
        is_iot: true,
        is_first: false,
        verified_status: null,
        consumption: [85, 78, 82, 79, 81],
        notes: 'Код домофона 14#'
    },
    {
        meter_id: 3,
        facility_id: 103,
        rating: 84,
        is_iot: true,
        address: 'ст. Ново-Титаровская, ул. Ленина, д. 25',
        meter_details: {
            square: 95,
            facility_type_name: 'Частный дом',
            resident_count: 5,
            room_count: 5,
            tariff_type_name: 'Потребительский',
            tariff_price: 4.8
        },
        client: {
            client_id: 1003,
            name: 'Сидорова Анна Владимировна',
            phone: 89186543210,
            email: 'sidorova.av@example.com'
        },
        geodata: {
            latitude: 45.2345,
            longitude: 38.9876
        },
        is_first: false,
        verified_status: null,
        consumption: [210, 225, 198, 215, 230],
        notes: 'Большой желтый дом'
    },
    {
        meter_id: 4,
        facility_id: 104,
        is_iot: false,
        rating: 62,
        address: 'Архипо-Осиповка, ул. Центральная, д. 7',
        meter_details: {
            square: 68,
            facility_type_name: 'Частный дом',
            resident_count: 4,
            room_count: 3,
            tariff_type_name: 'Коммерческий',
            tariff_price: 5.6
        },
        client: {
            client_id: 1004,
            name: 'Ковалев Дмитрий Игоревич',
            phone: 89185556677,
            email: 'kovalev.di@example.com'
        },
        geodata: {
            latitude: 44.3654,
            longitude: 38.5367
        },
        is_first: false,
        verified_status: null,
        consumption: [145, 132, 155, 140, 138],
        notes: 'Магазин на первом этаже'
    },
    {
        meter_id: 5,
        is_iot: true,
        facility_id: 105,
        rating: 45,
        address: 'Краснодар, ул. Красная, д. 56, кв. 12',
        meter_details: {
            square: 52,
            facility_type_name: 'Квартира',
            resident_count: 2,
            room_count: 1,
            tariff_type_name: 'Льготный',
            tariff_price: 3.0
        },
        client: {
            client_id: 1005,
            name: 'Иванова Ольга Петровна',
            phone: 89184445566,
            email: 'ivanova.op@example.com'
        },
        geodata: {
            latitude: 45.0347,
            longitude: 38.9748
        },
        is_first: false,
        verified_status: null,
        consumption: [65, 70, 68, 72, 67],
        notes: 'Звонок не работает'
    },
    {
        meter_id: 6,
        is_iot: false,
        facility_id: 106,
        rating: 91,
        address: 'ст. Ново-Титаровская, ул. Садовая, д. 18',
        meter_details: {
            square: 110,
            facility_type_name: 'Частный дом',
            resident_count: 6,
            room_count: 6,
            tariff_type_name: 'Промышленный',
            tariff_price: 6.8
        },
        client: {
            client_id: 1006,
            name: 'Смирнов Алексей Викторович',
            phone: 89183334455,
            email: 'smirnov.av@example.com'
        },
        geodata: {
            latitude: 45.2367,
            longitude: 38.9865
        },
        is_first: true,
        verified_status: null,
        consumption: [320, 335, 310, 325, 340],
        notes: 'Частная пекарня'
    },
    {
        meter_id: 7,
        is_iot: true,
        facility_id: 107,
        rating: 37,
        address: 'Архипо-Осиповка, ул. Морская, д. 3',
        meter_details: {
            square: 48,
            facility_type_name: 'Квартира',
            resident_count: 1,
            room_count: 1,
            tariff_type_name: 'Потребительский',
            tariff_price: 4.2
        },
        client: {
            client_id: 1007,
            name: 'Кузнецова Мария Ивановна',
            phone: 89182223344,
            email: 'kuznetsova.mi@example.com'
        },
        geodata: {
            latitude: 44.3662,
            longitude: 38.5378
        },
        is_first: false,
        verified_status: null,
        consumption: [55, 60, 58, 62, 57],
        notes: 'Сдаваемая квартира'
    },
    {
        meter_id: 8,
        facility_id: 108,
        is_iot: false,
        rating: 73,
        address: 'Краснодар, ул. Гагарина, д. 89, кв. 34',
        meter_details: {
            square: 65,
            facility_type_name: 'Квартира',
            resident_count: 3,
            room_count: 2,
            tariff_type_name: 'Потребительский',
            tariff_price: 4.3
        },
        client: {
            client_id: 1008,
            name: 'Попов Владимир Сергеевич',
            phone: 89127382912,
            email: 'popov.vs@example.com'
        },
        geodata: {
            latitude: 45.0361,
            longitude: 38.9765
        },
        is_first: false,
        verified_status: null,
        consumption: [95, 88, 92, 90, 93],
        notes: 'Последний этаж'
    },
    {
        meter_id: 9,
        facility_id: 109,
        is_iot: true,
        rating: 68,
        address: 'Краснодар, ул. Ставропольская, д. 45, кв. 7',
        meter_details: {
            square: 58,
            facility_type_name: 'Квартира',
            resident_count: 2,
            room_count: 2,
            tariff_type_name: 'Льготный',
            tariff_price: 3.1
        },
        client: {
            client_id: 1009,
            name: 'Николаева Елена Дмитриевна',
            phone: 89181112233,
            email: 'nikolaeva.ed@example.com'
        },
        geodata: {
            latitude: 45.0378,
            longitude: 38.9782
        },
        is_first: false,
        verified_status: null,
        consumption: [75, 80, 78, 82, 77],
        notes: 'Дом с аркой'
    },
    {
        meter_id: 10,
        facility_id: 110,
        is_iot: false,
        rating: 82,
        address: 'ст. Ново-Титаровская, ул. Мира, д. 12',
        meter_details: {
            square: 85,
            facility_type_name: 'Частный дом',
            resident_count: 4,
            room_count: 4,
            tariff_type_name: 'Потребительский',
            tariff_price: 4.6
        },
        client: {
            client_id: 1010,
            name: 'Волков Игорь Николаевич',
            phone: 89189998877,
            email: 'volkov.in@example.com'
        },
        geodata: {
            latitude: 45.2351,
            longitude: 38.9853
        },
        is_first: true,
        verified_status: null,
        consumption: [180, 175, 185, 170, 182],
        notes: 'Серый забор с воротами'
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
            console.log(`emulate: ` + `${API_HOST}/api/v1/meters?page=${page}&per_page=${perPage}`);
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