"use client";

import {useState, useRef, useEffect} from "react";
import {
    Button,
    Flex,
    Input,
    Layout,
    Space,
    Table,
    Slider,
    Dropdown,
    Typography,
    Modal,
    message,
    Tag,
    List,
    Card,
    Select
} from "antd";
import {
    DownloadOutlined,
    DownOutlined,
    SearchOutlined,
    LineChartOutlined,
    UserOutlined,
    CloseOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import '@ant-design/v5-patch-for-react-19';
import {useRouter} from "next/navigation";
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
}

interface Employee {
    id: number;
    name: string;
}

interface Trip {
    employee: Employee;
    points: Meter[];
}

const {Text} = Typography;

// Моковые данные сотрудников
const employees: Employee[] = [
    {id: 1, name: 'Иванов Алексей Петрович'},
    {id: 2, name: 'Петрова Мария Сергеевна'},
    {id: 3, name: 'Сидоров Дмитрий Иванович'},
    {id: 4, name: 'Кузнецова Ольга Владимировна'},
];

export const MeterTable = ({meters = []}: Props) => {
    const router = useRouter();
    const [baseData] = useState<Meter[]>(meters);
    const [filteredData, setFilteredData] = useState<Meter[]>(meters);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isRouteModalVisible, setIsRouteModalVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [apiReady, setApiReady] = useState(false);
    const tableRef = useRef<HTMLDivElement>(null);

    // Загрузка API Яндекс.Карт
    useEffect(() => {
        if (window._ymapsLoaded) {
            setApiReady(true);
            return;
        }

        if (!window._ymapsLoaded && !document.querySelector('script[src*="api-maps.yandex.ru"]')) {
            const script = document.createElement('script');
            script.src = `https://api-maps.yandex.ru/2.1/?apikey=e11435b1-e889-4652-9c53-6669d6fea872&lang=ru_RU&load=package.full`;
            script.onload = () => {
                window.ymaps.ready(() => {
                    window._ymapsLoaded = true;
                    setApiReady(true);
                });
            };
            document.head.appendChild(script);
        }

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
        if (rating < 20) return '#ff7875';
        if (rating < 40) return '#ff9c6e';
        if (rating < 60) return '#ffc069';
        if (rating < 80) return '#91d5ff';
        return '#b7eb8f';
    };

    const applyFilters = () => {
        let filtered = baseData.filter(meter => {
            if (searchName && !meter.name?.toLowerCase().includes(searchName.toLowerCase())) {
                return false;
            }

            if (searchAddress && meter.address && !meter.address.toLowerCase().includes(searchAddress.toLowerCase())) {
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
                        ? (a.name || '').localeCompare(b.name || '')
                        : (b.name || '').localeCompare(a.name || '');
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
        if (baseData.length > 0) {
            const ratings = baseData.map(m => m.rating || 0);
            setRatingRange([Math.min(...ratings), Math.max(...ratings)]);
            setSortedInfo({columnKey: 'rating', order: 'ascend'});
            const sorted = [...baseData].sort((a, b) => (a.rating || 0) - (b.rating || 0));
            setFilteredData(sorted);
        } else {
            setRatingRange([0, 100]);
            setFilteredData([]);
        }
    };

    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        if (!Array.isArray(sorter)) {
            setSortedInfo({
                columnKey: sorter.columnKey as string,
                order: sorter.order as 'ascend' | 'descend'
            });
        }
        applyFilters();
    };

    const exportToExcel = (type: 'xlsx' | 'csv') => {
        const dataToExport = filteredData.map(meter => ({
            "ФИО клиента": meter.name,
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

        XLSX.writeFile(workbook, `${fileName}.${type}`, {bookType: type});
    };

    const expandedRowRender = (record: Meter) => {
        return (
            <div style={{ padding: '16px 24px', background: '#fafafa' }}>
                <Flex gap="large" wrap>
                    <Space direction="vertical" style={{width: 250}}>
                        <Text strong>Площадь: {record.meter_details?.square || '-'} м²</Text>
                        <Text strong>Тип помещения: {record.meter_details?.facility_type_name || '-'}</Text>
                    </Space>
                    <Space direction="vertical" style={{width: 250}}>
                        <Text strong>Количество жильцов: {record.meter_details?.residents_count || '-'}</Text>
                        <Text strong>Количество комнат: {record.meter_details?.rooms_count || '-'}</Text>
                    </Space>
                    <Space direction="vertical">
                        <Text strong>Статус проверки: {record.verified_status || 'Не проверено'}</Text>
                    </Space>
                </Flex>
            </div>
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
            title: 'ФИО клиента',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            sorter: (a: Meter, b: Meter) => (a.name || '').localeCompare(b.name || ''),
            sortOrder: sortedInfo.columnKey === 'name' ? sortedInfo.order : null,
            render: (_: any, record: Meter) => (
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <Text onClick={() => router.push(`/profile?meterId=${record.meter_id}`)}
                        strong style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {record.name}
                    </Text>
                    <Text type="secondary" style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {record.address}
                    </Text>
                </div>
            )
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 200,
            render: (_: any, record: Meter) => (
                <Space>
                    <Button
                        icon={<LineChartOutlined/>}
                        onClick={() => router.push(`/consumptionChart?meterId=${record.meter_id}`)}
                    >
                        График
                    </Button>
                    <Button
                        icon={<UserOutlined/>}
                        onClick={() => router.push(`/profile?meterId=${record.meter_id}`)}
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
            width: 100,
            sorter: (a: Meter, b: Meter) => (a.rating || 0) - (b.rating || 0),
            sortOrder: sortedInfo.columnKey === 'rating' ? sortedInfo.order : null,
            render: (rating: number) => (
                <div
                    style={{
                        width: 32,
                        height: 32,
                        lineHeight: '32px',
                        borderRadius: '50%',
                        backgroundColor: getRowColor(rating),
                        color: '#000',
                        textAlign: 'center',
                        fontWeight: 'bold'
                    }}
                >
                    {rating}
                </div>
            )
        }
    ];

    const getRatingSliderRange = () => {
        if (baseData.length === 0) return {min: 0, max: 100};
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
        <Layout style={{background: "transparent", padding: 24}}>
            <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
                    <Flex align="center" gap="middle" wrap>
                        <Input
                            placeholder="Поиск по ФИО"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            onPressEnter={applyFilters}
                            suffix={<SearchOutlined/>}
                            style={{width: 250}}
                        />
                        <Input
                            placeholder="Поиск по адресу"
                            value={searchAddress}
                            onChange={(e) => setSearchAddress(e.target.value)}
                            onPressEnter={applyFilters}
                            suffix={<SearchOutlined/>}
                            style={{width: 250}}
                        />
                    </Flex>

                    <Flex align="center" gap="middle" wrap>
                            <Dropdown.Button
                                icon={<DownloadOutlined/>}
                                menu={{
                                    items: [
                                        {key: 'xlsx', label: 'Экспорт в Excel'},
                                        {key: 'csv', label: 'Экспорт в CSV'}
                                    ],
                                    onClick: ({key}) => exportToExcel(key as 'xlsx' | 'csv')
                                }}
                                onClick={() => exportToExcel('xlsx')}
                            >
                                Экспорт
                            </Dropdown.Button>
                    </Flex>
                </Flex>

                <Flex justify="space-between" align="center" wrap gap="middle">
                    <Space direction="vertical" style={{width: 300}}>
                        <Text style={{color: "white"}}>Рейтинг: {ratingRange[0]} - {ratingRange[1]}%</Text>
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
                        scroll={{x: 'max-content'}}
                        expandable={{
                            expandedRowRender,
                            rowExpandable: () => true
                        }}
                        rowSelection={rowSelection}
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
                            pageSize: 10,
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
                style={{top: 20}}
            >
                <Space direction="vertical" size="large" style={{width: '100%'}}>
                    <Card title="Выбранные точки" variant='borderless'>
                        <List
                            dataSource={getSelectedMeters()}
                            renderItem={(meter) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            icon={<CloseOutlined/>}
                                            onClick={() => handleRemoveSelected(meter.meter_id)}
                                            danger
                                        />
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={meter.name}
                                        description={meter.address}
                                    />
                                    <div style={{marginRight: 16}}>
                                        <Tag color="blue">{meter.meter_details?.facility_type_name}</Tag>
                                        <Tag color="green">{meter.rating}%</Tag>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>

                    {/* Карта маршрута */}
                    <Card title="Карта маршрута" variant='borderless'>
                        <div style={{height: '500px'}}>
                            {apiReady ? (
                                <MapRoute points={getRoutePoints()}/>
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
                        <Space direction="vertical" style={{width: '100%'}}>
                            <Text strong>Сотрудник для выезда:</Text>
                            <Select
                                style={{width: '100%'}}
                                placeholder="Выберите сотрудника"
                                options={employees.map(e => ({value: e.id, label: e.name}))}
                                onChange={(value) => {
                                    const emp = employees.find(e => e.id === value);
                                    setSelectedEmployee(emp || null);
                                }}
                            />

                            <Button
                                type="primary"
                                onClick={handleCompleteTrip}
                                style={{marginTop: 16}}
                                disabled={!selectedEmployee}
                            >
                                Закончить формирование выезда
                            </Button>
                        </Space>
                    </Card>
                </Space>
            </Modal>
        </Layout>
    );
};