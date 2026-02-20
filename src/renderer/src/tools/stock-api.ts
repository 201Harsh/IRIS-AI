const fetchYahooData = async (ticker: string) => {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1d&interval=5m`
  const response = await fetch(url)
  const data = await response.json()
  if (!data.chart.result) throw new Error(`Invalid ticker: ${ticker}`)
  return data.chart.result[0]
}

export const fetchStockData = async (ticker: string) => {
  try {
    const result = await fetchYahooData(ticker)
    const meta = result.meta
    const timestamps = result.timestamp || []
    const closes = result.indicators.quote[0].close || []

    const chartData: any[] = []
    let previousClose = meta.chartPreviousClose || closes[0]
    let currentPrice = meta.regularMarketPrice

    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] !== null && closes[i] !== undefined) {
        chartData.push({
          time: new Date(timestamps[i] * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          price1: parseFloat(closes[i].toFixed(2))
        })
      }
    }

    const change = currentPrice - previousClose
    const finalData = {
      isComparison: false,
      symbol1: meta.symbol,
      currency: meta.currency,
      currentPrice1: currentPrice.toFixed(2),
      percentChange1: ((change / previousClose) * 100).toFixed(2),
      isPositive1: change >= 0,
      chartData: chartData
    }

    window.dispatchEvent(new CustomEvent('show-stock', { detail: finalData }))
    return `The current stock price of ${ticker} is ${finalData.currentPrice1}. It is ${finalData.isPositive1 ? 'up' : 'down'} by ${Math.abs(Number(finalData.percentChange1))}% today.`
  } catch (error: any) {
    return `Failed to fetch data for ${ticker}.`
  }
}

export const compareStocks = async (ticker1: string, ticker2: string) => {
  try {
    const [res1, res2] = await Promise.all([fetchYahooData(ticker1), fetchYahooData(ticker2)])

    const chartMap = new Map()

    const t1 = res1.timestamp || []
    const c1 = res1.indicators.quote[0].close || []
    for (let i = 0; i < t1.length; i++) {
      if (c1[i]) {
        const timeStr = new Date(t1[i] * 1000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
        chartMap.set(timeStr, { time: timeStr, price1: parseFloat(c1[i].toFixed(2)) })
      }
    }

    const t2 = res2.timestamp || []
    const c2 = res2.indicators.quote[0].close || []
    for (let i = 0; i < t2.length; i++) {
      if (c2[i]) {
        const timeStr = new Date(t2[i] * 1000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
        if (chartMap.has(timeStr)) {
          chartMap.get(timeStr).price2 = parseFloat(c2[i].toFixed(2))
        } else {
          chartMap.set(timeStr, { time: timeStr, price2: parseFloat(c2[i].toFixed(2)) })
        }
      }
    }

    const change1 = res1.meta.regularMarketPrice - res1.meta.chartPreviousClose
    const change2 = res2.meta.regularMarketPrice - res2.meta.chartPreviousClose

    const finalData = {
      isComparison: true,
      symbol1: res1.meta.symbol,
      symbol2: res2.meta.symbol,
      currency: res1.meta.currency,
      currentPrice1: res1.meta.regularMarketPrice.toFixed(2),
      currentPrice2: res2.meta.regularMarketPrice.toFixed(2),
      percentChange1: ((change1 / res1.meta.chartPreviousClose) * 100).toFixed(2),
      percentChange2: ((change2 / res2.meta.chartPreviousClose) * 100).toFixed(2),
      isPositive1: change1 >= 0,
      isPositive2: change2 >= 0,
      chartData: Array.from(chartMap.values())
    }

    window.dispatchEvent(new CustomEvent('show-stock', { detail: finalData }))
    return `Comparing ${ticker1} and ${ticker2}. ${ticker1} is at ${finalData.currentPrice1}, and ${ticker2} is at ${finalData.currentPrice2}.`
  } catch (error: any) {
    return `Comparison failed. Please verify tickers ${ticker1} and ${ticker2}.`
  }
}
