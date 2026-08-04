import { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

export function InteractiveCoin() {
  const coin = useRef(null);
  const reduced = useReducedMotion();

  const move = event => {
    if (reduced || !coin.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    coin.current.style.setProperty('--coin-rx', `${-y * 34}deg`);
    coin.current.style.setProperty('--coin-ry', `${x * 34}deg`);
    coin.current.style.setProperty('--coin-x', `${x * 13}px`);
    coin.current.style.setProperty('--coin-y', `${y * 13}px`);
  };

  const reset = () => {
    if (!coin.current) return;
    coin.current.style.setProperty('--coin-rx', '-7deg');
    coin.current.style.setProperty('--coin-ry', '12deg');
    coin.current.style.setProperty('--coin-x', '0px');
    coin.current.style.setProperty('--coin-y', '0px');
  };

  return <div className="coin-stage" onPointerMove={move} onPointerLeave={reset}>
    <div className="coin-3d" ref={coin} aria-label="Rotating interactive Daily DH 5 dirham coin">
      <div className="coin-spinner">
        <div className="coin-edge" aria-hidden="true" />
        <div className="coin-face">
          <img src="/assets/daily-dh-5-coin.png" alt="Original Daily DH 5 dirham coin design" draggable="false" />
          <span className="coin-shine" aria-hidden="true" />
        </div>
        <div className="coin-back" aria-hidden="true">
          <img src="/assets/daily-dh-5-coin.png" alt="" draggable="false" />
          <span className="coin-shine" />
        </div>
      </div>
    </div>
  </div>;
}
