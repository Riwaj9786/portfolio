<template>
  <section
    class="surface experience-art"
    aria-labelledby="experience-art-title"
  >
    <header class="art-header">
      <p class="eyebrow">A few sides of what I do</p>
      <h2 id="experience-art-title">Systems. People. Possibilities.</h2>
    </header>

    <div class="discipline-grid">
      <article class="discipline engineering">
        <div class="tile-heading">
          <h3 class="tile-number">
            <span aria-hidden="true">01 / </span>Backend Engineering
          </h3>
          <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
        </div>
        <svg
          viewBox="0 0 260 160"
          role="img"
          aria-label="Connected servers and a database representing backend engineering"
        >
          <path
            class="diagram-line flowing"
            d="M74 48H130V117H183M74 80H109V117H183M74 112H90V117H183"
          />
          <g class="server-stack">
            <rect x="24" y="33" width="62" height="27" rx="7" />
            <rect x="24" y="66" width="62" height="27" rx="7" />
            <rect x="24" y="99" width="62" height="27" rx="7" />
            <path d="M36 46H53M36 79H53M36 112H53" />
            <circle cx="73" cy="46" r="3" />
            <circle cx="73" cy="79" r="3" />
            <circle cx="73" cy="112" r="3" />
          </g>
          <g class="database">
            <path d="M171 59V112C171 132 231 132 231 112V59" />
            <ellipse cx="201" cy="59" rx="30" ry="12" />
            <path
              d="M171 84C171 103 231 103 231 84M171 104C171 123 231 123 231 104"
            />
          </g>
          <g class="code-chip">
            <rect x="109" y="17" width="57" height="30" rx="9" />
            <path
              d="M127 27L122 32L127 37M148 27L153 32L148 37M140 25L135 39"
            />
          </g>
          <circle class="signal" cx="130" cy="80" r="5" />
        </svg>
      </article>

      <article class="discipline management">
        <div class="tile-heading">
          <h3 class="tile-number">
            <span aria-hidden="true">02 / </span>Project Management
          </h3>
          <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
        </div>
        <svg
          viewBox="0 0 260 160"
          role="img"
          aria-label="A project board with tasks progressing toward completion"
        >
          <rect
            class="board-frame"
            x="22"
            y="23"
            width="216"
            height="117"
            rx="12"
          />
          <path class="diagram-line" d="M94 51V126M166 51V126" />
          <path class="board-header" d="M37 39H65M109 39H137M181 39H209" />
          <g class="task task-one">
            <rect x="34" y="56" width="47" height="29" rx="5" />
            <path d="M43 66H66M43 74H57" />
          </g>
          <g class="task task-two">
            <rect x="106" y="69" width="47" height="29" rx="5" />
            <path d="M115 79H138M115 87H129" />
          </g>
          <g class="task task-three">
            <rect x="178" y="55" width="47" height="29" rx="5" />
            <path d="M193 69L198 74L210 62" />
          </g>
          <g class="task task-muted">
            <rect x="34" y="95" width="47" height="29" rx="5" />
            <path d="M43 105H66M43 113H57" />
          </g>
          <path class="progress-track" d="M111 116H221" />
          <path class="progress-fill" d="M111 116H192" />
          <circle class="signal" cx="192" cy="116" r="4" />
        </svg>
      </article>

      <article class="discipline leadership">
        <div class="tile-heading">
          <h3 class="tile-number">
            <span aria-hidden="true">03 / </span>Leadership
          </h3>
          <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
        </div>
        <svg
          viewBox="0 0 260 160"
          role="img"
          aria-label="A team connected around a shared direction, representing leadership"
        >
          <circle class="orbit" cx="130" cy="82" r="58" />
          <path
            class="diagram-line flowing"
            d="M130 78L55 115M130 78L205 115M130 78V29"
          />
          <g class="person teammate">
            <circle cx="54" cy="99" r="12" />
            <path d="M33 136V129C33 109 75 109 75 129V136Z" />
          </g>
          <g class="person teammate">
            <circle cx="206" cy="99" r="12" />
            <path d="M185 136V129C185 109 227 109 227 129V136Z" />
          </g>
          <circle class="leader-halo" cx="130" cy="74" r="35" />
          <g class="person lead">
            <circle cx="130" cy="61" r="13" />
            <path d="M106 101V94C106 72 154 72 154 94V101Z" />
          </g>
          <g class="direction"><path d="M119 24L130 13L141 24M130 14V35" /></g>
          <circle class="spark" cx="40" cy="47" r="3" />
          <circle class="spark" cx="218" cy="42" r="3" />
        </svg>
      </article>

      <article class="discipline design">
        <div class="tile-heading">
          <h3 class="tile-number">
            <span aria-hidden="true">04 / </span>Graphic Design
          </h3>
          <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
        </div>
        <svg
          viewBox="0 0 260 160"
          role="img"
          aria-label="A vector design canvas with a Bézier curve, geometric shapes, and a color palette"
        >
          <path
            class="canvas-grid"
            d="M27 32H230M27 62H230M27 92H230M27 122H230M48 19V140M88 19V140M128 19V140M168 19V140M208 19V140"
          />
          <circle class="design-disc" cx="181" cy="61" r="33" />
          <path class="design-triangle" d="M157 118L197 51L234 118Z" />
          <path class="handle-line" d="M44 111L69 36M137 106L159 33" />
          <path class="bezier" d="M44 111C69 36 137 106 159 33" />
          <g class="anchor">
            <rect x="40" y="107" width="8" height="8" />
            <rect x="155" y="29" width="8" height="8" />
            <circle cx="69" cy="36" r="4" />
            <circle cx="137" cy="106" r="4" />
          </g>
          <g class="palette">
            <rect x="36" y="131" width="21" height="10" rx="3" />
            <rect x="62" y="131" width="21" height="10" rx="3" />
            <rect x="88" y="131" width="21" height="10" rx="3" />
            <rect x="114" y="131" width="21" height="10" rx="3" />
          </g>
        </svg>
      </article>
    </div>

    <footer class="art-footer">
      <span class="connection-mark" aria-hidden="true"
        ><i class="pi pi-sparkles"></i
      ></span>
      <p>
        Different disciplines.<br /><strong>One thoughtful approach.</strong>
      </p>
      <RouterLink to="/projects" aria-label="Explore my projects"
        >Explore my work <i class="pi pi-arrow-up-right" aria-hidden="true"></i
      ></RouterLink>
    </footer>
  </section>
</template>

<style scoped>
.experience-art {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: clamp(1.1rem, 3vw, 2rem);
  overflow: hidden;
  position: relative;
  background-image: radial-gradient(
    ellipse at 50% 48%,
    color-mix(in srgb, var(--primary) 9%, transparent),
    transparent 70%
  );
}
.art-header {
  margin-bottom: 1.5rem;
}
.art-header h2 {
  margin-top: 0.65rem;
  font-size: clamp(1.35rem, 2.3vw, 1.9rem);
  line-height: 1.2;
  font-weight: 750;
  letter-spacing: -0.04em;
  color: var(--ink);
}
.discipline-grid {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}
.discipline {
  --tile-color: var(--primary);
  border: 1px solid var(--line);
  border-radius: 1.2rem;
  padding: 1rem;
  background: color-mix(in srgb, var(--surface-solid) 75%, transparent);
  transition:
    transform 0.25s,
    border-color 0.25s;
}
.discipline:hover {
  transform: translateY(-3px);
  border-color: var(--tile-color);
}
.management {
  --tile-color: #299c92;
}
.leadership {
  --tile-color: #c88931;
}
.design {
  --tile-color: #c65e9d;
}
.tile-heading {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  justify-content: space-between;
  color: var(--tile-color);
}
.tile-number {
  font-family: ui-monospace, monospace;
  font-size: 0.65rem;
  line-height: 1.6;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.tile-heading i {
  font-size: 0.65rem;
  opacity: 0.65;
}
.discipline svg {
  width: 100%;
  height: auto;
  max-height: 130px;
  display: block;
  margin: 0.3rem 0 0.5rem;
  color: var(--tile-color);
  overflow: visible;
}
svg path,
svg rect,
svg circle,
svg ellipse {
  stroke-linecap: round;
  stroke-linejoin: round;
}
.diagram-line {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  opacity: 0.4;
}
.flowing {
  stroke-dasharray: 4 6;
  animation: signal-flow 5s linear infinite;
}
.server-stack rect,
.database path,
.database ellipse,
.code-chip rect {
  stroke: currentColor;
  stroke-width: 1.5;
  fill: var(--surface-solid);
}
.server-stack path,
.code-chip path {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}
.server-stack circle,
.signal {
  fill: currentColor;
}
.database path {
  fill: color-mix(in srgb, var(--tile-color) 10%, var(--surface-solid));
}
.code-chip rect {
  fill: color-mix(in srgb, var(--tile-color) 12%, var(--surface-solid));
}
.board-frame {
  fill: var(--surface-solid);
  stroke: currentColor;
  stroke-width: 1.2;
}
.board-header {
  stroke: currentColor;
  stroke-width: 4;
  opacity: 0.55;
}
.task rect {
  fill: color-mix(in srgb, var(--tile-color) 12%, var(--surface-solid));
  stroke: currentColor;
  stroke-opacity: 0.3;
}
.task path {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.task-three rect {
  fill: color-mix(in srgb, var(--tile-color) 25%, var(--surface-solid));
}
.task-muted {
  opacity: 0.45;
}
.progress-track,
.progress-fill {
  stroke: currentColor;
  stroke-width: 4;
  opacity: 0.15;
}
.progress-fill {
  opacity: 0.75;
}
.orbit {
  fill: none;
  stroke: currentColor;
  stroke-dasharray: 2 7;
  opacity: 0.25;
}
.person {
  fill: color-mix(in srgb, var(--tile-color) 14%, var(--surface-solid));
  stroke: currentColor;
  stroke-width: 1.5;
}
.leader-halo {
  fill: var(--surface-solid);
  stroke: currentColor;
  stroke-opacity: 0.2;
}
.lead {
  fill: color-mix(in srgb, var(--tile-color) 30%, var(--surface-solid));
}
.direction path {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.spark {
  fill: currentColor;
  opacity: 0.5;
}
.canvas-grid {
  fill: none;
  stroke: currentColor;
  opacity: 0.1;
}
.design-disc {
  fill: currentColor;
  opacity: 0.2;
}
.design-triangle {
  fill: currentColor;
  opacity: 0.4;
}
.handle-line {
  stroke: currentColor;
  stroke-width: 1;
  stroke-dasharray: 3 4;
  fill: none;
  opacity: 0.6;
}
.bezier {
  stroke: currentColor;
  stroke-width: 4;
  fill: none;
}
.anchor {
  fill: var(--surface-solid);
  stroke: currentColor;
  stroke-width: 1.5;
}
.palette rect:nth-child(1) {
  fill: #7650d6;
}
.palette rect:nth-child(2) {
  fill: #c65e9d;
}
.palette rect:nth-child(3) {
  fill: #e5b064;
}
.palette rect:nth-child(4) {
  fill: #68b4ab;
}
.art-footer {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border-top: 1px solid var(--line);
  padding-top: 1.25rem;
  margin-top: 1.4rem;
}
.connection-mark {
  display: grid;
  place-items: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  background: color-mix(in srgb, var(--primary) 10%, transparent);
  color: var(--primary);
  flex-shrink: 0;
}
.art-footer p {
  font-size: 0.7rem;
  line-height: 1.7;
  color: var(--muted);
}
.art-footer strong {
  font-weight: 650;
  color: var(--ink);
}
.art-footer a {
  margin-left: auto;
  color: var(--primary);
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}
.art-footer a:hover {
  text-decoration: underline;
}
.art-footer a:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 5px;
  border-radius: 3px;
}
.art-footer a i {
  margin-left: 0.3rem;
  font-size: 0.6rem;
}
@keyframes signal-flow {
  to {
    stroke-dashoffset: -40;
  }
}
@media (max-width: 420px) {
  .discipline {
    padding: 0.75rem;
    border-radius: 0.9rem;
  }
  .discipline-grid {
    gap: 0.6rem;
  }
  .tile-number {
    font-size: 0.6rem;
    letter-spacing: 0;
  }
  .art-footer {
    flex-wrap: wrap;
  }
  .art-footer a {
    width: 100%;
    margin-left: 3.4rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .flowing {
    animation: none;
  }
  .discipline {
    transition: none;
  }
  .discipline:hover {
    transform: none;
  }
}
</style>
