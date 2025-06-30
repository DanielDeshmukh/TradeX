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


function normalizeY(points) {
  const ys = points.map(p => p[1]);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return points.map(([x, y]) => [x, (y - minY) / (maxY - minY || 1)]);
}

export const usePatternMatcher = () => {
  const matchPattern = useCallback((drawnPattern, chartSeries, accuracy = 0.5, debug = false) => {
    if (!drawnPattern.length || !chartSeries.length) return [];

    const normalizedDrawn = normalizeY(drawnPattern);
    const windowSize = normalizedDrawn.length;

    const matches = [];

    for (let i = 0; i <= chartSeries.length - windowSize; i++) {
      const windowRaw = chartSeries.slice(i, i + windowSize);
      const normalizedWindow = normalizeY(windowRaw);

      const dist = dtwDistance(normalizedDrawn, normalizedWindow);
      const maxDist = windowSize; 
      const score = 1 - dist / maxDist; 

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
