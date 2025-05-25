// Счетчик
interface Meter {
    meter_id: number;
    facility_id: number;
    rating: number | null; // от 0 до 100 (0 - плохо, 100 - хорошо)
    address: string | null; // Город, ул. Улица, д. 1
    is_iot: boolean;
    consumption?: number[] | null;
    client: Client;
    meter_details: MeterDetail;
    geodata: Geodata | null;
    verified_status: string | null; // Статус проверки (если проверка была)
    is_first: boolean | null; // Первая ли точка в маршруте
    note?: string | null; // Заметка
}

interface MeterDetail {
    resident_count: number | null; // Количество жильцов
    room_count: number | null; // Количество комнат
    square: number | null; // Квадратура жилья
    facility_type_name: string | null; // Наименование типа жилья (Частный, Многоквартирный, Прочий)
    tariff_price?: number | null;
    tariff_type_name?: string | null; // Потребительский, Льготный, Коммерческий, Промышленный
}

interface Geodata {
    latitude: number, // Широта
    longitude: number // Долгота
}

// Клиент
interface Client {
    client_id?: number,
    name?: string, // ФИО клиента
    phone?: number, // Номер телефона клиента
    email?: string // Почта
}

// Потребление (на дату)
interface Consumption {
    consumption_id: number,
    date: Date, // Для ежемесячных - 01 каждого месяца (01.n.n)
    value: number // Значение показателей в киловаттах
}

// Выезд
interface Trip {
    trip_id?: number,
    employee: Employee, // Сотрудник (бригада)
    points: Meter[], // Точки для выезда
    from_time?: Date, // Время начала выезда
    to_time?: Date // Время завершения выезда
}

// Сотрудник
interface Employee {
    employee_id: number,
    name: string //ФИО сотрудника
}



interface TripInput {
    employee_id: number;
    from_time: string | null;
    to_time: string | null;
    points: TripPoint[];
}

interface TripPoint {
    facility_id: number;
    is_first: boolean;
}