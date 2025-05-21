"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Flex, Input, Layout, Space, Table, Slider, Dropdown, Typography, Modal, message, Tag } from "antd";
import { DownloadOutlined, DownOutlined, SearchOutlined, LineChartOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import '@ant-design/v5-patch-for-react-19';
import { useRouter } from "next/navigation";

interface Props {
    meters: Meter[];
}

const { Text } = Typography;

export const MeterTable = ({ meters = [] }: Props) => {
    const router = useRouter();
    const [baseData] = useState<Meter[]>(meters);
    const [filteredData, setFilteredData] = useState<Meter[]>(meters);
    const tableRef = useRef<HTMLDivElement>(null);

    // Состояние для сортировки
    const [sortedInfo, setSortedInfo] = useState<{
        columnKey?: string;
        order?: 'ascend' | 'descend';
    }>({
        columnKey: 'rating',
        order: 'ascend'
    });

    // Состояния для фильтров
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchAddress, setSearchAddress] = useState('');
    const [searchRegion, setSearchRegion] = useState('');
    const [ratingRange, setRatingRange] = useState<[number, number]>([0, 100]);
    const [consumptionRange, setConsumptionRange] = useState<[number, number]>([0, 10000]);
    const [squareRange, setSquareRange] = useState<[number, number]>([0, 200]);
    const [electricFilter, setElectricFilter] = useState<'all' | 'heating' | 'stove' | 'none'>('all');

    // Вычисляем диапазоны значений
    useEffect(() => {
        if (baseData.length > 0) {
            const ratings = baseData.map(m => m.rating);
            const consumptions = baseData.map(m => m.lastConsumption || 0);
            const squares = baseData.map(m => m.meterDetails?.square || 0);

            const minRating = Math.min(...ratings);
            const maxRating = Math.max(...ratings);
            const minConsumption = Math.min(...consumptions);
            const maxConsumption = Math.max(...consumptions);
            const minSquare = Math.min(...squares);
            const maxSquare = Math.max(...squares);

            setRatingRange([minRating, maxRating]);
            setConsumptionRange([minConsumption, maxConsumption]);
            setSquareRange([minSquare, maxSquare]);

            // Применяем сортировку при первой загрузке данных
            const sorted = [...baseData].sort((a, b) => a.rating - b.rating);
            setFilteredData(sorted);
        }
    }, [baseData]);

    useEffect(() => {
        applyFilters();
    }, [electricFilter]);

    // Функция для определения цвета строки на основе рейтинга
    const getRowColor = (rating: number) => {
        if (rating < 20) return '#ff7875'; // красный
        if (rating < 40) return '#ff9c6e'; // оранжевый
        if (rating < 60) return '#ffc069'; // желтый
        if (rating < 80) return '#91d5ff'; // синий
        return '#b7eb8f'; // зеленый
    };

    // Применяем все фильтры
    const applyFilters = () => {
        let filtered = baseData.filter(meter => {
            // Фильтр по ID
            if (searchId && !meter.id.toString().includes(searchId)) {
                return false;
            }

            // Фильтр по имени
            if (searchName && !meter.name.toLowerCase().includes(searchName.toLowerCase())) {
                return false;
            }

            // Фильтр по адресу
            if (searchAddress && meter.address
                    && !meter.address.toLowerCase().includes(searchAddress.toLowerCase())) {
                return false;
            }

            // Фильтр по региону
            if (searchRegion && meter.region
                    && !meter.region.toLowerCase().includes(searchRegion.toLowerCase())) {
                return false;
            }

            // Фильтр по рейтингу
            if (meter.rating < ratingRange[0] || meter.rating > ratingRange[1]) {
                return false;
            }

            // Фильтр по показаниям
            if ((meter.lastConsumption || 0) < consumptionRange[0] || 
                (meter.lastConsumption || 0) > consumptionRange[1]) {
                return false;
            }

            // Фильтр по квадратуре
            if (meter.meterDetails?.square && 
                (meter.meterDetails.square < squareRange[0] || 
                 meter.meterDetails.square > squareRange[1])) {
                return false;
            }

            // Фильтр по электрооборудованию
            if (electricFilter !== 'all') {
                const hasHeating = meter.meterDetails?.hasElectricHeating || false;
                const hasStove = meter.meterDetails?.hasElectricStove || false;
                
                if (electricFilter === 'heating' && !hasHeating) return false;
                if (electricFilter === 'stove' && !hasStove) return false;
                if (electricFilter === 'none' && (hasHeating || hasStove)) return false;
            }

            return true;
        });

        // Применяем сортировку к отфильтрованным данным
        if (sortedInfo.columnKey && sortedInfo.order) {
            filtered = [...filtered].sort((a, b) => {
                if (sortedInfo.columnKey === 'rating') {
                    return sortedInfo.order === 'ascend' 
                        ? a.rating - b.rating 
                        : b.rating - a.rating;
                }
                // Добавьте другие условия сортировки для других колонок при необходимости
                return 0;
            });
        }

        setFilteredData(filtered);
    };

    // Сброс всех фильтров
    const resetFilters = () => {
        setSearchId('');
        setSearchName('');
        setSearchAddress('');
        setSearchRegion('');
        if (baseData.length > 0) {
            const ratings = baseData.map(m => m.rating);
            const consumptions = baseData.map(m => m.lastConsumption || 0);
            const squares = baseData.map(m => m.meterDetails?.square || 0);
            
            setRatingRange([
                Math.min(...ratings),
                Math.max(...ratings)
            ]);
            setConsumptionRange([
                Math.min(...consumptions),
                Math.max(...consumptions)
            ]);
            setSquareRange([
                Math.min(...squares),
                Math.max(...squares)
            ]);

            // Восстанавливаем сортировку по умолчанию
            setSortedInfo({
                columnKey: 'rating',
                order: 'ascend'
            });
            const sorted = [...baseData].sort((a, b) => a.rating - b.rating);
            setFilteredData(sorted);
        } else {
            setRatingRange([0, 100]);
            setConsumptionRange([0, 10000]);
            setSquareRange([0, 200]);
            setFilteredData([]);
        }
        setElectricFilter('all');
    };

    // Обработчик изменения сортировки
    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        if (Array.isArray(sorter)) {
            // Множественная сортировка (если нужно)
        } else {
            setSortedInfo({
                columnKey: sorter.columnKey as string,
                order: sorter.order as 'ascend' | 'descend'
            });
        }
        applyFilters(); // Переприменяем фильтры с новой сортировкой
    };

    // Экспорт в Excel
    const exportToExcel = (type: 'xlsx' | 'csv') => {
        const dataToExport = filteredData.map(meter => ({
            "ID": meter.id,
            "ФИО клиента": meter.name,
            "Рейтинг": meter.rating,
            "Адрес": meter.address,
            "Последние показания": meter.lastConsumption,
            "Тариф": meter.tariffName,
            "Цена тарифа": meter.tariffPrice,
            "Регион": meter.region,
            "Площадь (м²)": meter.meterDetails?.square,
            "Электроотопление": meter.meterDetails?.hasElectricHeating ? "Да" : "Нет",
            "Электроплита": meter.meterDetails?.hasElectricStove ? "Да" : "Нет",
            "Тип помещения": meter.meterDetails?.facilityName,
            "Населенный пункт": meter.meterDetails?.settlementName
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Счетчики");

        var mscDate = new Date();
        mscDate.setHours(mscDate.getHours() + 3); // Moscow datetime

        const fileName = `счетчики_${mscDate.toISOString().slice(0, 10)}`;
        if (type === 'xlsx') {
            XLSX.writeFile(workbook, `${fileName}.xlsx`);
        } else {
            XLSX.writeFile(workbook, `${fileName}.csv`, { bookType: 'csv' });
        }
    };

    // Развернутая строка с дополнительной информацией
    const expandedRowRender = (record: Meter) => {
        return (
            <div style={{ padding: '16px 24px', background: '#fafafa' }}>
                <Space direction="vertical" size="middle">
                    <Flex gap="large">
                        <Space direction="vertical">
                            <Text strong>Площадь: {record.meterDetails?.square || '-'} м²</Text>
                            <Text strong>Тип помещения: {record.meterDetails?.facilityName || '-'}</Text>
                        </Space>
                        <Space direction="vertical">
                            <Text strong>Электроотопление: {record.meterDetails?.hasElectricHeating ? 'Да' : 'Нет'}</Text>
                            <Text strong>Электроплита: {record.meterDetails?.hasElectricStove ? 'Да' : 'Нет'}</Text>
                        </Space>
                        <Space direction="vertical">
                            <Text strong>Населенный пункт: {record.meterDetails?.settlementName || '-'}</Text>
                        </Space>
                    </Flex>
                </Space>
            </div>
        );
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 20,
            sorter: (a: Meter, b: Meter) => a.id - b.id,
            sortOrder: sortedInfo.columnKey === 'id' ? sortedInfo.order : null
        },
        {
            title: 'ФИО клиента',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            sorter: (a: Meter, b: Meter) => a.name.localeCompare(b.name),
            sortOrder: sortedInfo.columnKey === 'name' ? sortedInfo.order : null,
            render: (text: string) => (
                <Text strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {text}
                </Text>
            )
        },
        {
            title: 'Адрес',
            dataIndex: 'address',
            key: 'address',
            width: 250,
            sorter: (a: Meter, b: Meter) => (a.address || '').localeCompare(b.address || ''),
            sortOrder: sortedInfo.columnKey === 'address' ? sortedInfo.order : null,
            render: (text: string) => (
                <Text style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {text}
                </Text>
            )
        },
        {
            title: 'Рейтинг',
            dataIndex: 'rating',
            key: 'rating',
            width: 100,
            sorter: (a: Meter, b: Meter) => a.rating - b.rating,
            sortOrder: sortedInfo.columnKey === 'rating' ? sortedInfo.order : null,
            render: (rating: number) => <p>{rating}%</p>
        },
        {
            title: 'Последние показания',
            dataIndex: 'lastConsumption',
            key: 'lastConsumption',
            width: 150,
            sorter: (a: Meter, b: Meter) => (a.lastConsumption || 0) - (b.lastConsumption || 0),
            sortOrder: sortedInfo.columnKey === 'lastConsumption' ? sortedInfo.order : null,
            render: (value?: number) => (
                <Text strong>
                    {value || 0} кВт·ч
                </Text>
            )
        },
        {
            title: 'Тариф',
            key: 'tariff',
            width: 200,
            sorter: (a: Meter, b: Meter) => (a.tariffName || '').localeCompare(b.tariffName || ''),
            sortOrder: sortedInfo.columnKey === 'tariff' ? sortedInfo.order : null,
            render: (_: any, record: Meter) => (
                <Space direction="vertical" size="small">
                    <Text>{record.tariffName || '-'}</Text>
                    {record.tariffPrice && (
                        <Text type="secondary">{record.tariffPrice} ₽</Text>
                    )}
                </Space>
            )
        },
        {
            title: 'Регион',
            dataIndex: 'region',
            key: 'region',
            width: 150,
            sorter: (a: Meter, b: Meter) => (a.region || '').localeCompare(b.region || ''),
            sortOrder: sortedInfo.columnKey === 'region' ? sortedInfo.order : null,
            render: (text: string) => (
                <Text style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {text}
                </Text>
            )
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 120,
            render: (_: any, record: Meter) => (
                <Button 
                    icon={<LineChartOutlined />} 
                    onClick={() => router.push(`/consumptionChart?meterId=${record.id}`)}
                >
                    График потребления
                </Button>
            )
        }
    ];

    // Получаем минимальные и максимальные значения для слайдеров
    const getSliderRange = (data: Meter[], key: 'rating' | 'lastConsumption' | 'meterDetails.square') => {
        if (data.length === 0) return { min: 0, max: 100 };
        
        const values = data.map(m => {
            if (key === 'meterDetails.square') return m.meterDetails?.square || 0;
            if (key === 'lastConsumption') return m.lastConsumption || 0;
            return m.rating;
        });
        
        return {
            min: Math.min(...values),
            max: Math.max(...values)
        };
    };

    const ratingSliderRange = getSliderRange(baseData, 'rating');
    const consumptionSliderRange = getSliderRange(baseData, 'lastConsumption');
    const squareSliderRange = getSliderRange(baseData, 'meterDetails.square');

    return (
        <Layout style={{ background: "transparent", padding: 24 }}>
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
                    <Flex align="center" gap="middle" wrap>
                        <Input
                            placeholder="Поиск по ID"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            onPressEnter={applyFilters}
                            suffix={<SearchOutlined />}
                            style={{ width: 200 }}
                        />
                        <Input
                            placeholder="Поиск по ФИО"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            onPressEnter={applyFilters}
                            suffix={<SearchOutlined />}
                            style={{ width: 250 }}
                        />
                        <Input
                            placeholder="Поиск по адресу"
                            value={searchAddress}
                            onChange={(e) => setSearchAddress(e.target.value)}
                            onPressEnter={applyFilters}
                            suffix={<SearchOutlined />}
                            style={{ width: 250 }}
                        />
                        <Input
                            placeholder="Поиск по региону"
                            value={searchRegion}
                            onChange={(e) => setSearchRegion(e.target.value)}
                            onPressEnter={applyFilters}
                            suffix={<SearchOutlined />}
                            style={{ width: 200 }}
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

                    <Space direction="vertical" style={{ width: 300 }}>
                        <Text style={{color: "white"}}>Показания: {consumptionRange[0]} - {consumptionRange[1]} кВт·ч</Text>
                        <Slider
                            range
                            min={consumptionSliderRange.min}
                            max={consumptionSliderRange.max}
                            step={Math.max(1, Math.floor((consumptionSliderRange.max - consumptionSliderRange.min) / 100))}
                            value={consumptionRange}
                            onChange={(value) => setConsumptionRange(value as [number, number])}
                            onChangeComplete={applyFilters}
                        />
                    </Space>

                    <Space direction="vertical" style={{ width: 250 }}>
                        <Text style={{color: "white"}}>Площадь: {squareRange[0]} - {squareRange[1]} м²</Text>
                        <Slider
                            range
                            min={squareSliderRange.min}
                            max={squareSliderRange.max}
                            value={squareRange}
                            onChange={(value) => setSquareRange(value as [number, number])}
                            onChangeComplete={applyFilters}
                        />
                    </Space>

                    <Space direction="vertical" style={{ width: 200 }}>
                        <Text style={{color: "white"}}>Электрооборудование:</Text>
                        <Dropdown
                            menu={{
                                items: [
                                    { key: 'all', label: 'Все' },
                                    { key: 'heating', label: 'С электроотоплением' },
                                    { key: 'stove', label: 'С электроплитой' },
                                    { key: 'none', label: 'Без электрооборудования' }
                                ],
                                selectedKeys: [electricFilter],
                                onClick: ({ key }) => {
                                    setElectricFilter(key as any);
                                    applyFilters();
                                }
                            }}
                        >
                            <Button>
                                {{
                                    all: 'Все',
                                    heating: 'С электроотоплением',
                                    stove: 'С электроплитой',
                                    none: 'Без электрооборудования'
                                }[electricFilter]}
                                <DownOutlined />
                            </Button>
                        </Dropdown>
                    </Space>

                    <Button onClick={resetFilters}>Сбросить фильтры</Button>
                </Flex>

                <div ref={tableRef}>
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        bordered
                        size="middle"
                        scroll={{ x: 'max-content' }}
                        expandable={{
                            expandedRowRender,
                            rowExpandable: () => true
                        }}
                        onRow={(record) => ({
                            style: { 
                                background: getRowColor(record.rating),
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
        </Layout>
    );
};