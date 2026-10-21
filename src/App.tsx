import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Star,
  RefreshCw,
  Wind,
  Droplets,
  Calendar,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Compass,
  AlertCircle,
  Clock,
  MapPin,
  Check
} from 'lucide-react';

const CITIES = [
  { id: 'hanoi', name: 'Hà Nội', region: 'Miền Bắc', lat: 21.0285, lon: 105.8542 },
  { id: 'haiphong', name: 'Hải Phòng', region: 'Miền Bắc', lat: 20.8449, lon: 106.6881 },
  { id: 'hue', name: 'Huế', region: 'Miền Trung', lat: 16.4637, lon: 107.5909 },
  { id: 'danang', name: 'Đà Nẵng', region: 'Miền Trung', lat: 16.0544, lon: 108.2022 },
  { id: 'nhatrang', name: 'Nha Trang', region: 'Miền Trung', lat: 12.2388, lon: 109.1967 },
  { id: 'dalat', name: 'Đà Lạt', region: 'Tây Nguyên', lat: 11.9404, lon: 108.4583 },
  { id: 'hcm', name: 'TP. Hồ Chí Minh', region: 'Miền Nam', lat: 10.8231, lon: 106.6297 },
  { id: 'cantho', name: 'Cần Thơ', region: 'Miền Nam', lat: 10.0452, lon: 105.7469 },
];

interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    weatherCode: number;
    time: string;
  };
  daily: {
    time: string[];
    weatherCode: number[];
    tempMax: number[];
    tempMin: number[];
  };
}

const getWeatherDetails = (code: number) => {
  switch (true) {
    case code === 0:
      return { text: 'Trời quang', icon: Sun };
    case code >= 1 && code <= 3:
      return { text: 'Có mây', icon: CloudSun };
    case code === 45 || code === 48:
      return { text: 'Sương mù', icon: CloudFog };
    case code >= 51 && code <= 67:
      return { text: 'Mưa rào nhẹ', icon: CloudRain };
    case code >= 71 && code <= 77:
      return { text: 'Tuyết rơi', icon: CloudSnow };
    case code >= 80 && code <= 82:
      return { text: 'Mưa rào lớn', icon: Cloud };
    case code >= 95:
      return { text: 'Dông bão', icon: CloudLightning };
    default:
      return { text: 'Không xác định', icon: Sun };
  }
};

export default function App() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('fav_cities');
    return saved ? JSON.parse(saved) : ['hanoi', 'hcm'];
  });
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('fav_cities', JSON.stringify(favorites));
  }, [favorites]);

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FBangkok`
      );
      if (!res.ok) throw new Error('Không thể kết nối tới máy chủ thời tiết');
      const data = await res.json();
      setWeatherData({
        current: {
          temp: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          windDirection: data.current.wind_direction_10m,
          weatherCode: data.current.weather_code,
          time: data.current.time,
        },
        daily: {
          time: data.daily.time,
          weatherCode: data.daily.weather_code,
          tempMax: data.daily.temperature_2m_max,
          tempMin: data.daily.temperature_2m_min,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity.lat, selectedCity.lon);
  }, [selectedCity]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const convertTemp = (tempC: number) => {
    return unit === 'C' ? tempC : Math.round((tempC * 9) / 5 + 32);
  };

  const filteredCities = useMemo(() => {
    return CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.region.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const weatherDetails = weatherData
    ? getWeatherDetails(weatherData.current.weatherCode)
    : null;
  const WeatherIcon = weatherDetails?.icon || Sun;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Thời Tiết Việt Nam</h1>
            <p className="text-slate-500 text-xs mt-0.5">Dữ liệu thời tiết tối giản trực tuyến</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-lg flex border border-slate-200">
              <button
                onClick={() => setUnit('C')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  unit === 'C' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setUnit('F')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  unit === 'F' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                °F
              </button>
            </div>

            <button
              onClick={() => fetchWeather(selectedCity.lat, selectedCity.lon)}
              disabled={loading}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 text-slate-700 transition-colors"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[520px]">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm thành phố..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredCities.map((city) => {
                const isFav = favorites.includes(city.id);
                const isSelected = selectedCity.id === city.id;
                return (
                  <div
                    key={city.id}
                    onClick={() => setSelectedCity(city)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                      <div>
                        <div className="font-medium text-xs flex items-center gap-1">
                          {city.name}
                          {isSelected && <Check className="w-3 h-3 text-sky-400" />}
                        </div>
                        <div className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>{city.region}</div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => toggleFavorite(city.id, e)}
                      className="p-1 rounded hover:bg-black/10 transition-colors"
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {error ? (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-2 text-red-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : loading || !weatherData ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[350px]">
                <RefreshCw className="w-6 h-6 animate-spin text-slate-400 mb-2" />
                <p className="text-slate-500 text-xs">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {selectedCity.region}
                      </span>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedCity.name}</h2>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(weatherData.current.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div className="flex items-center gap-4">
                      <WeatherIcon className="w-16 h-16 text-slate-700 shrink-0" />
                      <div>
                        <div className="text-5xl font-light text-slate-900">
                          {convertTemp(weatherData.current.temp)}°
                        </div>
                        <div className="text-xs font-medium text-slate-500 mt-1">
                          {weatherDetails?.text}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      <div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Droplets className="w-3 h-3 text-slate-400" /> Độ ẩm
                        </div>
                        <div className="text-sm font-semibold text-slate-800 mt-0.5">{weatherData.current.humidity}%</div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Wind className="w-3 h-3 text-slate-400" /> Gió
                        </div>
                        <div className="text-sm font-semibold text-slate-800 mt-0.5">{weatherData.current.windSpeed} km/h</div>
                      </div>

                      <div className="col-span-2 pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Compass className="w-3 h-3 text-slate-400" /> Hướng gió
                        </div>
                        <div className="text-xs font-medium text-slate-800 mt-0.5">{weatherData.current.windDirection}°</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Dự báo 7 ngày tới</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                    {weatherData.daily.time.map((time, idx) => {
                      const code = weatherData.daily.weatherCode[idx];
                      const dayDetails = getWeatherDetails(code);
                      const DayIcon = dayDetails.icon;
                      const dateObj = new Date(time);
                      const dayName =
                        idx === 0
                          ? 'Hôm nay'
                          : dateObj.toLocaleDateString('vi-VN', { weekday: 'short' });

                      return (
                        <div
                          key={time}
                          className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col items-center text-center space-y-1.5"
                        >
                          <span className="text-[11px] font-medium text-slate-500">{dayName}</span>
                          <DayIcon className="w-6 h-6 text-slate-700 my-1" />
                          <span className="text-[10px] text-slate-500 line-clamp-1">{dayDetails.text}</span>
                          <div className="text-[11px] font-semibold pt-1.5 border-t border-slate-200 w-full flex justify-center gap-1">
                            <span className="text-slate-900">{convertTemp(weatherData.daily.tempMax[idx])}°</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-400">{convertTemp(weatherData.daily.tempMin[idx])}°</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}