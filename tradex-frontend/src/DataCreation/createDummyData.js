function generateRealisticCandles(startTime, numCandles = 100, intervalSeconds = 3600, initialPrice = 10.0) {
  const candles = [];
  let lastClose = initialPrice;
  let currentTime = startTime;
  let trendBias = (Math.random() - 0.5) * 0.05;

  for (let i = 0; i < numCandles; i++) {
    const open = parseFloat((lastClose + trendBias + (Math.random() - 0.5) * 0.2).toFixed(2));
    const high = parseFloat((open + Math.random() * 0.3).toFixed(2));
    const low = parseFloat((open - Math.random() * 0.3).toFixed(2));
    const close = parseFloat((low + Math.random() * (high - low)).toFixed(2));

    candles.push({
      time: currentTime, // ✅ This is in SECONDS, perfect.
      open,
      high,
      low,
      close
    });

    lastClose = close;
    currentTime += intervalSeconds;

    if (i % 20 === 0) {
      trendBias = (Math.random() - 0.5) * 0.05;
    }
  }

  return {
    candles, // ✅ Add this
    lastTimestamp: currentTime,
    lastPrice: lastClose
  };
}
