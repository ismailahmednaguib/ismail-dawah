import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizePushEndpoint,
  normalizePushSubscription,
} from "../lib/notifications/push.ts";

test("push subscription accepts a valid HTTPS endpoint and keys", () => {
  const result = normalizePushSubscription({
    endpoint: "https://push.example.test/send/abc",
    keys: {
      p256dh: "BElongBase64UrlKey_123456789",
      auth: "authToken_123456789",
    },
  });

  assert.deepEqual(result, {
    endpoint: "https://push.example.test/send/abc",
    p256dh: "BElongBase64UrlKey_123456789",
    auth: "authToken_123456789",
  });
});

test("push subscription rejects insecure, malformed, or credentialed endpoints", () => {
  assert.equal(normalizePushEndpoint("http://push.example.test/send/abc"), null);
  assert.equal(normalizePushEndpoint("not-a-url"), null);
  assert.equal(normalizePushEndpoint("https://user:pass@push.example.test/send"), null);
  assert.equal(
    normalizePushSubscription({
      endpoint: "https://push.example.test/send/abc",
      keys: { p256dh: "not valid", auth: "short" },
    }),
    null
  );
});
