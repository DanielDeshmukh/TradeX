import { useEffect, useState } from 'react';
import { usePatternFinderStore } from '../store/usePatternFinderStore';
import { remapSegmentsToTimestamps } from './usePatternMatcher';

export function usePatternOverlaySegments(candles) {
  const matchedSegments = usePatternFinderStore(state => state.matchedSegments);
  const [overlaySegments, setOverlaySegments] = useState([]);

  useEffect(() => {
    if (!matchedSegments?.length || !candles?.length) return;

    const transformed = remapSegmentsToTimestamps(matchedSegments, candles)
      .map(segment =>
        segment.map(([time, value]) => ({ time, value }))
      );

    setOverlaySegments(transformed);
  }, [matchedSegments, candles]);

  return overlaySegments;
}
