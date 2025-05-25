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
    UserOutlined,
    CalculatorOutlined
} from '@ant-design/icons';
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMeterById } from "../services/meter";
import Link from "next/link";
import { useMessage } from "../hooks/useMessage";
// import dynamic from 'next/dynamic';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { useToken } = theme;

// Динамически загружаем компонент карты с отключенным SSR
// const YandexMap = dynamic(() => import('../components/YandexMap'), {
//     ssr: false,
//     loading: () => <div style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Загрузка карты...</div>
// });

export default function ProfilePage() {
    const { token } = useToken();
    const { messageApi, contextHolder } = useMessage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const meterId = searchParams.get('meterId');

    const [meterData, setMeterData] = useState<Meter | null>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState<string>("");
    const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [externalData, setExternalData] = useState<{
        avito?: Array<{ url: string; link: string; description: string }>;
        fns?: { url: string };
        maps?: Array<{ url: string; name: string; purpose_name: string }>;
    } | null>(null);
    const [lossesAmount, setLossesAmount] = useState<number | null>(null);
    const [calculatingLosses, setCalculatingLosses] = useState(false);

    useEffect(() => {
        if (meterId) {
            const loadData = async () => {
                try {
                    setLoading(true);

                    // Сначала загружаем данные
                    const data = IS_DEBUG_MODE
                        ? JSON.parse(localStorage.getItem(`meterProfile_${meterId}`) || 'null') || {
                            meter_id: parseInt(meterId),
                            client: {},
                            meter_details: {},
                            address: '',
                            rating: 0,
                            verified_status: null,
                            geodata: {
                                latitude: 45.0355,
                                longitude: 38.9753
                            }
                        }
                        : await getMeterById(meterId);

                    setMeterData(data);

                    // Затем рассчитываем потери
                    const amount = await calculateLosses(meterId);
                    setLossesAmount(amount);
                } catch (error) {
                    console.error('Error loading data:', error);
                    messageApi.error('Не удалось загрузить данные профиля');
                } finally {
                    setLoading(false);
                }
            };

            loadData();
        }
    }, [meterId, messageApi]);

    const saveNoteToApi = async (meterId: string, noteText: string) => {
        try {
            const response = await fetch(
                `${API_HOST}/api/v1/meters/note?meter_id=${meterId}&notes=${encodeURIComponent(noteText)}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 422) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail?.[0]?.msg || 'Некорректные данные');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error saving note:', error);
            throw error;
        }
    };

    const calculateLosses = async (meterId: string) => {
        try {
            setCalculatingLosses(true);

            if (IS_DEBUG_MODE) {
                // В режиме отладки возвращаем случайное значение
                await new Promise(resolve => setTimeout(resolve, 500));
                return Math.floor(Math.random() * 10000) + 1000;
            }

            const response = await fetch(`${API_HOST}/api/v1/calculateLosses?meter_id=${meterId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error calculating losses:', error);
            throw error;
        } finally {
            setCalculatingLosses(false);
        }
    };

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
            if (!meterId || !meterData) {
                throw new Error('Данные счетчика не загружены');
            }

            if (IS_DEBUG_MODE) {
                await new Promise(resolve => setTimeout(resolve, 500));

                setExternalData({
                    avito: [
                        {
                            url: 'https://avito.ru/item1',
                            link: 'Объявление 1',
                            description: '2-комнатная квартира'
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
                messageApi.success('Тестовые данные успешно собраны');
                return;
            }

            const [mapsResponse, fnsResponse, avitoResponse] = await Promise.all([
                fetch(`${API_HOST}/api/v1/dataCollect/2gis?address=${encodeURIComponent(meterData.address || '')}`)
                    .then(res => res.ok ? res.json() : null)
                    .catch(() => null),

                fetch(`${API_HOST}/api/v1/dataCollect/legal?full_name=${encodeURIComponent(meterData.client?.name || '')}`)
                    .then(res => res.ok ? res.json() : null)
                    .catch(() => null),

                fetch(`${API_HOST}/api/v1/dataCollect/avito?address=${encodeURIComponent(meterData.address || '')}`)
                    .then(res => res.ok ? res.json() : null)
                    .catch(() => null)
            ]);

            const result: typeof externalData = {};

            if (mapsResponse?.branches?.length) {
                result.maps = mapsResponse.branches.map((branch: any) => ({
                    url: mapsResponse.url,
                    name: branch.name,
                    purpose_name: branch.purpose_name
                }));
            }

            if (fnsResponse?.url) {
                result.fns = {
                    url: fnsResponse.url
                };
            }

            if (avitoResponse?.length) {
                result.avito = avitoResponse.map((item: any) => ({
                    url: item.url,
                    link: item.title,
                    description: item.description
                }));
            }

            setExternalData(result);
            messageApi.success('Данные успешно собраны');

        } catch (error) {
            console.error('Error collecting external data:', error);
            messageApi.error('Ошибка при сборе данных');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNote = async () => {
        if (!meterId) {
            messageApi.error('Не указан ID счетчика');
            return;
        }

        if (!notes.trim()) {
            messageApi.warning('Заметка не может быть пустой');
            return;
        }

        try {
            setIsLoading(true);

            if (IS_DEBUG_MODE) {
                localStorage.setItem(`meterNote_${meterId}`, notes);
                messageApi.success('Заметка сохранена (тестовый режим)');
            } else {
                await saveNoteToApi(meterId, notes);
                messageApi.success('Заметка успешно сохранена');
            }

            setIsEditingNotes(false);
        } catch (error: any) {
            console.error('Error saving note:', error);
            messageApi.error(error.message || 'Ошибка при сохранении заметки');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (IS_DEBUG_MODE && meterId) {
            const savedNotes = localStorage.getItem(`meterNotes_${meterId}`);
            if (savedNotes) {
                setNotes(savedNotes);
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

    let { client, meter_details, address, is_iot, rating = 0, verified_status, geodata } = meterData;

    if (IS_DEBUG_MODE) {
        geodata = {
            latitude: 33.82893,
            longitude: 38.2312323
        }
    }

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
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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

                        <Space style={{ marginTop: 10 }} direction="vertical">
                            {lossesAmount !== null && (
                                lossesAmount === 0 ? (
                                    <Text type="secondary">Нет данных для расчета потерь</Text>
                                ) : (
                                    <Text strong style={{ color: token.colorError }}>
                                        Потенциальные потери: {lossesAmount.toLocaleString('ru-RU')} ₽
                                    </Text>
                                )
                            )}
                        </Space>

                        <div style={{ marginTop: 16, marginBottom: 24 }}>
                            <Text style={{ color: '#000', fontSize: 16 }}>
                                {(meter_details?.facility_type_name || 'Тип помещения не указан') +
                                    ' · ' + (meter_details?.square != null ? `${meter_details.square} м²` : 'Площадь не указана') +
                                    ' · '}
                                <span title="Жильцы"><UserOutlined /></span> {meter_details?.resident_count ?? '—'} · Комнат {meter_details?.room_count ?? '—'}
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
                                                <Link className='tableLink' href={`tel:${client.phone}`}>
                                                    {client.phone}
                                                </Link>
                                            </Space>
                                        ) : 'Не указан'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<Text strong>Email</Text>}>
                                        {client?.email ? (
                                            <Space>
                                                <MailOutlined />
                                                <Link className='tableLink' href={`mailto:${client.email}`}>
                                                    {client.email}
                                                </Link>
                                            </Space>
                                        ) : 'Не указан'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </div>
                    </div>

                    {geodata && (
                        <Card title="Панорама">
                            <div>
                                <Link
                                    href={`https://yandex.ru/maps/?ll=${geodata.longitude}%2C${geodata.latitude}&z=17&l=stv%2Csta`}
                                    target="_blank"
                                    className="tableLink"
                                >
                                    Открыть в Яндекс.Картах
                                </Link>
                            </div>
                        </Card>
                    )}

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
                            isEditingNotes ? (
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={handleSaveNote}
                                    loading={isLoading}
                                >
                                    Сохранить
                                </Button>
                            ) : (
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={() => setIsEditingNotes(true)}
                                >
                                    Редактировать
                                </Button>
                            )
                        }
                    >
                        {isEditingNotes ? (
                            <TextArea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                autoSize={{ minRows: 3, maxRows: 6 }}
                                style={{ marginBottom: 16 }}
                            />
                        ) : (
                            <Text>{notes || 'Нет заметки'}</Text>
                        )}
                    </Card>
                </Space>
            </Layout>
        </ConfigProvider>
    );
}