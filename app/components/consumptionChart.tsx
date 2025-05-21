"use client";

import React, { useState, useEffect } from 'react';
import Plot, { PlotParams } from 'react-plotly.js';
import { Layout, Select, Space, Spin, Typography } from 'antd';

// Правильные типы для данных Plotly
type PlotlyData = PlotParams['data'][number];
type PlotlyLayout = PlotParams['layout'];

interface PriceChartProps {
    meterId: number;
    startDate: string;
    endDate: string;
}

interface ChartData {
    status: 'success' | 'error';
    data: {
        data: Array<{
            name: string;
            x: string[];
            y: (number | null)[];
            type: 'scatter';
            mode: 'lines' | 'lines+markers';
            line: {
                color: string;
                width: number;
                dash: 'solid' | 'dot' | 'dash' | 'longdash' | 'dashdot' | 'longdashdot';
            };
            visible: boolean;
            hovertemplate: string;
            text: string[];
        }>;
        layout: {
            title: string;
            xaxis: { title: string };
            yaxis: { title: string };
            hovermode: 'x' | 'y' | 'closest' | 'x unified' | 'y unified' | false;
            legend: {
                orientation: 'h' | 'v';
                yanchor: 'auto' | 'top' | 'middle' | 'bottom';
                y: number;
                xanchor: 'auto' | 'left' | 'center' | 'right';
                x: number;
            };
        };
    };
    products: string[];
    dates: string[];
}

export const ConsumptionChart: React.FC<PriceChartProps> = ({ meterId, startDate, endDate }) => {
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<string>('all');

    useEffect(() => {
        // TODO: API
        // const fetchData = async () => {
        //     try {
        //         setLoading(true);
        //         const request = {
        //             seller_id: sellerId,
        //             start_date: startDate,
        //             end_date: endDate
        //         };

        //         const data = await getPriceTrend(request);

        //         setChartData(data);
        //     } catch (err) {
        //         setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
        //     } finally {
        //         setLoading(false);
        //     }
        // };

        // Тестовые данные
        const fetchData = async () => {
            try {
                setLoading(true);

                // Вспомогательная функция для генерации массива дат (для тестовых данных)
                function generateDateTimeArray(startDate: string, endDate: string): string[] {
                    const dates: string[] = [];
                    const start = new Date(startDate);
                    const end = new Date(endDate);

                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                        const dateStr = d.toISOString().split('T')[0];
                        dates.push(`${dateStr} 08:00:00`);
                        dates.push(`${dateStr} 17:00:00`);
                    }

                    return dates;
                }

                // Тестовые данные, полностью соответствующие структуре API
                const mockData: ChartData = {
                    status: 'success',
                    data: {
                        data: [
                            // 1. Ручки
                            {
                                name: 'Ручка шариковая Erich Krause, синяя (базовая)',
                                x: generateDateTimeArray('2025-04-21', '2025-04-27'),
                                y: [89, 89, 92, 92, 95, 95, 92, 89, 89, 92, 95, 98, 98, 95],
                                type: 'scatter',
                                mode: 'lines+markers',
                                line: { color: '#1f77b4', width: 3, dash: 'solid' },
                                visible: true,
                                hovertemplate: "<b>%{text}</b><br>Дата: %{x}<br>Цена: %{y} руб<extra></extra>",
                                text: Array(14).fill('Ручка Erich Krause синяя (базовая)')
                            },
                            {
                                name: 'Ручка шариковая Erich Krause, синяя (со скидкой)',
                                x: generateDateTimeArray('2025-04-21', '2025-04-27'),
                                y: [79, 79, 82, 82, 85, 85, 82, 79, 79, 82, 85, 88, 88, 85],
                                type: 'scatter',
                                mode: 'lines+markers',
                                line: { color: '#1f77b4', width: 1.5, dash: 'dot' },
                                visible: true,
                                hovertemplate: "<b>%{text}</b><br>Дата: %{x}<br>Цена: %{y} руб<extra></extra>",
                                text: Array(14).fill('Ручка Erich Krause синяя (скидка)')
                            },

                            // 2. Карандаши
                            {
                                name: 'Карандаш Koh-i-Noor HB, 12 шт (базовая)',
                                x: generateDateTimeArray('2025-04-21', '2025-04-27'),
                                y: [450, 450, 470, 470, 460, 460, 455, 450, 440, 430, 420, 430, 440, 450],
                                type: 'scatter',
                                mode: 'lines+markers',
                                line: { color: '#ff7f0e', width: 3, dash: 'solid' },
                                visible: true,
                                hovertemplate: "<b>%{text}</b><br>Дата: %{x}<br>Цена: %{y} руб<extra></extra>",
                                text: Array(14).fill('Карандаш Koh-i-Noor HB (базовая)')
                            },

                            // 3. Блокноты
                            {
                                name: 'Блокнот Moleskine A5, клетка (базовая)',
                                x: generateDateTimeArray('2025-04-21', '2025-04-27'),
                                y: [1200, 1200, 1250, 1250, 1300, 1300, 1250, 1200, 1150, 1100, 1050, 1100, 1150, 1200],
                                type: 'scatter',
                                mode: 'lines+markers',
                                line: { color: '#2ca02c', width: 3, dash: 'solid' },
                                visible: true,
                                hovertemplate: "<b>%{text}</b><br>Дата: %{x}<br>Цена: %{y} руб<extra></extra>",
                                text: Array(14).fill('Блокнот Moleskine A5 (базовая)')
                            },

                            // 4. Степлеры
                            {
                                name: 'Степлер Brauberg Compact №10 (базовая)',
                                x: generateDateTimeArray('2025-04-21', '2025-04-27'),
                                y: [320, 320, 330, 330, 340, 340, 330, 320, 310, 300, 290, 300, 310, 320],
                                type: 'scatter',
                                mode: 'lines+markers',
                                line: { color: '#d62728', width: 3, dash: 'solid' },
                                visible: true,
                                hovertemplate: "<b>%{text}</b><br>Дата: %{x}<br>Цена: %{y} руб<extra></extra>",
                                text: Array(14).fill('Степлер Brauberg (базовая)')
                            },

                            // 5. Ластики
                            {
                                name: 'Ластик Koh-i-Noor, белый (базовая)',
                                x: generateDateTimeArray('2025-04-21', '2025-04-27'),
                                y: [65, 65, 70, 70, 75, 75, 70, 65, 60, 55, 50, 55, 60, 65],
                                type: 'scatter',
                                mode: 'lines+markers',
                                line: { color: '#9467bd', width: 3, dash: 'solid' },
                                visible: true,
                                hovertemplate: "<b>%{text}</b><br>Дата: %{x}<br>Цена: %{y} руб<extra></extra>",
                                text: Array(14).fill('Ластик Koh-i-Noor (базовая)')
                            },

                            // 6. Линейки
                            {
                                name: 'Линейка Attache 30см, пластик (базовая)',
                                x: generateDateTimeArray('2025-04-21', '2025-04-27'),
                                y: [85, 85, 90, 90, 95, 95, 90, 85, 80, 75, 70, 75, 80, 85],
                                type: 'scatter',
                                mode: 'lines+markers',
                                line: { color: '#8c564b', width: 3, dash: 'solid' },
                                visible: true,
                                hovertemplate: "<b>%{text}</b><br>Дата: %{x}<br>Цена: %{y} руб<extra></extra>",
                                text: Array(14).fill('Линейка Attache (базовая)')
                            },

                            // 7. Тонеры
                            {
                                name: 'Тонер HP 85A, черный (базовая)',
                                x: generateDateTimeArray('2025-04-21', '2025-04-27'),
                                y: [3200, 3200, 3300, 3300, 3400, 3400, 3300, 3200, 3100, 3000, 2900, 3000, 3100, 3200],
                                type: 'scatter',
                                mode: 'lines+markers',
                                line: { color: '#e377c2', width: 3, dash: 'solid' },
                                visible: true,
                                hovertemplate: "<b>%{text}</b><br>Дата: %{x}<br>Цена: %{y} руб<extra></extra>",
                                text: Array(14).fill('Тонер HP 85A (базовая)')
                            },

                            // 8. Скрепки
                            {
                                name: 'Скрепки Brauberg №3, 100шт (базовая)',
                                x: generateDateTimeArray('2025-04-21', '2025-04-27'),
                                y: [45, 45, 50, 50, 55, 55, 50, 45, 40, 35, 30, 35, 40, 45],
                                type: 'scatter',
                                mode: 'lines+markers',
                                line: { color: '#7f7f7f', width: 3, dash: 'solid' },
                                visible: true,
                                hovertemplate: "<b>%{text}</b><br>Дата: %{x}<br>Цена: %{y} руб<extra></extra>",
                                text: Array(14).fill('Скрепки Brauberg (базовая)')
                            },

                            // 9. Папки
                            {
                                name: 'Папка-скоросшиватель Attache А4 (базовая)',
                                x: generateDateTimeArray('2025-04-21', '2025-04-27'),
                                y: [120, 120, 130, 130, 140, 140, 130, 120, 110, 100, 90, 100, 110, 120],
                                type: 'scatter',
                                mode: 'lines+markers',
                                line: { color: '#bcbd22', width: 3, dash: 'solid' },
                                visible: true,
                                hovertemplate: "<b>%{text}</b><br>Дата: %{x}<br>Цена: %{y} руб<extra></extra>",
                                text: Array(14).fill('Папка Attache (базовая)')
                            },

                            // 10. Корректоры
                            {
                                name: 'Корректор Kores "Лента" 8м (базовая)',
                                x: generateDateTimeArray('2025-04-21', '2025-04-27'),
                                y: [150, 150, 160, 160, 170, 170, 160, 150, 140, 130, 120, 130, 140, 150],
                                type: 'scatter',
                                mode: 'lines+markers',
                                line: { color: '#17becf', width: 3, dash: 'solid' },
                                visible: true,
                                hovertemplate: "<b>%{text}</b><br>Дата: %{x}<br>Цена: %{y} руб<extra></extra>",
                                text: Array(14).fill('Корректор Kores (базовая)')
                            }
                        ],
                        layout: {
                            title: 'Динамика цен товаров',
                            xaxis: { title: 'Дата сбора данных' },
                            yaxis: { title: 'Цена (руб.)' },
                            hovermode: 'x unified',
                            legend: {
                                orientation: "h",
                                yanchor: "bottom",
                                y: 1.02,
                                xanchor: "right",
                                x: 1
                            }
                        }
                    },
                    products: [
                        'Ручка шариковая Erich Krause, синяя',
                        'Карандаш Koh-i-Noor HB, 12 шт',
                        'Блокнот Moleskine A5, клетка',
                        'Степлер Brauberg Compact №10',
                        'Ластик Koh-i-Noor, белый',
                        'Линейка Attache 30см, пластик',
                        'Тонер HP 85A, черный',
                        'Скрепки Brauberg №3, 100шт',
                        'Папка-скоросшиватель Attache А4',
                        'Корректор Kores "Лента" 8м'
                    ],
                    dates: generateDateTimeArray('2025-04-21', '2025-04-27')
                };

                // Имитация задержки сети
                await new Promise(resolve => setTimeout(resolve, 2000));

                setChartData(mockData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [meterId, startDate, endDate]);

    const getVisibleTraces = (): PlotlyData[] => {
        if (!chartData) return [];

        return chartData.data.data.map(trace => {
            const traceProduct = trace.name.split(' (')[0];
            return {
                ...trace,
                visible: selectedProduct === 'all' || traceProduct === selectedProduct,
                hovertemplate: "<b>%{text}</b><br>Дата: %{x}<br>Цена: %{y} руб<extra></extra>",
            };
        });
    };


    const getLayout = (): Partial<PlotlyLayout> => {
        if (!chartData) return {};

        return {
            ...chartData.data.layout,
            title: {
                text: selectedProduct === 'all'
                    ? 'Динамика цен всех товаров'
                    : `Динамика цен: ${selectedProduct}`,
                font: {
                    size: 18,
                    family: 'Arial, sans-serif',
                    color: '#333'
                },
                x: 0.5,
                xanchor: 'center',
                y: 0.95,
                yanchor: 'top'
            },
            margin: {
                t: 100,
                l: 80,
                r: 80,
                b: 80,
                pad: 10
            },
            yaxis: {
                ...chartData.data.layout.yaxis,
                title: {
                    text: 'Цена (руб.)',
                    standoff: 20,
                    font: {
                        size: 14
                    }
                },
                tickformat: 'd',
                gridcolor: '#f0f0f0',
                zerolinecolor: '#f0f0f0'
            },
            xaxis: {
                ...chartData.data.layout.xaxis,
                type: 'date',
                tickformat: '%d.%m.%Y',
                hoverformat: '%d.%m.%Y %H:%M',
                title: {
                    text: 'Дата и время сбора данных',
                    standoff: 20,
                    font: {
                        size: 14
                    }
                },
                gridcolor: '#f0f0f0',
                zerolinecolor: '#f0f0f0'
            },
            hoverlabel: {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                bordercolor: '#ddd',
                font: {
                    size: 12,
                    color: '#333'
                },
                namelength: -1  // показывать полное название
            },
            legend: {
                orientation: 'h',
                yanchor: 'bottom',
                y: -0.35,  // перемещаем легенду под график
                xanchor: 'center',
                x: 0.5,
                font: {
                    size: 10
                },
                //itemclick: false,
                //itemdoubleclick: false
            },
            plot_bgcolor: 'rgba(255, 255, 255, 0.9)',
            paper_bgcolor: 'rgba(255, 255, 255)', //'transparent' для прозрачного фона
            autosize: true,
            showlegend: true
        };
    };

    if (loading) {
        return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Spin size="large" />
        </div>
    }

    if (error) {
        return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <h1 style={{ color: "white" }}>Ошибка: {error}</h1>
        </div>;
    }
    if (!chartData || chartData.status === 'error') {
        return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <h1 style={{ color: "white" }}>Данные не найдены</h1>
        </div>;
    }

    return (
        <Layout className="price-chart-container" style={{ background: "transparent" }}>
            <Space className="chart-controls">
                <Typography.Text style={{ color: "white", fontSize: "16px" }}>Выберите товар:</Typography.Text>
                <Select
                    style={{ width: 300 }}
                    value={selectedProduct}
                    onChange={(value) => setSelectedProduct(value)}
                    options={[
                        { value: 'all', label: 'Все товары' },
                        ...chartData.products.map(product => ({
                            value: product,
                            label: product
                        }))
                    ]}
                />
            </Space>

            <Plot
                data={getVisibleTraces()}
                layout={getLayout()}
                useResizeHandler
                style={{ width: '100%', height: '70vh' }}
                config={{
                    displayModeBar: true,
                    responsive: true,
                }}
            />
        </Layout>
    );
};