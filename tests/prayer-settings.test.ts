import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_PRAYER_TOOL_SETTINGS,
  normalizePrayerToolSettings,
} from "../lib/prayer-settings.ts";

test("prayer settings use safe defaults", () => {
  assert.deepEqual(normalizePrayerToolSettings(null), DEFAULT_PRAYER_TOOL_SETTINGS);
});

test("prayer settings clamp coordinates, notifications, and text", () => {
  const result = normalizePrayerToolSettings({
    defaultMethod: 999,
    defaultLatitude: 120,
    defaultLongitude: -220,
    defaultCityAr: "   ",
    defaultCityEn: "A".repeat(200),
    defaultSoundEnabled: false,
    defaultAdhanEnabled: true,
    defaultNotifyBefore: 80.4,
  });

  assert.equal(result.defaultMethod, 5);
  assert.equal(result.defaultLatitude, 90);
  assert.equal(result.defaultLongitude, -180);
  assert.equal(result.defaultCityAr, DEFAULT_PRAYER_TOOL_SETTINGS.defaultCityAr);
  assert.equal(result.defaultCityEn.length, 120);
  assert.equal(result.defaultSoundEnabled, false);
  assert.equal(result.defaultAdhanEnabled, true);
  assert.equal(result.defaultNotifyBefore, 60);
});

