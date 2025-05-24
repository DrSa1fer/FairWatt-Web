"use client";

import { 
    Modal, 
    Descriptions, 
    Tag, 
    List, 
    Input, 
    Avatar,
    Space,
    message,
    Typography,
    Card,
    Divider,
    Button
} from "antd";
import { 
    PhoneOutlined, 
    MailOutlined, 
    HomeOutlined,
    EditOutlined,
    SaveOutlined,
    SearchOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { useState } from "react";

const { Text, Title } = Typography;
const { TextArea } = Input;

interface ProfileModalProps {
    open: boolean;
    onCancel: () => void;
    clientData?: ClientData;
    meterDetails?: MeterDetails;
    address?: string;
    rating?: number;
    verifiedStatus?: string | null;
}

export const ProfileModal = ({ 
    open, 
    onCancel,
    clientData = {},
    meterDetails = {},
    address = 'Не указан',
    rating = 0,
    verifiedStatus = 'Проверок не было'
}: ProfileModalProps) => {
    const [note, setNote] = useState<string>("");
    const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [externalData, setExternalData] = useState<{
        avito?: Array<{ url: string; link: string; description: string }>;
        fns?: { url: string };
        maps?: Array<{ url: string; name: string; purpose_name: string }>;
    } | null>(null);

    const getRatingColor = (rating: number) => {
        if (rating < 20) return '#ff4d4f';
        if (rating < 40) return '#ff7a45';
        if (rating < 60) return '#ffa940';
        if (rating < 80) return '#1890ff';
        return '#52c41a';
    };

    const handleCollectData = async () => {
        setIsLoading(true);
        try {
            // Здесь должна быть логика сбора данных с внешних сервисов
            // Для примера используем mock данные
            await new Promise(resolve => setTimeout(resolve, 1500));
            
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
            
            message.success('Данные успешно собраны');
        } catch (error) {
            message.error('Ошибка при сборе данных');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNote = () => {
        setIsEditingNote(false);
        message.success('Заметка сохранена');
    };

    return (
        <Modal
            title={`Профиль клиента: ${clientData.name || 'Не указано'}`}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
            centered
            closeIcon={<CloseOutlined />}
        >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Card title="Жилищные данные" size="small">
                    <Descriptions column={1}>
                        <Descriptions.Item label="Адрес">
                            <Space>
                                <HomeOutlined />
                                {address}
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Тип помещения">
                            {meterDetails.facility_type_name || 'Не указан'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Площадь">
                            {meterDetails.square ? `${meterDetails.square} м²` : 'Не указана'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Количество жильцов">
                            {meterDetails.residents_count || 'Не указано'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Количество комнат">
                            {meterDetails.rooms_count || 'Не указано'}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
                
                <Card title="Контактные данные" size="small">
                    <Descriptions column={1}>
                        <Descriptions.Item label="Телефон">
                            {clientData.phone ? (
                                <Space>
                                    <PhoneOutlined />
                                    <a href={`tel:${clientData.phone}`}>{clientData.phone}</a>
                                </Space>
                            ) : 'Не указан'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {clientData.email ? (
                                <Space>
                                    <MailOutlined />
                                    <a href={`mailto:${clientData.email}`}>{clientData.email}</a>
                                </Space>
                            ) : 'Не указан'}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card title="Рейтинг" size="small">
                    <Space size="middle">
                        <Avatar 
                            style={{ 
                                backgroundColor: getRatingColor(rating),
                                fontWeight: 'bold'
                            }}
                        >
                            {rating}
                        </Avatar>
                    </Space>
                </Card>
                
                <Card title="Статус" size="small">
                    <Space size="middle">
                        <Tag color={verifiedStatus ? 'green' : 'orange'}>
                            {verifiedStatus ? verifiedStatus : 'Проверок не было'}
                        </Tag>
                    </Space>
                </Card>
                
                <Card 
                    title="Внешние данные"
                    size="small"
                    extra={
                        !externalData && (
                            <Button 
                                type="primary" 
                                icon={<SearchOutlined />} 
                                onClick={handleCollectData}
                                loading={isLoading}
                                size="small"
                            >
                                Собрать информацию
                            </Button>
                        )
                    }
                >
                    {externalData ? (
                        <>
                            <Divider orientation="left">Авито</Divider>
                            {externalData.avito?.length ? (
                                <List
                                    size="small"
                                    dataSource={externalData.avito}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={<a href={item.url} target="_blank" rel="noopener noreferrer">{item.link}</a>}
                                                description={item.description}
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : <Text type="secondary">Нет данных с Авито</Text>}
                            
                            <Divider orientation="left">ФНС</Divider>
                            {externalData.fns ? (
                                <a href={externalData.fns.url} target="_blank" rel="noopener noreferrer">
                                    Ссылка на данные ФНС
                                </a>
                            ) : <Text type="secondary">Нет данных из ФНС</Text>}
                            
                            <Divider orientation="left">Карты</Divider>
                            {externalData.maps?.length ? (
                                <List
                                    size="small"
                                    dataSource={externalData.maps}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={<a href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a>}
                                                description={item.purpose_name}
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : <Text type="secondary">Нет данных с карт</Text>}
                        </>
                    ) : (
                        <Text type="secondary">
                            Нажмите "Собрать информацию" для получения данных из внешних источников
                        </Text>
                    )}
                </Card>
                
                <Card 
                    title="Заметка" 
                    size="small"
                    extra={
                        isEditingNote ? (
                            <Button 
                                type="primary" 
                                icon={<SaveOutlined />} 
                                onClick={handleSaveNote}
                                size="small"
                            >
                                Сохранить
                            </Button>
                        ) : (
                            <Button 
                                icon={<EditOutlined />} 
                                onClick={() => setIsEditingNote(true)}
                                size="small"
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
                        />
                    ) : (
                        <Text>{note || 'Нет заметки'}</Text>
                    )}
                </Card>
            </Space>
        </Modal>
    );
};