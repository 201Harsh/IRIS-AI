import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  RiSunFill,
  RiCloudyFill,
  RiShowersFill,
  RiSnowyFill,
  RiThunderstormsFill,
  RiMistFill,
  RiMoonClearFill,
  RiCloseLine,
  RiTempHotLine,
  RiWindyLine,
  RiDropLine
} from 'react-icons/ri'

interface WeatherData {
  city: string
  country: string
  temperature: number
  humidity: number
  windSpeed: number
  isDay: boolean
  condition: string
}

export default function WeatherWidget() {
  const [isVisible, setIsVisible] = useState(false)
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    const handleEvent = (event: any) => {
      setWeather(event.detail)
      setIsVisible(true)
    }
    window.addEventListener('show-weather', handleEvent)
    return () => window.removeEventListener('show-weather', handleEvent)
  }, [])

  if (!isVisible || !weather) return null

  let bgGradient = ''
  let WeatherIcon = RiSunFill
  let iconColor = ''

  if (!weather.isDay) {
    bgGradient = 'from-indigo-950 via-slate-900 to-black'
    WeatherIcon = weather.condition === 'Clear' ? RiMoonClearFill : RiCloudyFill
    iconColor = 'text-indigo-200'
  } else {
    switch (weather.condition) {
      case 'Clear':
        bgGradient = 'from-sky-400 via-blue-400 to-blue-300'
        WeatherIcon = RiSunFill
        iconColor = 'text-yellow-300 drop-shadow-[0_0_30px_rgba(253,224,71,0.8)]'
        break
      case 'Cloudy':
        bgGradient = 'from-slate-400 via-gray-400 to-slate-300'
        WeatherIcon = RiCloudyFill
        iconColor = 'text-white drop-shadow-xl'
        break
      case 'Rain':
        bgGradient = 'from-slate-700 via-slate-600 to-slate-500'
        WeatherIcon = RiShowersFill
        iconColor = 'text-blue-200 drop-shadow-md'
        break
      case 'Snow':
        bgGradient = 'from-slate-200 via-blue-100 to-white'
        WeatherIcon = RiSnowyFill
        iconColor = 'text-white drop-shadow-xl'
        break
      case 'Thunderstorm':
        bgGradient = 'from-slate-900 via-purple-900 to-slate-800'
        WeatherIcon = RiThunderstormsFill
        iconColor = 'text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]'
        break
      case 'Haze':
        bgGradient = 'from-stone-400 via-stone-300 to-stone-200'
        WeatherIcon = RiMistFill
        iconColor = 'text-stone-100 opacity-80'
        break
      default:
        bgGradient = 'from-sky-400 to-blue-300'
        WeatherIcon = RiSunFill
    }
  }

  return (
    <div className="fixed inset-0 z-9050 flex items-center justify-center p-10 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`relative w-full max-w-3xl aspect-2/1 rounded-3xl overflow-hidden shadow-2xl bg-linear-to-br ${bgGradient} transition-all duration-1000`}
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-6 right-6 z-50 p-3 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all"
        >
          <RiCloseLine size={24} />
        </button>

        <motion.div
          animate={{
            y: [0, -20, 0],
            scale: weather.condition === 'Clear' ? [1, 1.05, 1] : 1
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-20 -top-20 opacity-80 pointer-events-none"
        >
          <WeatherIcon className={`w-96 h-96 ${iconColor}`} />
        </motion.div>

        {weather.condition === 'Rain' && (
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay animate-pulse" />
        )}

        <div className="absolute inset-0 z-10 p-12 flex flex-col justify-between">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-md">
              {weather.city}
            </h1>
            <p className="text-lg text-white/80 font-bold uppercase tracking-widest mt-1 drop-shadow-sm">
              {weather.country}
            </p>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[8rem] leading-none font-black text-white tracking-tighter drop-shadow-xl">
                {Math.round(weather.temperature)}°
              </span>
              <span className="text-2xl text-white/90 font-bold uppercase tracking-widest drop-shadow-md ml-2">
                {weather.condition}
              </span>
            </div>

            <div className="flex gap-6 bg-black/20 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl">
              <div className="flex flex-col items-center gap-2">
                <RiWindyLine size={24} className="text-white/80" />
                <span className="text-white font-bold">{weather.windSpeed}</span>
                <span className="text-[10px] text-white/60 font-mono">KM/H</span>
              </div>

              <div className="w-px bg-white/20 rounded-full" />

              <div className="flex flex-col items-center gap-2">
                <RiDropLine size={24} className="text-white/80" />
                <span className="text-white font-bold">{weather.humidity}%</span>
                <span className="text-[10px] text-white/60 font-mono">HUMIDITY</span>
              </div>

              <div className="w-px bg-white/20 rounded-full" />

              <div className="flex flex-col items-center gap-2">
                <RiTempHotLine size={24} className="text-white/80" />
                <span className="text-white font-bold">{weather.isDay ? 'DAY' : 'NIGHT'}</span>
                <span className="text-[10px] text-white/60 font-mono">CYCLE</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
