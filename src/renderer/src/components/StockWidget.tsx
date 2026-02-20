import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, AreaChart, Area, Tooltip, YAxis } from 'recharts'
import {
  RiCloseLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiLineChartLine,
  RiScales3Line
} from 'react-icons/ri'

export default function StockWidget() {
  const [isVisible, setIsVisible] = useState(false)
  const [stock, setStock] = useState<any>(null)

  useEffect(() => {
    const handleEvent = (event: any) => {
      setStock(event.detail)
      setIsVisible(true)
    }
    window.addEventListener('show-stock', handleEvent)
    return () => window.removeEventListener('show-stock', handleEvent)
  }, [])

  if (!isVisible || !stock) return null

  // Colors
  const c1 = stock.isPositive1 ? '#10b981' : '#ef4444'
  const c2 = stock.isPositive2 ? '#3b82f6' : '#f59e0b' // Blue vs Orange for 2nd stock

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl">
          <p className="text-zinc-500 text-xs font-mono mb-2">{label}</p>
          <div className="flex flex-col gap-1">
            <p
              className="text-white text-sm font-bold font-mono"
              style={{ color: payload[0].stroke }}
            >
              {stock.symbol1}: {stock.currency} {payload[0].value}
            </p>
            {stock.isComparison && payload[1] && (
              <p
                className="text-white text-sm font-bold font-mono"
                style={{ color: payload[1].stroke }}
              >
                {stock.symbol2}: {stock.currency} {payload[1].value}
              </p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="fixed inset-0 z-[9050] flex items-center justify-center p-10 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-3xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              {stock.isComparison ? (
                <RiScales3Line className="text-zinc-400" size={24} />
              ) : (
                <RiLineChartLine className="text-zinc-400" size={24} />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-widest text-white uppercase font-mono">
                {stock.isComparison ? `${stock.symbol1} vs ${stock.symbol2}` : stock.symbol1}
              </h2>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-widest">
                REAL-TIME INTRADAY DATA
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        <div className="p-8 pb-4 flex items-end gap-8">
          {/* Ticker 1 Stats */}
          <div className="flex items-end gap-4">
            <h1
              className="text-5xl font-black text-white font-mono tracking-tighter"
              style={{ color: c1 }}
            >
              {stock.currentPrice1}
            </h1>
            <div className="flex flex-col pb-1">
              <span className="text-sm font-bold text-zinc-500 mb-1">{stock.symbol1}</span>
              <div
                className={`flex items-center gap-1 font-mono font-bold px-2 py-1 rounded-md text-xs`}
                style={{ backgroundColor: `${c1}33`, color: c1 }}
              >
                {stock.isPositive1 ? <RiArrowUpLine /> : <RiArrowDownLine />}
                {stock.percentChange1}%
              </div>
            </div>
          </div>

          {/* Ticker 2 Stats (If Comparison) */}
          {stock.isComparison && (
            <div className="flex items-end gap-4 border-l border-white/10 pl-8">
              <h1
                className="text-5xl font-black text-white font-mono tracking-tighter"
                style={{ color: c2 }}
              >
                {stock.currentPrice2}
              </h1>
              <div className="flex flex-col pb-1">
                <span className="text-sm font-bold text-zinc-500 mb-1">{stock.symbol2}</span>
                <div
                  className={`flex items-center gap-1 font-mono font-bold px-2 py-1 rounded-md text-xs`}
                  style={{ backgroundColor: `${c2}33`, color: c2 }}
                >
                  {stock.isPositive2 ? <RiArrowUpLine /> : <RiArrowDownLine />}
                  {stock.percentChange2}%
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full h-72 min-h-[250px] px-4 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stock.chartData}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c1} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={c1} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c2} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={c2} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip content={<CustomTooltip />} />
              <YAxis yAxisId="left" domain={['auto', 'auto']} hide />
              {stock.isComparison && (
                <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} hide />
              )}

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="price1"
                stroke={c1}
                strokeWidth={3}
                fill="url(#grad1)"
              />
              {stock.isComparison && (
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="price2"
                  stroke={c2}
                  strokeWidth={3}
                  fill="url(#grad2)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}
