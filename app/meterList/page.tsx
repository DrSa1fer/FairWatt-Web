"use client";

import { Button, Layout, Typography } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { withAuth } from "../hocs/withAuth";
import { MeterTable } from "../components/meterTable";

const { Title } = Typography;

function MeterListPage() {
    const testData = [
        {
            meter_id: 1,
            facility_id: 101,
            name: 'Фомин Сергей Александрович',
            rating: 78,
            address: 'Краснодар, ул. Павлова, д. 14',
            meter_details: {
                square: 74,
                facility_type_name: 'Частный дом',
                residents_count: 3,
                rooms_count: 4
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
            name: 'Петров Павел Андреевич',
            rating: 54,
            address: 'Краснодар, ул. Севастопольская, д. 3, кв. 14',
            meter_details: {
                square: 46,
                facility_type_name: 'Квартира',
                residents_count: 2,
                rooms_count: 2
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
            name: 'Сидорова Анна Владимировна',
            rating: 84,
            address: 'ст. Ново-Титаровская, ул. Ленина, д. 25',
            meter_details: {
                square: 95,
                facility_type_name: 'Частный дом',
                residents_count: 5,
                rooms_count: 5
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
            name: 'Ковалев Дмитрий Игоревич',
            rating: 62,
            address: 'Архипо-Осиповка, ул. Центральная, д. 7',
            meter_details: {
                square: 68,
                facility_type_name: 'Частный дом',
                residents_count: 4,
                rooms_count: 3
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
            name: 'Иванова Ольга Петровна',
            rating: 45,
            address: 'Краснодар, ул. Красная, д. 56, кв. 12',
            meter_details: {
                square: 52,
                facility_type_name: 'Квартира',
                residents_count: 2,
                rooms_count: 1
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
            name: 'Смирнов Алексей Викторович',
            rating: 91,
            address: 'ст. Ново-Титаровская, ул. Садовая, д. 18',
            meter_details: {
                square: 110,
                facility_type_name: 'Частный дом',
                residents_count: 6,
                rooms_count: 6
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
            name: 'Кузнецова Мария Ивановна',
            rating: 37,
            address: 'Архипо-Осиповка, ул. Морская, д. 3',
            meter_details: {
                square: 48,
                facility_type_name: 'Квартира',
                residents_count: 1,
                rooms_count: 1
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
            name: 'Попов Владимир Сергеевич',
            rating: 73,
            address: 'Краснодар, ул. Гагарина, д. 89, кв. 34',
            meter_details: {
                square: 65,
                facility_type_name: 'Квартира',
                residents_count: 3,
                rooms_count: 2
            },
            geodata: {
                latitude: 45.0361,
                longitude: 38.9765
            },
            is_first: null,
            verified_status: null
        }
    ];

    return (
        <Layout style={{ padding: 20, background: "transparent" }}>
            <Title level={3} style={{ color: "white", textAlign: "center" }}><b>Список счетчиков</b></Title>
            <br />
            <MeterTable meters={testData} />
        </Layout>
    );
}

export default withAuth(MeterListPage);