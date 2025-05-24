// Счетчик
interface Meter {
    meter_id: number,
    facility_id?: number,
    rating?: number, // от 0 до 100 (0 - плохо, 100 - хорошо)
    address?: string, // Город, ул. Улица, д. 1
    meter_details?: {
        square?: number, // Квадратура жилья
        facility_type_name?: string, // Наименование типа жилья (Частный, Многоквартирный, Прочий)
        residents_count?: number, // Количество жильцов
        rooms_count?: number // Количество комнат
    },
    client?: Client,
    geodata?: {
        latitude: number, // Широта
        longitude: number // Долгота
    }
    consumption?: Consumption[], // Показатели счетчиков
    is_first?: boolean | null, // Первая ли точка в маршруте
    verified_status?: string | null, // Статус проверки (если проверка была)
    note?: string // Заметка
}

interface ClientData {
    name?: string;
    phone?: string;
    email?: string;
}

interface MeterDetails {
    square?: number;
    residents_count?: number;
    rooms_count?: number;
    facility_type_name?: string;
}

// Клиент
interface Client {
    client_id?: number,
    name?: string, // ФИО клиента
    phone?: string, // Номер телефона клиента
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