(() => {
  const btn = document.getElementById('throwBallBtn');
  const stage = document.querySelector('.campfire-stage');
  const benny = document.querySelector('.howto-benny');
  const mr = document.querySelector('.booiiii');
  if (!btn || !stage) return;

  let running = false;

  btn.addEventListener('click', () => {
    if (running) return;
    running = true;

    const stageRect = stage.getBoundingClientRect();
    const mrRect = mr ? mr.getBoundingClientRect() : stageRect;
    const bennyRect = benny ? benny.getBoundingClientRect() : stageRect;

    const origin = {
      x: mrRect.left - stageRect.left + mrRect.width * 0.65,
      y: mrRect.top - stageRect.top + mrRect.height * 0.45
    };
    const padding = 60;
    const target = {
      x: Math.max(
        padding,
        Math.min(stageRect.width - padding, padding + Math.random() * (stageRect.width - padding * 2))
      ),
      y: Math.max(
        padding,
        Math.min(stageRect.height - padding, padding + Math.random() * (stageRect.height - padding * 2))
      )
    };

    const ball = document.createElement('div');
    ball.className = 'benny-ball';
    ball.style.left = `${origin.x}px`;
    ball.style.top = `${origin.y}px`;
    stage.appendChild(ball);

    ball.animate(
      [
        { transform: 'translate(0, 0) scale(0.9)', opacity: 0 },
        { transform: `translate(${target.x - origin.x}px, ${target.y - origin.y}px) scale(1)`, opacity: 1 },
        { transform: `translate(${target.x - origin.x}px, ${target.y - origin.y + 10}px) scale(0.9)`, opacity: 0.95 }
      ],
      { duration: 900, easing: 'ease-out', fill: 'forwards' }
    );

    if (benny) {
      const bennyStart = {
        x: bennyRect.left - stageRect.left,
        y: bennyRect.top - stageRect.top
      };
      benny.animate(
        [
          { transform: `translate(0, 0)` },
          { transform: `translate(${target.x - bennyStart.x - 12}px, ${target.y - bennyStart.y - 12}px)` }
        ],
        { duration: 1100, easing: 'ease-in-out', fill: 'forwards' }
      );

      setTimeout(() => {
        benny.animate(
          [
            { transform: `translate(${target.x - bennyStart.x - 12}px, ${target.y - bennyStart.y - 12}px)` },
            { transform: `translate(${origin.x - bennyStart.x - 12}px, ${origin.y - bennyStart.y - 12}px)` },
            { transform: 'translate(0, 0)' }
          ],
          { duration: 1200, easing: 'ease-in-out', fill: 'forwards' }
        );
      }, 900);
    }

    setTimeout(() => {
      if (ball.parentNode) ball.parentNode.removeChild(ball);
      running = false;
    }, 2300);
  });
})();
