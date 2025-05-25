"use client";

import {
    Card,
    Layout,
    Typography,
    Spin,
    Alert,
    Segmented,
    Statistic,
    Row,
    Col,
    Space,
    Button,
    Table,
    Tag
} from "antd";
import {
    LineChartOutlined,
    ArrowLeftOutlined,
    BarChartOutlined,
    PieChartOutlined,
    UserOutlined,
    HomeOutlined
} from '@ant-design/icons';
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { useMessage } from "../hooks/useMessage";

// Динамическая загрузка графиков с отключением SSR
const LineChart = dynamic(
    () => import('@ant-design/charts').then((mod) => mod.Line),
    { ssr: false }
);
const BarChart = dynamic(
    () => import('@ant-design/charts').then((mod) => mod.Bar),
    { ssr: false }
);
const PieChart = dynamic(
    () => import('@ant-design/charts').then((mod) => mod.Pie),
    { ssr: false }
);

const { Title, Text } = Typography;

// Константы для API
const IS_DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
const API_HOST = process.env.NEXT_PUBLIC_API_HOST || 'http://10.8.0.99:8000';

// Тестовые данные (используются только в режиме отладки)
const TEST_DATA = {
    questionableClients: 8,
    averageFacilityConsumption: 350.5,
    averageFlatConsumption: 250.3,
    averageMonthConsumption: [320, 310, 290, 280, 300, 350, 400, 380, 360, 340, 330, 320],
    clientInfo: {
        name: 'Кузнецова Мария Ивановна',
        address: 'Архипо-Осиповка, ул. Морская, д. 3',
        rating: 37
    }
};

export default function ConsumptionChartPage() {
    const { messageApi, contextHolder } = useMessage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const meterId = searchParams.get('meterId');
    const facilityId = searchParams.get('facilityId');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('monthly');
    const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
    const [clientInfo, setClientInfo] = useState<{ name: string, address: string, rating: number } | null>(null);

    // Данные для графиков
    const [questionableClients, setQuestionableClients] = useState(0);
    const [averageFacilityConsumption, setAverageFacilityConsumption] = useState(0);
    const [averageFlatConsumption, setAverageFlatConsumption] = useState(0);
    const [monthlyConsumption, setMonthlyConsumption] = useState<number[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                if (IS_DEBUG_MODE) {
                    // Используем тестовые данные в режиме отладки
                    setQuestionableClients(TEST_DATA.questionableClients);
                    setAverageFacilityConsumption(TEST_DATA.averageFacilityConsumption);
                    if (facilityId) setAverageFlatConsumption(TEST_DATA.averageFlatConsumption);
                    setMonthlyConsumption(TEST_DATA.averageMonthConsumption);
                    if (meterId) setClientInfo(TEST_DATA.clientInfo);
                    setLoading(false);
                    return;
                }

                // Загрузка данных с API
                const [
                    questionableRes,
                    facilityRes,
                    flatRes,
                    monthlyRes,
                    clientRes
                ] = await Promise.all([
                    fetch(`${API_HOST}/api/v1/questionableClients`),
                    fetch(`${API_HOST}/api/v1/averageFacilityConsumption?is_daily=${viewMode === 'daily'}`),
                    facilityId ? fetch(`${API_HOST}/api/v1/averageFlatConsumption/${facilityId}?is_daily=${viewMode === 'daily'}`) : null,
                    fetch(`${API_HOST}/api/v1/averageMonthConsumption`),
                    meterId ? fetch(`${API_HOST}/api/v1/meters/${meterId}`) : null
                ]);

                if (!questionableRes.ok) throw new Error('Failed to fetch questionable clients');
                if (!facilityRes.ok) throw new Error('Failed to fetch facility consumption');
                if (facilityId && !flatRes?.ok) throw new Error('Failed to fetch flat consumption');
                if (!monthlyRes.ok) throw new Error('Failed to fetch monthly consumption');

                setQuestionableClients(await questionableRes.json());
                setAverageFacilityConsumption(await facilityRes.json());
                if (facilityId) setAverageFlatConsumption(await flatRes?.json());
                setMonthlyConsumption(await monthlyRes.json());

                if (meterId && clientRes?.ok) {
                    const clientData = await clientRes.json();
                    setClientInfo({
                        name: clientData.client?.name,
                        address: clientData.address,
                        rating: clientData.rating
                    });
                }

            } catch (err: any) {
                console.error("Failed to fetch data:", err);
                setError(err.message || "Не удалось загрузить данные");
                messageApi.error(err.message || "Не удалось загрузить данные");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [viewMode, facilityId, meterId]);

    if (loading) {
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
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    style={{ marginTop: 20 }}
                >
                    Назад
                </Button>
            </Layout>
        );
    }

    // Подготовка данных для графиков
    const monthlyData = monthlyConsumption.map((value, index) => ({
        month: new Date(2024, index, 1).toLocaleDateString('ru', { month: 'long' }),
        shortMonth: new Date(2024, index, 1).toLocaleDateString('ru', { month: 'short' }),
        'потребление': value,
        monthNumber: index + 1,
        isWinter: index >= 9 || index <= 3 // Октябрь (10) - Апрель (4)
    }));

    const comparisonData = [
        { type: 'Среднее по объектам', 'среднее потребление': averageFacilityConsumption },
        { type: 'Текущий объект', 'среднее потребление': averageFlatConsumption }
    ];

    const getRatingColor = (rating: number) => {
        if (rating < 20) return '#ff4d4f';
        if (rating < 40) return '#ff7a45';
        if (rating < 60) return '#ffa940';
        if (rating < 80) return '#1890ff';
        return '#52c41a';
    };

    const getConsumptionColor = (value: number, isWinter: boolean) => {
        if (value > 10000) return 'red';
        if (isWinter && value > 3000) return 'orange';
        return 'blue';
    };

    const configPie = {
        data: comparisonData,
        angleField: 'среднее потребление',
        colorField: 'type',
        radius: 0.8,
        label: {
            text: 'среднее потребление',
            style: {
                fontWeight: 'bold',
            },
        },
        legend: {
            position: 'bottom',
        },
        interactions: [{ type: 'element-active' }],
    };

    const configLine = {
        data: monthlyData,
        xField: 'shortMonth',
        yField: 'потребление',
        yAxis: {
            label: {
                formatter: (v: string) => `${v} кВт·ч`,
            },
        },
        point: {
            size: 5,
            shape: 'diamond',
        },
        interaction: {
            tooltip: {
                marker: true,
            },
        }
    };

    const configBar = {
        data: monthlyData,
        xField: 'shortMonth',
        yField: 'потребление',
        colorField: 'shortMonth',
        tooltip: {
            showTitle: true,
            title: 'Потребление',
        },
        marginRatio: 0.5,
        animation: {
            appear: {
                duration: 1000,
                delay: 300,
            },
        },
    };

    const columns = [
        {
            title: 'Месяц',
            dataIndex: 'month',
            key: 'month',
            sorter: (a: any, b: any) => a.monthNumber - b.monthNumber,
            defaultSortOrder: 'ascend' as const,
        },
        {
            title: 'Потребление',
            dataIndex: 'потребление',
            key: 'потребление',
            render: (value: number, record: any) => (
                <Tag color={getConsumptionColor(value, record.isWinter)}>
                    {value} кВт·ч
                </Tag>
            ),
            sorter: (a: any, b: any) => a.consumption - b.consumption,
        }
    ];

    const chartTitle = meterId ? "График потребления" : "График потребления (общий)";
    const monthTitle = meterId ? "Данные по месяцам" : "Данные по месяцам (общий)";

    return (
        <Layout style={{ padding: 20, background: "transparent" }}>
            {contextHolder}
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    style={{ marginBottom: 16 }}
                >
                    Назад
                </Button>

                <div style={{ textAlign: 'center' }}>
                    <Title level={3} style={{ color: "white", marginBottom: 8 }}>
                        <b>Аналитика потребления</b>
                    </Title>

                    {clientInfo && (
                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 24,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <UserOutlined style={{ color: '#1890ff' }} />
                            <Text strong style={{ color: 'white' }}>По клиенту {clientInfo.name}</Text>

                            <HomeOutlined style={{ color: '#1890ff', marginLeft: 8 }} />
                            <Text style={{ color: 'white' }}>{clientInfo.address}</Text>

                            <div style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: getRatingColor(clientInfo.rating),
                                display: 'inline-flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginLeft: 8
                            }}>
                                <Text strong style={{ color: 'white', fontSize: 12 }}>{clientInfo.rating}</Text>
                            </div>
                        </div>
                    )}
                </div>

                <Row gutter={16}>
                    {!meterId && (
                        <Col span={8}>
                            <Card variant='borderless'>
                                <Statistic
                                    title="Подозрительные клиенты"
                                    value={questionableClients}
                                    prefix={<LineChartOutlined />}
                                />
                            </Card>
                        </Col>
                    )}
                    <Col span={meterId ? 12 : 8}>
                        <Card variant='borderless'>
                            <Statistic
                                title={`Среднее потребление (${viewMode === 'daily' ? 'день' : 'месяц'})`}
                                value={averageFacilityConsumption}
                                precision={1}
                                suffix="кВт·ч"
                                prefix={<BarChartOutlined />}
                            />
                        </Card>
                    </Col>
                    {facilityId && (
                        <Col span={meterId ? 12 : 8}>
                            <Card variant='borderless'>
                                <Statistic
                                    title={`Потребление объекта (${viewMode === 'daily' ? 'день' : 'месяц'})`}
                                    value={averageFlatConsumption}
                                    precision={1}
                                    suffix="кВт·ч"
                                    prefix={<PieChartOutlined />}
                                />
                            </Card>
                        </Col>
                    )}
                </Row>

                <Card
                    title={chartTitle}
                    extra={
                        <Space>
                            <Segmented
                                value={viewMode}
                                onChange={(value) => setViewMode(value as 'daily' | 'monthly')}
                                options={[
                                    { label: 'По дням', value: 'daily' },
                                    { label: 'По месяцам', value: 'monthly' },
                                ]}
                            />
                            <Segmented
                                value={chartType}
                                onChange={(value) => setChartType(value as 'line' | 'bar' | 'pie')}
                                options={[
                                    { label: 'Линия', value: 'line' },
                                    { label: 'Столбцы', value: 'bar' },
                                    { label: 'Сравнение', value: 'pie' },
                                ]}
                            />
                        </Space>
                    }
                >
                    {chartType === 'line' && <LineChart {...configLine} />}
                    {chartType === 'bar' && <BarChart {...configBar} />}
                    {chartType === 'pie' && facilityId && <PieChart {...configPie} />}
                    {chartType === 'pie' && !facilityId && (
                        <Text type="warning">Для сравнения требуется открыть данные конкретного счетчика</Text>
                    )}
                </Card>

                <Card
                    title="{monthTitle}"
                    style={{
                        width: '50%',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}
                    styles={{
                        body: {
                            padding: 0
                        }
                    }}
                >
                    <Table
                        columns={columns}
                        dataSource={monthlyData}
                        rowKey="monthNumber"
                        pagination={false}
                        size="small"
                    />
                </Card>
            </Space>
        </Layout>
    );
}