"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Flex, Input, Layout, Space, Table, Slider, Dropdown, Typography, Modal, message, Tag, List, Card, Select, Descriptions, Avatar } from "antd";
import { DownloadOutlined, DownOutlined, SearchOutlined, LineChartOutlined, UserOutlined, CloseOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import '@ant-design/v5-patch-for-react-19';
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// Динамическая загрузка с отключением SSR
const MapRoute = dynamic(() => import('../components/mapRoute'), {
    ssr: false,
    loading: () => <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        flexDirection: 'column'
    }}>
        <h1>Загрузка карты...</h1>
        <div style={{
            width: '200px',
            height: '4px',
            backgroundColor: '#f0f0f0',
            borderRadius: '2px',
            marginTop: '20px',
            overflow: 'hidden'
        }}>
            <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#4CAF50',
                animation: 'loading 1.5s infinite ease-in-out',
                transformOrigin: 'left center'
            }}></div>
        </div>
    </div>
});

interface Props {
    meters: Meter[];
    pagination?: {
        current: number;
        pageSize: number;
        total: number;
    };
    onTableChange?: (pagination: any) => void;
    loading?: boolean;
}

const { Text } = Typography;

export const MeterTable = ({
    meters = [],
    pagination = { current: 1, pageSize: 10, total: 0 },
    onTableChange,
    loading = false
}: Props) => {
    const router = useRouter();
    const [baseData] = useState<Meter[]>(meters);
    const [filteredData, setFilteredData] = useState<Meter[]>(meters);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isRouteModalVisible, setIsRouteModalVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [apiReady, setApiReady] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeesLoading, setEmployeesLoading] = useState(false);
    const tableRef = useRef<HTMLDivElement>(null);

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedProfileData, setSelectedProfileData] = useState<{
        clientData?: ClientData;
        meterDetails?: MeterDetails;
        address?: string;
        rating?: number;
        verifiedStatus?: string | null;
    }>({});

    // Загрузка API Яндекс.Карт и сотрудников
    useEffect(() => {
        const loadData = async () => {
            // Загрузка Яндекс Карт
            if (window._ymapsLoaded) {
                setApiReady(true);
            } else if (!document.querySelector('script[src*="api-maps.yandex.ru"]')) {
                const script = document.createElement('script');
                script.src = `https://api-maps.yandex.ru/2.1/?apikey=` + process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY + `&lang=ru_RU&load=package.full`;
                script.onload = () => {
                    window.ymaps.ready(() => {
                        window._ymapsLoaded = true;
                        setApiReady(true);
                    });
                };
                document.head.appendChild(script);
            }

            // Загрузка сотрудников
            try {
                if (IS_DEBUG_MODE) {
                    setEmployees([
                        { employee_id: 1, name: 'Иванов Алексей Петрович' },
                        { employee_id: 2, name: 'Петрова Мария Сергеевна' },
                        { employee_id: 3, name: 'Сидоров Дмитрий Иванович' },
                        { employee_id: 4, name: 'Кузнецова Ольга Владимировна' },
                    ]);
                } else {
                    setEmployeesLoading(true);
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST || 'http://10.8.0.99:8000'}/api/v1/employees`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch employees');
                    }
                    const data = await response.json();
                    setEmployees(data);
                }
            } catch (error) {
                console.error('Error loading employees:', error);
                setEmployees([
                    { employee_id: 1, name: 'Иванов Алексей Петрович' },
                    { employee_id: 2, name: 'Петрова Мария Сергеевна' },
                    { employee_id: 3, name: 'Сидоров Дмитрий Иванович' },
                    { employee_id: 4, name: 'Кузнецова Ольга Владимировна' },
                ]);
            } finally {
                setEmployeesLoading(false);
            }
        };

        loadData();

        return () => {
            // Очистка при необходимости
        };
    }, []);

    const [sortedInfo, setSortedInfo] = useState<{
        columnKey?: string;
        order?: 'ascend' | 'descend';
    }>({
        columnKey: 'rating',
        order: 'ascend'
    });

    const [searchName, setSearchName] = useState('');
    const [searchAddress, setSearchAddress] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [ratingRange, setRatingRange] = useState<[number, number]>([0, 100]);

    useEffect(() => {
        if (baseData.length > 0) {
            const ratings = baseData.map(m => m.rating || 0);
            const minRating = Math.min(...ratings);
            const maxRating = Math.max(...ratings);

            setRatingRange([minRating, maxRating]);
            const sorted = [...baseData].sort((a, b) => (a.rating || 0) - (b.rating || 0));
            setFilteredData(sorted);
        }
    }, [baseData]);

    const getRowColor = (rating: number = 0) => {
        if (rating < 20) return '#ff4d4f';  // Ярко-красный
        if (rating < 40) return '#ff7a45';  // Ярко-оранжевый
        if (rating < 60) return '#ffa940';  // Ярко-желтый
        if (rating < 80) return '#1890ff';  // Ярко-синий
        return '#52c41a';                   // Ярко-зеленый
    };

    const applyFilters = () => {
        let filtered = baseData.filter(meter => {
            if (searchName && !meter.client?.name?.toLowerCase().includes(searchName.toLowerCase())) {
                return false;
            }

            if (searchAddress && meter.address && !meter.address.toLowerCase().includes(searchAddress.toLowerCase())) {
                return false;
            }

            if (searchPhone && meter.client?.phone && !meter.client.phone.includes(searchPhone)) {
                return false;
            }

            if ((meter.rating || 0) < ratingRange[0] || (meter.rating || 0) > ratingRange[1]) {
                return false;
            }

            return true;
        });

        if (sortedInfo.columnKey && sortedInfo.order) {
            filtered = [...filtered].sort((a, b) => {
                if (sortedInfo.columnKey === 'rating') {
                    return sortedInfo.order === 'ascend'
                        ? (a.rating || 0) - (b.rating || 0)
                        : (b.rating || 0) - (a.rating || 0);
                }
                if (sortedInfo.columnKey === 'name') {
                    return sortedInfo.order === 'ascend'
                        ? (a.client?.name || '').localeCompare(b.client?.name || '')
                        : (b.client?.name || '').localeCompare(a.client?.name || '');
                }
                if (sortedInfo.columnKey === 'address') {
                    return sortedInfo.order === 'ascend'
                        ? (a.address || '').localeCompare(b.address || '')
                        : (b.address || '').localeCompare(a.address || '');
                }
                return 0;
            });
        }

        setFilteredData(filtered);
    };

    const resetFilters = () => {
        setSearchName('');
        setSearchAddress('');
        setSearchPhone('');
        if (baseData.length > 0) {
            const ratings = baseData.map(m => m.rating || 0);
            setRatingRange([Math.min(...ratings), Math.max(...ratings)]);
            setSortedInfo({ columnKey: 'rating', order: 'ascend' });
            const sorted = [...baseData].sort((a, b) => (a.rating || 0) - (b.rating || 0));
            setFilteredData(sorted);
        } else {
            setRatingRange([0, 100]);
            setFilteredData([]);
        }
    };

    const handleTableChange = (tablePagination: any, filters: any, sorter: any) => {
        if (!Array.isArray(sorter)) {
            setSortedInfo({
                columnKey: sorter.columnKey as string,
                order: sorter.order as 'ascend' | 'descend'
            });
        }

        if (onTableChange) {
            onTableChange(tablePagination);
        }

        applyFilters();
    };

    const exportToExcel = (type: 'xlsx' | 'csv') => {
        const dataToExport = filteredData.map(meter => ({
            "ФИО клиента": meter.client?.name,
            "Телефон": meter.client?.phone,
            "Email": meter.client?.email,
            "Рейтинг": meter.rating,
            "Адрес": meter.address,
            "Площадь (м²)": meter.meter_details?.square,
            "Тип помещения": meter.meter_details?.facility_type_name,
            "Количество жильцов": meter.meter_details?.residents_count,
            "Количество комнат": meter.meter_details?.rooms_count
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Счетчики");

        const mscDate = new Date();
        mscDate.setHours(mscDate.getHours() + 3);
        const fileName = `счетчики_${mscDate.toISOString().slice(0, 10)}`;

        XLSX.writeFile(workbook, `${fileName}.${type}`, { bookType: type });
    };

    const expandedRowRender = (record: Meter) => {
        return (
            <Card
                variant='borderless'
                style={{
                    background: '#fafafa',
                    borderRadius: 8,
                    width: '60%', // Ширина по содержимому
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }}
                styles={{
                    body: { padding: '16px 24px' }
                }}
            >
                <div style={{ display: 'flex', gap: 16 }}>
                    {/* Жилищные данные - левая карточка */}
                    <Card
                        title="Жилищные данные"
                        size="small"
                        variant='borderless'
                        style={{ flex: 1 }}
                    >
                        <List
                            size="small"
                            dataSource={[
                                { label: "Площадь", value: record.meter_details?.square || '-' },
                                { label: "Тип помещения", value: record.meter_details?.facility_type_name || '-' },
                                { label: "Количество жильцов", value: record.meter_details?.residents_count || '-' },
                                { label: "Количество комнат", value: record.meter_details?.rooms_count || '-' },
                            ]}
                            renderItem={item => (
                                <List.Item>
                                    <Text strong>{item.label}: </Text>
                                    <Text>{item.value} {item.label === "Площадь" ? 'м²' : ''}</Text>
                                </List.Item>
                            )}
                        />
                    </Card>

                    {/* Контактные данные - правая карточка */}
                    <Card
                        title="Контактные данные"
                        size="small"
                        variant='borderless'
                        style={{ flex: 1 }}
                    >
                        <List
                            size="small"
                            dataSource={[
                                {
                                    label: "Телефон",
                                    value: record.client?.phone ? (
                                        <a href={`tel:${record.client.phone}`}>{record.client.phone}</a>
                                    ) : '-'
                                },
                                {
                                    label: "Email",
                                    value: record.client?.email ? (
                                        <a href={`mailto:${record.client.email}`}>{record.client.email}</a>
                                    ) : '-'
                                },
                            ]}
                            renderItem={item => (
                                <List.Item>
                                    <Text strong>{item.label}: </Text>
                                    <Text>{item.value}</Text>
                                </List.Item>
                            )}
                        />
                    </Card>
                </div>

                {/* Статус проверки - под двумя карточками */}
                <div style={{ marginTop: 16 }}>
                    <Card title="Статус" size="small" variant='borderless'>
                        <Tag color={record.verified_status ? 'green' : 'orange'}>
                            {record.verified_status || 'Проверок не было'}
                        </Tag>
                    </Card>
                </div>
            </Card>
        );
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
        ],
    };

    const handleCreateRoute = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Выберите хотя бы одну точку для маршрута');
            return;
        }
        setIsRouteModalVisible(true);
    };

    const handleRemoveSelected = (meterId: number) => {
        setSelectedRowKeys(selectedRowKeys.filter(key => key !== meterId));
    };

    const getSelectedMeters = () => {
        return filteredData.filter(meter => selectedRowKeys.includes(meter.meter_id));
    };

    const handleCompleteTrip = () => {
        if (!selectedEmployee) {
            message.warning('Выберите сотрудника для выезда');
            return;
        }

        const trip: Trip = {
            employee: selectedEmployee,
            points: getSelectedMeters()
        };

        console.log('Сформирован выезд:', trip);
        message.success(`Выезд успешно сформирован для сотрудника ${selectedEmployee.name}`);
        setIsRouteModalVisible(false);
        setSelectedRowKeys([]);
        setSelectedEmployee(null);
    };

    const columns = [
        {
            title: 'Клиент',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            sorter: (a: Meter, b: Meter) => (a.client?.name || '').localeCompare(b.client?.name || ''),
            sortOrder: sortedInfo.columnKey === 'name' ? sortedInfo.order : null,
            render: (_: any, record: Meter) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text
                        onClick={() => router.push(`/profile?meterId=${record.meter_id}`)}
                        strong
                        style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                        {record.client?.name}
                    </Text>
                    <Text
                        type="secondary"
                        style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                        {record.address}
                    </Text>
                </div>
            )
        },
        {
            title: 'Действия',
            key: 'actions',
            width: '10%',
            render: (_: any, record: Meter) => (
                <Space>
                    <Button
                        icon={<LineChartOutlined />}
                        onClick={() => router.push(`/consumptionChart?meterId=${record.meter_id}`)}
                    >
                        График
                    </Button>
                    <Button
                        icon={<UserOutlined />}
                        onClick={() => {
                            if (IS_DEBUG_MODE) {
                                // В режиме отладки сохраняем данные в localStorage
                                localStorage.setItem(`meterProfile_${record.meter_id}`, JSON.stringify({
                                    client: record.client,
                                    meter_details: record.meter_details,
                                    address: record.address,
                                    rating: record.rating,
                                    verified_status: record.verified_status
                                }));
                            }
                            router.push(`/profile?meterId=${record.meter_id}`);
                        }}
                    >
                        Профиль
                    </Button>
                </Space>
            )
        },
        {
            title: 'Рейтинг',
            dataIndex: 'rating',
            key: 'rating',
            width: '10%',
            sorter: (a: Meter, b: Meter) => (a.rating || 0) - (b.rating || 0),
            sortOrder: sortedInfo.columnKey === 'rating' ? sortedInfo.order : null,
            render: (rating: number) => (
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            lineHeight: '32px',
                            borderRadius: '50%',
                            backgroundColor: getRowColor(rating),
                            color: 'white',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        {rating}
                    </div>
                </div>
            )
        }
    ];

    const getRatingSliderRange = () => {
        if (baseData.length === 0) return { min: 0, max: 100 };
        const ratings = baseData.map(m => m.rating || 0);
        return {
            min: Math.min(...ratings),
            max: Math.max(...ratings)
        };
    };

    const ratingSliderRange = getRatingSliderRange();

    const getRoutePoints = () => {
        return getSelectedMeters().map(meter => ({
            latitude: meter.geodata?.latitude || 0,
            longitude: meter.geodata?.longitude || 0,
            address: meter.address || 'Адрес не указан',
            accountId: meter.meter_id,
            buildingType: meter.meter_details?.facility_type_name || 'Не указан',
            roomsCount: meter.meter_details?.rooms_count || 0,
            residentsCount: meter.meter_details?.residents_count || 0,
            totalArea: meter.meter_details?.square || 0
        }));
    };

    return (
        <Layout style={{ background: "transparent", padding: 24 }}>
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
                    <Flex align="center" gap="middle" wrap>
                        <Input
                            placeholder="Поиск по ФИО"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            onPressEnter={applyFilters}
                            suffix={<SearchOutlined />}
                            style={{ width: 350 }}
                        />
                        <Input
                            placeholder="Поиск по адресу"
                            value={searchAddress}
                            onChange={(e) => setSearchAddress(e.target.value)}
                            onPressEnter={applyFilters}
                            suffix={<SearchOutlined />}
                            style={{ width: 350 }}
                        />
                        <Input
                            placeholder="Поиск по телефону"
                            value={searchPhone}
                            onChange={(e) => setSearchPhone(e.target.value)}
                            onPressEnter={applyFilters}
                            suffix={<PhoneOutlined />}
                            style={{ width: 350 }}
                        />
                    </Flex>

                    <Flex align="center" gap="middle" wrap>
                        <Dropdown.Button
                            icon={<DownloadOutlined />}
                            menu={{
                                items: [
                                    { key: 'xlsx', label: 'Экспорт в Excel' },
                                    { key: 'csv', label: 'Экспорт в CSV' }
                                ],
                                onClick: ({ key }) => exportToExcel(key as 'xlsx' | 'csv')
                            }}
                            onClick={() => exportToExcel('xlsx')}
                        >
                            Экспорт
                        </Dropdown.Button>
                    </Flex>
                </Flex>

                <Flex justify="space-between" align="center" wrap gap="middle">
                    <Space direction="vertical" style={{ width: 300 }}>
                        <Text style={{ color: "white" }}>Рейтинг: {ratingRange[0]} - {ratingRange[1]}%</Text>
                        <Slider
                            range
                            min={ratingSliderRange.min}
                            max={ratingSliderRange.max}
                            value={ratingRange}
                            onChange={(value) => setRatingRange(value as [number, number])}
                            onChangeComplete={applyFilters}
                        />
                    </Space>

                    <Flex gap="middle">
                        <Button onClick={resetFilters}>Сбросить фильтры</Button>
                        <Button
                            type="primary"
                            onClick={handleCreateRoute}
                            disabled={selectedRowKeys.length === 0}
                            className={selectedRowKeys.length > 0 ? "green-btn" : ""}
                        >
                            Сформировать выезд ({selectedRowKeys.length})
                        </Button>
                    </Flex>
                </Flex>

                <div ref={tableRef}>
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="meter_id"
                        bordered={false}
                        size="middle"
                        scroll={{ x: 'max-content' }}
                        expandable={{
                            expandedRowRender,
                            rowExpandable: () => true
                        }}
                        rowSelection={rowSelection}
                        loading={loading}
                        onRow={(record) => ({
                            style: {
                                cursor: 'pointer'
                            },
                        })}
                        components={{
                            body: {
                                cell: (props: any) => (
                                    <td
                                        {...props}
                                        style={{
                                            ...props.style,
                                            border: 'none',
                                            background: 'inherit !important',
                                        }}
                                    />
                                ),
                            },
                        }}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '25', '50', '100']
                        }}
                        onChange={handleTableChange}
                    />
                </div>
            </Space>

            <Modal
                title="Формирование маршрута"
                open={isRouteModalVisible}
                onCancel={() => setIsRouteModalVisible(false)}
                footer={null}
                width="90%"
                style={{ top: 20 }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Card title="Выбранные точки" variant='borderless'>
                        <List
                            dataSource={getSelectedMeters()}
                            renderItem={(meter) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            icon={<CloseOutlined />}
                                            onClick={() => handleRemoveSelected(meter.meter_id)}
                                            danger
                                        />
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar style={{ backgroundColor: getRowColor(meter.rating) }}>{meter.rating}</Avatar>}
                                        title={meter.client?.name}
                                        description={meter.address}
                                    />
                                    <div style={{ marginRight: 16 }}>
                                        <Tag color="blue">{meter.meter_details?.facility_type_name}</Tag>
                                        {meter.client?.phone && <Tag icon={<PhoneOutlined />}>{meter.client.phone}</Tag>}
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>

                    {/* Карта маршрута */}
                    <Card title="Карта маршрута" variant='borderless'>
                        <div style={{ height: '500px' }}>
                            {apiReady ? (
                                <MapRoute points={getRoutePoints()} />
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                    flexDirection: 'column'
                                }}>
                                    <h1>Загрузка карты...</h1>
                                    <div style={{
                                        width: '200px',
                                        height: '4px',
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: '2px',
                                        marginTop: '20px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: '#4CAF50',
                                            animation: 'loading 1.5s infinite ease-in-out',
                                            transformOrigin: 'left center'
                                        }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card variant='borderless'>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text strong>Сотрудник для выезда:</Text>
                            <Select
                                style={{ width: '100%' }}
                                placeholder="Выберите сотрудника"
                                options={employees.map(e => ({ value: e.employee_id, label: e.name }))}
                                onChange={(value) => {
                                    const emp = employees.find(e => e.employee_id === value);
                                    setSelectedEmployee(emp || null);
                                }}
                                loading={employeesLoading}
                            />

                            <Button
                                type="primary"
                                onClick={handleCompleteTrip}
                                style={{ marginTop: 16 }}
                                disabled={!selectedEmployee}
                            >
                                Закончить формирование выезда
                            </Button>
                        </Space>
                    </Card>
                </Space>
            </Modal>

            {/* <ProfileModal
                open={isProfileModalOpen}
                onCancel={() => setIsProfileModalOpen(false)}
                {...selectedProfileData}
            /> */}
        </Layout>
    );
};