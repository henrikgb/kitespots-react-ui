export interface MeteomaticsWeatherData{
    locationName: string;
    windSpeed10ms: WindSpeed10ms[];
    windDirection10ms: WindDirection10ms[];
    windGusts10ms: WindGusts10ms[];
    precipitation: Precipitation[];
}

export interface WindSpeed10ms{
    dates: DataValue[];
}

export interface WindDirection10ms{
    dates: DataValue[];
}

export interface WindGusts10ms{
    dates: DataValue[];
}

export interface Precipitation{
    dates: DataValue[];
}

export interface DataValue{
    date: string;
    value: number;
}
