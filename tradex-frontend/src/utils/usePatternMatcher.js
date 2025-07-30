import { useCallback } from 'react';


function dtwDistance(seqA, seqB) {
  const n = seqA.length;
  const m = seqB.length;
  const dtw = Array.from({ length: n + 1 }, () => Array(m + 1).fill(Infinity));
  dtw[0][0] = 0;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = Math.abs(seqA[i - 1][1] - seqB[j - 1][1]); 
      dtw[i][j] = cost + Math.min(
        dtw[i - 1][j],    
        dtw[i][j - 1],    
        dtw[i - 1][j - 1] 
      );
    }
  }

  return dtw[n][m];
}


function normalizeY(data) {
  if (!Array.isArray(data)) {
    console.error("normalizeY expected array, got:", data);
    return [];
  }

  const ys = data.map(([x, y]) => y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const range = maxY - minY || 1;

  return data.map(([x, y]) => [x, (y - minY) / range]);
}


export const usePatternMatcher = () => {
  const matchPattern = useCallback((drawnPattern, chartSeries, accuracy = 0.5, debug = false) => {
    if (!Array.isArray(drawnPattern) || !Array.isArray(chartSeries)) return [];
    if (!drawnPattern.length || !chartSeries.length) return [];

    const normalizedDrawn = normalizeY(drawnPattern);
    const windowSize = normalizedDrawn.length;

    const matches = [];

    for (let i = 0; i <= chartSeries.length - windowSize; i++) {
      const windowRaw = chartSeries.slice(i, i + windowSize);
      const normalizedWindow = normalizeY(windowRaw);

      const dist = dtwDistance(normalizedDrawn, normalizedWindow);
      const maxDist = windowSize; // Theoretical worst case
      const score = Math.max(0, 1 - dist / maxDist); // Clamp to 0+

      if (debug) {
        console.log(`Window ${i} → Score: ${score.toFixed(3)} (Threshold: ${accuracy})`);
      }

      if (score >= accuracy) {
        matches.push({ start: i, end: i + windowSize - 1 });
      }
    }

    return matches;
  }, []);

  return { matchPattern };
};


export const remapSegmentsToTimestamps = (segments, candles) => {
  if (!Array.isArray(segments) || !Array.isArray(candles)) return [];

  return segments.map(segment =>
    segment
      .map(([index, price]) => {
        const candle = candles[index];
        if (!candle || typeof candle.time === 'undefined') return null;
        return [candle.time, price];
      })
      .filter(Boolean)
  );
};
