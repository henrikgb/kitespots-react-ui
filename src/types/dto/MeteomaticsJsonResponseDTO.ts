export interface MeteomaticsJsonResponseDTO {
    version: string;
    user: string;
    dateGenerated: string;
    status: string;
    data: DataItem[];
}

export interface DataItem {
    parameter: string;
    coordinates: Coordinate[];
}

export interface Coordinate {
    lat: number;
    lon: number;
    dates: DateValue[];
}

export interface DateValue {
    date: string;
    value: number;
}