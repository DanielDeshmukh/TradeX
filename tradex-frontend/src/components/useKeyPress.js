import { useEffect } from 'react';

const useKeyPress = (combinations, handler) => {
  useEffect(() => {
    const onKeyDown = (e) => {
      const keyCombo = [
        e.ctrlKey ? 'Ctrl' : null,
        e.shiftKey ? 'Shift' : null,
        e.key.length === 1 ? e.key.toUpperCase() : e.key
      ].filter(Boolean).join(' + ');

      if (combinations.includes(keyCombo)) {
        e.preventDefault();
        handler(e);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [combinations, handler]);
};

export default useKeyPress;
