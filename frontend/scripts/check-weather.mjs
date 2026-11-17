import assert from "node:assert/strict";
import "vue";

let scenario = 0;
const position = { coords: { latitude: 27.7172, longitude: 85.324 } };
const validResponse = (temperature = 20.6, code = 2, isDay = 1) => ({
  ok: true,
  json: async () => ({
    current: {
      temperature_2m: temperature,
      weather_code: code,
      wind_speed_10m: 8.3,
      is_day: isDay,
    },
  }),
});

async function setup({
  secure = true,
  supported = true,
  respond = async () => validResponse(),
} = {}) {
  const calls = { location: [], fetch: [], timers: new Map() };
  let timer = 0;
  globalThis.localStorage = { getItem: () => null, setItem() {} };
  globalThis.document = { documentElement: { dataset: {}, style: {} } };
  globalThis.window = {
    isSecureContext: secure,
    setInterval: (callback) => {
      calls.timers.set(++timer, callback);
      return timer;
    },
    clearInterval: (id) => calls.timers.delete(id),
    setTimeout: (callback) => {
      calls.timers.set(++timer, callback);
      return timer;
    },
    clearTimeout: (id) => calls.timers.delete(id),
  };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      geolocation: supported
        ? { getCurrentPosition: (...args) => calls.location.push(args) }
        : undefined,
    },
  });
  globalThis.fetch = async (...args) => {
    calls.fetch.push(args);
    return respond(...args);
  };
  const { useAmbience } = await import(
    `../src/composables/useAmbience.js?scenario=${++scenario}`
  );
  return { ...useAmbience(), calls };
}

const flush = () => new Promise((resolve) => setImmediate(resolve));

// Opening the site prompts once, waits for consent, and updates shared navbar state.
{
  const app = await setup();
  const cleanup = app.initialiseAmbience();
  assert.equal(app.calls.location.length, 1);
  assert.equal(
    app.calls.fetch.length,
    0,
    "Do not send a weather request before location is shared",
  );
  assert.equal(app.weatherLoading.value, true);
  await app.requestWeather();
  assert.equal(
    app.calls.location.length,
    1,
    "Do not duplicate an in-flight permission request",
  );
  assert.equal(app.calls.location[0][2].enableHighAccuracy, false);
  app.calls.location[0][0](position);
  await flush();
  const url = new URL(app.calls.fetch[0][0]);
  assert.equal(url.origin, "https://api.open-meteo.com");
  assert.equal(url.searchParams.get("latitude"), "27.72");
  assert.equal(url.searchParams.get("longitude"), "85.32");
  assert.equal(url.searchParams.get("temperature_unit"), "celsius");
  assert.equal(
    url.searchParams.get("current"),
    "temperature_2m,weather_code,wind_speed_10m,is_day",
  );
  assert.equal(app.weather.value.temperature, 21);
  assert.equal(app.weather.value.label, "Partly cloudy");
  assert.equal(app.weather.value.location, "Your location");
  assert.equal(app.weatherKind.value, "clouds");
  assert.equal(app.weatherIsNight.value, false);
  assert.equal(document.documentElement.dataset.weather, "clouds");
  assert.equal(app.weatherLoading.value, false);
  assert.equal(app.weatherError.value, "");
  app.cycleTheme();
  assert.equal(
    app.theme.value,
    "light",
    "Theme controls continue working with weather enabled",
  );
  cleanup();
  assert.equal(app.calls.timers.size, 0);
}

// Denial, unavailable positions, and timeouts never display invented temperatures.
for (const code of [1, 2, 3]) {
  const app = await setup();
  const pending = app.requestWeather();
  app.calls.location[0][1]({ code });
  await pending;
  assert.equal(app.calls.fetch.length, 0);
  assert.equal(app.weather.value.temperature, null);
  assert.equal(app.weatherKind.value, "unknown");
  assert.ok(
    app.weatherError.value.includes(
      code === 1
        ? "browser settings"
        : code === 3
          ? "timed out"
          : "could not be determined",
    ),
  );
  assert.equal(app.weatherLoading.value, false);
  // Retrying can recover once the visitor changes permissions or location becomes available.
  const retry = app.requestWeather();
  app.calls.location[1][0](position);
  await retry;
  assert.equal(app.weather.value.temperature, 21);
  assert.equal(app.weatherError.value, "");
}

for (const options of [{ secure: false }, { supported: false }]) {
  const app = await setup(options);
  await app.requestWeather();
  assert.equal(app.calls.location.length, 0);
  assert.equal(app.calls.fetch.length, 0);
  assert.equal(app.weather.value.temperature, null);
  assert.ok(app.weatherError.value);
  assert.equal(app.weatherLoading.value, false);
}

for (const respond of [
  async () => ({ ok: false }),
  async () => {
    throw new Error("Offline");
  },
  async () => ({
    ok: true,
    json: async () => ({
      current: { temperature_2m: null, weather_code: null },
    }),
  }),
]) {
  const app = await setup({ respond });
  const pending = app.requestWeather();
  app.calls.location[0][0](position);
  await pending;
  assert.equal(app.weather.value.label, "Weather unavailable");
  assert.equal(app.weather.value.temperature, null);
  assert.equal(app.weatherLoading.value, false);
  assert.equal(app.calls.timers.size, 0);
}

for (const [temperature, code, kind] of [
  [0, 0, "clear"],
  [-8.4, 75, "snow"],
  [22, 97, "storm"],
  [15, 48, "fog"],
  [12, 61, "rain"],
  [19, 999, "unknown"],
]) {
  const app = await setup({
    respond: async () => validResponse(temperature, code),
  });
  const pending = app.requestWeather();
  app.calls.location[0][0](position);
  await pending;
  assert.equal(app.weather.value.temperature, Math.round(temperature));
  assert.equal(app.weatherKind.value, kind);
}

// Visible tabs refresh without another prompt or clearing the active scene.
{
  const realNow = Date.now;
  let time = realNow();
  Date.now = () => time;
  const app = await setup();
  const cleanup = app.initialiseAmbience();
  try {
    app.calls.location[0][0](position);
    await flush();
    const tick = [...app.calls.timers.values()][0];
    tick();
    await flush();
    assert.equal(app.calls.fetch.length, 1, "Do not poll sooner than 15 minutes");
    time += 15 * 60 * 1000;
    document.hidden = true;
    tick();
    await flush();
    assert.equal(app.calls.fetch.length, 1, "Do not poll in a hidden tab");
    document.hidden = false;
    tick();
    assert.equal(app.weatherKind.value, "clouds", "Keep the active scene while refreshing");
    await flush();
    assert.equal(app.calls.fetch.length, 2);
    assert.equal(app.calls.location.length, 1, "Reuse the consented location for background updates");
  } finally {
    cleanup();
    Date.now = realNow;
  }
}

// Actual daylight governs the sky independently of the selected color theme.
{
  const app = await setup({ respond: async () => validResponse(10, 0, 0) });
  const pending = app.requestWeather();
  app.calls.location[0][0](position);
  await pending;
  app.cycleTheme();
  assert.equal(app.theme.value, "light");
  assert.equal(app.weatherIsNight.value, true);
}

// A slow weather service times out and clears loading state.
{
  const app = await setup({
    respond: (_, { signal }) =>
      new Promise((_, reject) => {
        signal.addEventListener("abort", () => reject(new Error("Aborted")), {
          once: true,
        });
      }),
  });
  const pending = app.requestWeather();
  app.calls.location[0][0](position);
  await flush();
  for (const timeout of app.calls.timers.values()) timeout();
  await pending;
  assert.equal(app.weatherLoading.value, false);
  assert.equal(app.weather.value.label, "Weather unavailable");
  assert.equal(app.calls.fetch[0][1].signal.aborted, true);
}

// Unmounting cancels fetches and prevents late location results from starting one.
{
  const app = await setup();
  const cleanup = app.initialiseAmbience();
  cleanup();
  app.calls.location[0][0](position);
  await flush();
  assert.equal(app.calls.fetch.length, 0);
  assert.equal(app.weatherLoading.value, false);
  assert.equal(app.calls.timers.size, 0);
}
{
  const app = await setup({
    respond: (_, { signal }) =>
      new Promise((_, reject) => {
        signal.addEventListener("abort", () => reject(new Error("Aborted")), {
          once: true,
        });
      }),
  });
  const cleanup = app.initialiseAmbience();
  app.calls.location[0][0](position);
  await flush();
  cleanup();
  await flush();
  assert.equal(app.calls.fetch[0][1].signal.aborted, true);
  assert.equal(app.weatherLoading.value, false);
  assert.equal(app.calls.timers.size, 0);
}

console.log(
  "Weather checks passed: startup permission, local conditions, retries, errors, timeouts, and cleanup.",
);
