// Счетчик
interface Meter {
    id: number,
    name: string, // ФИО клиента
    rating: number, // от 0 до 100 (на бэке от 0 до 1)
    address?: string, // Город, ул. Улица, д. 1
    lastConsumption?: number, // Последние показания счетчика
    tariffName?: string, // Название типа тарифа
    tariffPrice?: number, // Стоимость тарифа
    region?: string, // Название региона
    meterDetails?: {
        square?: number, // Квадратура жилья
        hasElectricHeating?: boolean,
        hasElectricStove?: boolean,
        facilityName: string,
        settlementName: string
    }
}