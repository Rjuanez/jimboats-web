export type WeatherCondition =
  | "clear"
  | "fair"
  | "partlyCloudy"
  | "cloudy"
  | "fog"
  | "rain"
  | "snow"
  | "sleet"
  | "thunder"
  | "unknown";

export interface WeatherForecast {
  time: string;
  temperatureC: number;
  windKmh: number;
  humidityPercent: number;
  condition: WeatherCondition;
  night: boolean;
}

export interface SunTimes {
  date: string;
  sunrise: string;
  sunset: string;
}

export interface WeatherProvider {
  getSunTimes(): Promise<SunTimes | null>;
  getForecast(): Promise<WeatherForecast | null>;
}
