# Security review — 2026-10-30

Reviewed release: `d3a8345e38de43cfbdc284cb06bdace0c5e6592a`.
The security fixes below accompany the minimal-footer release. Confirm the deployed headers after release.

## Findings and local fixes

| Priority | Finding | Change |
| --- | --- | --- |
| Medium | Faro's URL scrubber did not remove arbitrary exception messages or context. Browser error text can include fragments of rejected JSON or saved data. This was reproduced with a synthetic exception; there is no evidence of a historical leak. | Replace exception messages with a fixed description, allowlist error types, discard context/function/module text, and retain bounded source coordinates. External URLs retain only their origin. |
| Medium | The pinned third-party Faro script executed without a content integrity check. A changed CDN response would execute with the app's privileges, including access to local saves. | Add SHA-384 Subresource Integrity, anonymous CORS and no-referrer loading. A browser test confirms changed bytes are rejected while games still mount. |
| Low | Production responses lacked CSP, framing protection, MIME sniffing protection, an explicit referrer policy and permissions restrictions. HTTPS/HSTS were already present. | Add headers in `vercel.json`, disallow framing, objects and base URL changes, restrict resource/network sources, suppress referrers and disable unused device capabilities. |

Error diagnosis now relies on type and source coordinates rather than original messages. SDK upgrades must update both the pinned URL and its independently checked integrity hash.

## Scope and evidence

- Reviewed tracked application/build code, runtime HTML injection sites, URL entry handling, backup import/export, local storage, service-worker installation/update handling, third-party script loading and telemetry filtering.
- Credential-pattern scan covered 367 blobs reachable from local Git refs, including the local backup branch. No matching private keys, GitHub tokens, AWS access-key IDs or Stripe secret keys were found. Pattern scanning does not prove the absence of every possible secret.
- The Faro collector URL is a public browser ingestion address; the Google Forms responder link is public too. Neither is an administrative credential.
- Production checks returned 404 for `/.env`, `/.git/config`, `/vercel.json` and `/feedback-config.json`. The service worker had the expected revalidation header. Only read-only requests were made to production.
- Backup import limits total file size, entry count, key namespace, entry type and duplicate keys before restoration. User confirmation and rollback remain. Dynamic HTML reviewed used fixed content or validated/generated values; no exploitable injection path was identified in this review.
- Offline assets are same-origin, hash-verified before caching, and updates wait for a safe state in open tabs. Cross-origin SDK responses are not stored in the offline release cache.
- OSV's API returned no advisories for `@grafana/faro-web-sdk` version `2.13.0` on the review date. This is a package/version query, not a complete audit of every dependency bundled upstream. Vendored engine checksum/license gates passed.
- Full `python3 scripts/build.py` passed, including gameplay, offline, backup, telemetry, responsive, SEO and release checks. Added exception-privacy and SDK-integrity regression assertions.
- Isolated Chrome tests applied the proposed Vercel headers to the built release, loaded the real pinned SDK and intercepted every collector request locally. All 24 game navigation flows, utility dialogs and a guide worked; no normal-flow CSP violations occurred. Synthetic exception/query secrets were absent from outgoing payloads. An unauthorized external fetch was blocked. Modified SDK bytes failed integrity verification.

## Remaining work and boundaries

1. **Remove inline-script permission in a future focused change.** The current app uses inline scripts and event handlers, so `script-src 'unsafe-inline'` is retained for compatibility. The CSP limits sources and framing but does not provide strong protection against injected inline JavaScript. Migrate event handlers and externalize scripts or generate release-specific hashes before removing that permission. Inline styles are also currently required.
2. **Check private service settings.** This checkout cannot establish GitHub branch protection/account access, Vercel team/environment access, Grafana ingestion origin/rate limits, telemetry retention or dashboard permissions. The collector address is public, so ingestion abuse controls belong in Grafana's configuration.
3. **Deploy and verify headers afterward.** Local fixes do not change production. Browser tests emulate configured headers; confirm the actual headers on the app, guides and service worker after deployment. Returning offline clients can retain an older cached document until the existing safe-update flow completes.
4. **Existing telemetry cannot be retroactively scrubbed by this fix.** If historical error records contain sensitive text, review retention/deletion using authorized Grafana access. No such records were available for this review.

No critical or high-severity issue was identified within this scope. This was a source review and targeted browser/deployment check, not an exhaustive penetration test or an audit of private cloud accounts.

References: [MDN: Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity), [MDN: CSP script-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src), [Faro security advisories](https://github.com/grafana/faro-web-sdk/security), [OSV API](https://google.github.io/osv.dev/api/).
