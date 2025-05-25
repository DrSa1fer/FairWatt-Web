"use client";

import {
    Descriptions,
    Tag,
    List,
    Input,
    Avatar,
    Space,
    Typography,
    Card,
    Button,
    Layout,
    ConfigProvider,
    Collapse,
    theme
} from "antd";
import {
    PhoneOutlined,
    MailOutlined,
    HomeOutlined,
    EditOutlined,
    SaveOutlined,
    SearchOutlined,
    ArrowLeftOutlined,
    InfoCircleOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMeterById } from "../services/meter";
import Link from "next/link";
import { useMessage } from "../hooks/useMessage";

const { Text, Title } = Typography;
const { TextArea } = Input;
const { useToken } = theme;

export default function ProfilePage() {
    const { token } = useToken();
    const { messageApi, contextHolder } = useMessage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const meterId = searchParams.get('meterId');

    const [meterData, setMeterData] = useState<Meter | null>(null);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState<string>("");
    const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [externalData, setExternalData] = useState<{
        avito?: Array<{ url: string; link: string; description: string }>;
        fns?: { url: string };
        maps?: Array<{ url: string; name: string; purpose_name: string }>;
    } | null>(null);

    useEffect(() => {
        if (meterId) {
            const loadMeterData = async () => {
                try {
                    setLoading(true);

                    if (IS_DEBUG_MODE) {
                        // В режиме отладки загружаем из localStorage
                        const savedData = localStorage.getItem(`meterProfile_${meterId}`);
                        if (savedData) {
                            setMeterData(JSON.parse(savedData));
                            return;
                        }
                        messageApi.warning('Данные не найдены в localStorage. Загружаю пустой профиль.');
                        setMeterData({
                            meter_id: parseInt(meterId),
                            client: {},
                            meter_details: {},
                            address: '',
                            rating: 0,
                            verified_status: null
                        } as Meter);
                    } else {
                        // В обычном режиме загружаем с сервера
                        const data = await getMeterById(meterId);
                        setMeterData(data);
                    }
                } catch (error) {
                    console.error('Error loading meter data:', error);
                    messageApi.error('Не удалось загрузить данные профиля');
                } finally {
                    setLoading(false);
                }
            };

            loadMeterData();
        }
    }, [meterId]);

    const getRatingColor = (rating: number | null) => {
        if (!rating) return '#ffffff';
        if (rating < 20) return '#ff4d4f';
        if (rating < 40) return '#ff7a45';
        if (rating < 60) return '#ffa940';
        if (rating < 80) return '#1890ff';
        return '#52c41a';
    };

    const handleCollectData = async () => {
        setIsLoading(true);
        try {
            if (IS_DEBUG_MODE) {
                // В режиме отладки используем mock данные
                await new Promise(resolve => setTimeout(resolve, 500));

                setExternalData({
                    avito: [
                        {
                            url: 'https://avito.ru/item1',
                            link: 'Объявление 1',
                            description: '2-комнатная квартира'
                        },
                        {
                            url: 'https://avito.ru/item2',
                            link: 'Объявление 2',
                            description: 'Сдается гараж'
                        }
                    ],
                    fns: {
                        url: 'https://fns.ru/tax-info'
                    },
                    maps: [
                        {
                            url: 'https://maps.yandex.ru/location1',
                            name: 'Точка 1',
                            purpose_name: 'Жилое помещение'
                        }
                    ]
                });
            } else {
                // В обычном режиме делаем реальный запрос к API
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/external-data/${meterId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch external data');
                }
                const data = await response.json();
                setExternalData(data);
            }

            messageApi.success('Данные успешно собраны');
        } catch (error) {
            console.error('Error collecting external data:', error);
            messageApi.error('Ошибка при сборе данных');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNote = () => {
        setIsEditingNote(false);
        if (IS_DEBUG_MODE) {
            // В режиме отладки сохраняем заметку в localStorage
            if (meterId) {
                localStorage.setItem(`meterNote_${meterId}`, note);
            }
        } else {
            // В обычном режиме отправляем на сервер
            // Здесь должна быть реализация сохранения на сервере
        }
        messageApi.success('Заметка сохранена');
    };

    useEffect(() => {
        if (IS_DEBUG_MODE && meterId) {
            // В режиме отладки загружаем заметку из localStorage
            const savedNote = localStorage.getItem(`meterNote_${meterId}`);
            if (savedNote) {
                setNote(savedNote);
            }
        }
    }, [meterId]);

    if (loading) {
        return (
            <Layout style={{ background: "transparent", padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Title level={3} style={{ color: "white" }}>
                    Загрузка данных профиля...
                </Title>
            </Layout>
        );
    }

    if (!meterData) {
        return (
            <Layout style={{ background: "transparent", padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Title style={{ color: "white" }} level={3}>Профиль не найден</Title>
                <Button type="primary" onClick={() => router.back()}>Назад</Button>
            </Layout>
        );
    }

    const { client, meter_details, address, is_iot, rating = 0, verified_status } = meterData;

    const customTheme = {
        components: {
            Card: {
                colorBgContainer: token.colorBgContainer,
                colorBorder: token.colorBorder,
                borderRadius: token.borderRadiusLG,
                paddingLG: 20,
            },
            Descriptions: {
                colorText: token.colorText,
                colorTextSecondary: token.colorTextSecondary,
                colorBorder: token.colorBorder,
            },
            List: {
                colorText: token.colorText,
            },
            Collapse: {
                colorTextHeading: token.colorText,
                colorBorder: token.colorBorder,
            },
            Input: {
                colorBgContainer: token.colorBgContainer,
                colorBorder: token.colorBorder,
                colorText: token.colorText,
            },
            Button: {
                colorPrimary: token.colorPrimary,
                colorPrimaryHover: token.colorPrimaryHover,
            }
        },
        token: {
            colorPrimary: token.colorPrimary,
            colorBgContainer: token.colorBgContainer,
            colorBorder: token.colorBorder,
        }
    };

    return (
        <ConfigProvider theme={customTheme}>
            {contextHolder}
            <Layout style={{
                background: "transparent",
                padding: 24,
                minHeight: '100vh'
            }}>
                {/*<Button*/}
                {/*    icon={<ArrowLeftOutlined />}*/}
                {/*    onClick={() => router.back()}*/}
                {/*    style={{ marginBottom: 24, width: 250 }}*/}
                {/*>*/}
                {/*    Назад*/}
                {/*</Button>*/}

                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{
                        background: token.colorBgContainer,
                        padding: 24,
                        borderRadius: token.borderRadiusLG,
                        border: `1px solid ${token.colorBorder}`
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start' }}>
                            <div>
                                <Title level={2} style={{ margin: 0 }}>
                                    {client?.name || 'Не указано ФИО клиента'}
                                </Title>
                                <Text type="secondary" style={{ fontSize: 16 }}>
                                    {address || 'Не указан адрес'}
                                </Text>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                <Tag
                                    color={verified_status ? token.colorSuccess : token.colorWarning}
                                    icon={verified_status ? null : <InfoCircleOutlined />}
                                    style={{ height: 32, display: 'flex', alignItems: 'center', fontSize: 14 }}
                                >
                                    {verified_status || 'Проверок не было'}
                                </Tag>
                                <div>
                                    <Avatar
                                        style={{
                                            backgroundColor: getRatingColor(rating),
                                            fontWeight: 'bold',
                                            width: 48,
                                            height: 48,
                                            fontSize: 18
                                        }}
                                    >
                                        {rating}
                                    </Avatar>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 16, marginBottom: 24 }}>
                            <Text style={{ color: '#000', fontSize: 16 }}>
                                {(meter_details?.facility_type_name || 'Тип помещения не указан') +
                                    ' · ' + (meter_details?.square != null ? `${meter_details.square} м²` : 'Площадь не указана') +
                                    ' · '}
                                <span title="Жильцы"><UserOutlined /></span> {meter_details?.resident_count ?? '—'} · {meter_details?.room_count ?? '—'} <img src="/door.svg" alt="Комнаты" title="Комнаты" style={{ width: 16, height: 16, verticalAlign: 'text-bottom' }} />
                            </Text>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <div style={{ background: 'none', boxShadow: 'none', border: 'none', padding: 0 }}>
                                <Descriptions column={1}>
                                    <Descriptions.Item label={<Text strong>Тип тарифа</Text>}>
                                        {meter_details?.tariff_type_name || 'Не указан'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<Text strong>Цена тарифа</Text>}>
                                        {meter_details?.tariff_price != null ? `${meter_details.tariff_price} ₽` : 'Не указана'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<Text strong>Тип счетчика</Text>}>
                                        {is_iot
                                            ? <Tag color="blue">IoT</Tag>
                                            : <Tag color="default">Обычный</Tag>}
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                            <div style={{ background: 'none', boxShadow: 'none', border: 'none', padding: 0 }}>
                                <Descriptions column={1}>
                                    <Descriptions.Item label={<Text strong>Телефон</Text>}>
                                        {client?.phone ? (
                                            <Space>
                                                <PhoneOutlined />
                                                <Link href={`tel:${client.phone}`}>
                                                    {client.phone}
                                                </Link>
                                            </Space>
                                        ) : 'Не указан'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<Text strong>Email</Text>}>
                                        {client?.email ? (
                                            <Space>
                                                <MailOutlined />
                                                <Link href={`mailto:${client.email}`}>
                                                    {client.email}
                                                </Link>
                                            </Space>
                                        ) : 'Не указан'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </div>

                        {/* Статус-блок удалён */}
                    </div>

                    <Card
                        title="Внешние данные"
                        extra={
                            !externalData && (
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    onClick={handleCollectData}
                                    loading={isLoading}
                                >
                                    Собрать информацию
                                </Button>
                            )
                        }
                    >
                        {externalData ? (
                            <>
                                <Collapse
                                    ghost
                                    defaultActiveKey={['avito', 'fns', 'maps']}
                                    items={[
                                        {
                                            key: 'avito',
                                            label: <Text strong>Авито</Text>,
                                            children: externalData.avito?.length ? (
                                                <List
                                                    dataSource={externalData.avito}
                                                    renderItem={item => (
                                                        <List.Item>
                                                            <List.Item.Meta
                                                                title={<Link href={item.url} target="_blank">{item.link}</Link>}
                                                                description={item.description}
                                                            />
                                                        </List.Item>
                                                    )}
                                                />
                                            ) : <Text type="secondary">Нет данных с Авито</Text>
                                        },
                                        {
                                            key: 'fns',
                                            label: <Text strong>ФНС</Text>,
                                            children: externalData.fns ? (
                                                <Link href={externalData.fns.url} target="_blank" className="tableLink">
                                                    Ссылка на данные ФНС
                                                </Link>
                                            ) : <Text type="secondary">Нет данных из ФНС</Text>
                                        },
                                        {
                                            key: 'maps',
                                            label: <Text strong>Карты</Text>,
                                            children: externalData.maps?.length ? (
                                                <List
                                                    dataSource={externalData.maps}
                                                    renderItem={item => (
                                                        <List.Item>
                                                            <List.Item.Meta
                                                                title={<Link href={item.url} target="_blank">{item.name}</Link>}
                                                                description={item.purpose_name}
                                                            />
                                                        </List.Item>
                                                    )}
                                                />
                                            ) : <Text type="secondary">Нет данных с карт</Text>
                                        }
                                    ]}
                                />
                            </>
                        ) : (
                            <Text type="secondary">
                                Нажмите "Собрать информацию" для получения данных из внешних источников
                            </Text>
                        )}
                    </Card>

                    <Card
                        title="Заметка"
                        extra={
                            isEditingNote ? (
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={handleSaveNote}
                                >
                                    Сохранить
                                </Button>
                            ) : (
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={() => setIsEditingNote(true)}
                                >
                                    Редактировать
                                </Button>
                            )
                        }
                    >
                        {isEditingNote ? (
                            <TextArea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                autoSize={{ minRows: 3, maxRows: 6 }}
                                style={{ marginBottom: 16 }}
                            />
                        ) : (
                            <Text>{note || 'Нет заметки'}</Text>
                        )}
                    </Card>
                </Space>
            </Layout>
        </ConfigProvider>
    );
}