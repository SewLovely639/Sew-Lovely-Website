import assert from "node:assert/strict";
import test from "node:test";
import { captureException } from "./monitoring";

test("admin monitoring is a safe no-op when no DSN is configured", async () => {
	const environment = process.env as Record<string, string | undefined>;
	const previous = environment.NEXT_PUBLIC_SENTRY_STOREFRONT_DSN;
	delete environment.NEXT_PUBLIC_SENTRY_STOREFRONT_DSN;
	try {
		assert.equal(await captureException(new Error("test")), false);
	} finally {
		if (previous === undefined) {
			delete environment.NEXT_PUBLIC_SENTRY_STOREFRONT_DSN;
		} else {
			environment.NEXT_PUBLIC_SENTRY_STOREFRONT_DSN = previous;
		}
	}
});
