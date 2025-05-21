"use client";

import { Layout, Typography } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { withAuth } from "../hocs/withAuth";
import { MeterTable } from "../components/meterTable";

const { Title } = Typography;

function MeterListPage() {
    const testData: Meter[] = [
        {
            id: 1,
            name: 'Фомин Сергей Александрович',
            rating: 78,
            address: 'Краснодар, ул. Павлова, д. 14',
            lastConsumption: 2405,
            tariffName: 'Льготный',
            tariffPrice: 100,
            region: 'Краснодарский край',
            meterDetails: {
                square: 74,
                hasElectricHeating: true,
                hasElectricStove: false,
                facilityName: 'Частный дом',
                settlementName: 'Город'
            }
        },
        {
            id: 2,
            name: 'Петров Павел Андреевич',
            rating: 54,
            address: 'Краснодар, ул. Севастопольская, д. 3, кв. 14',
            lastConsumption: 8432,
            tariffName: 'Льготный',
            tariffPrice: 100,
            region: 'Краснодарский край',
            meterDetails: {
                square: 46,
                hasElectricHeating: true,
                hasElectricStove: true,
                facilityName: 'Квартира',
                settlementName: 'Город'
            }
        },
        {
            id: 3,
            name: 'Сибурин Владимир Антонович',
            rating: 84,
            address: 'Шахты, ул. Шелковая, д. 7',
            lastConsumption: 1255,
            tariffName: 'Единый',
            tariffPrice: 150,
            region: 'Ростовская область',
            meterDetails: {
                square: 74,
                hasElectricHeating: false,
                hasElectricStove: false,
                facilityName: 'Частный дом',
                settlementName: 'Село'
            }
        },
        {
            id: 4,
            name: 'Иванова Анна Петровна',
            rating: 32,
            address: 'Москва, ул. Ленина, д. 25, кв. 7',
            lastConsumption: 3654,
            tariffName: 'Стандартный',
            tariffPrice: 120,
            region: 'Московская область',
            meterDetails: {
                square: 58,
                hasElectricHeating: false,
                hasElectricStove: true,
                facilityName: 'Квартира',
                settlementName: 'Город'
            }
        },
        {
            id: 5,
            name: 'Смирнов Алексей Викторович',
            rating: 65,
            address: 'Сочи, ул. Морская, д. 12',
            lastConsumption: 4789,
            tariffName: 'Льготный',
            tariffPrice: 100,
            region: 'Краснодарский край',
            meterDetails: {
                square: 89,
                hasElectricHeating: true,
                hasElectricStove: false,
                facilityName: 'Частный дом',
                settlementName: 'Город'
            }
        },
        {
            id: 6,
            name: 'Кузнецова Мария Ивановна',
            rating: 45,
            address: 'Ростов-на-Дону, ул. Пушкина, д. 18, кв. 3',
            lastConsumption: 5236,
            tariffName: 'Единый',
            tariffPrice: 150,
            region: 'Ростовская область',
            meterDetails: {
                square: 63,
                hasElectricHeating: false,
                hasElectricStove: true,
                facilityName: 'Квартира',
                settlementName: 'Город'
            }
        },
        {
            id: 7,
            name: 'Васильев Дмитрий Сергеевич',
            rating: 91,
            address: 'Новосибирск, ул. Советская, д. 45',
            lastConsumption: 1874,
            tariffName: 'Стандартный',
            tariffPrice: 120,
            region: 'Новосибирская область',
            meterDetails: {
                square: 95,
                hasElectricHeating: true,
                hasElectricStove: true,
                facilityName: 'Частный дом',
                settlementName: 'Село'
            }
        },
        {
            id: 8,
            name: 'Попова Елена Александровна',
            rating: 28,
            address: 'Екатеринбург, ул. Мира, д. 33, кв. 9',
            lastConsumption: 6542,
            tariffName: 'Льготный',
            tariffPrice: 100,
            region: 'Свердловская область',
            meterDetails: {
                square: 50,
                hasElectricHeating: false,
                hasElectricStove: false,
                facilityName: 'Квартира',
                settlementName: 'Город'
            }
        },
        {
            id: 9,
            name: 'Новиков Андрей Петрович',
            rating: 73,
            address: 'Казань, ул. Баумана, д. 56',
            lastConsumption: 3987,
            tariffName: 'Единый',
            tariffPrice: 150,
            region: 'Республика Татарстан',
            meterDetails: {
                square: 77,
                hasElectricHeating: true,
                hasElectricStove: false,
                facilityName: 'Частный дом',
                settlementName: 'Город'
            }
        },
        {
            id: 10,
            name: 'Соколова Ольга Дмитриевна',
            rating: 59,
            address: 'Владивосток, ул. Океанская, д. 11, кв. 4',
            lastConsumption: 4215,
            tariffName: 'Стандартный',
            tariffPrice: 120,
            region: 'Приморский край',
            meterDetails: {
                square: 62,
                hasElectricHeating: false,
                hasElectricStove: true,
                facilityName: 'Квартира',
                settlementName: 'Город'
            }
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