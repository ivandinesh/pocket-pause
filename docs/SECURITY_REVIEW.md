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

## Follow-up setup audit and implementation plan — 2026-10-30

Reviewed code: `15ff1895fe9957e4bd6a56aef14266c6e5764fd0`. This follow-up used source inspection, authenticated read-only GitHub API calls, production HTTP/TLS checks and an isolated local browser reproducer. Only this report was changed; no application, deployment or account settings were changed. No dedicated security-audit skill is installed in the available skill catalog.

### Verified setup

- Production now contains application version `15ff1895fe99`, the minimal footer and the SDK integrity attribute. The app, Sudoku guide and service worker serve CSP, `nosniff`, framing protection, no-referrer and the permissions policy. HTTP and the apex domain redirect to canonical HTTPS. TLS certificate verification succeeded; the connection negotiated TLS 1.3. The certificate inspected expires on 23 January 2027. The service worker retains its revalidation header.
- GitHub `main` is unprotected and the repository has no rulesets. No GitHub Actions workflow is tracked. Vercel runs the project's build/test command during deployment, but this is not an independent required check before updating `main`.
- GitHub secret scanning and secret-scanning push protection are enabled. The authenticated API returned zero open secret-scanning alerts. This does not prove that no secret exists.
- Dependabot alerts are disabled, automatic Dependabot security updates are disabled, and the code-scanning API reports no analysis. Actions default to read-only token permissions and cannot approve pull requests, which are good defaults. The repository allows all actions and does not require SHA pinning; this becomes relevant when workflows are introduced.
- A read-only Faro CORS preflight accepted the production origin and returned no CORS permission for an unrelated test origin. No telemetry event was submitted. CORS limits browser access; it is not authentication against clients that can forge an Origin header. Rate, retention and billing controls were not accessible.
- DNS CAA records restrict issuance to the listed Google Trust Services, Sectigo and Let's Encrypt authorities. Registrar access, DNS-provider access, account MFA, DNSSEC configuration and takeover recovery were not inspected.
- No exposed environment or Git configuration file was found at the production paths checked. The runtime is a static application, with no application-owned login, payment or database service identified.

### New reproducible finding: backup rollback can erase progress

**Medium data-integrity risk; local failure scenario, not a demonstrated remote attack.** In `pwa/client.js`, the restore handler assigns `previous = snapshot()` inside the same `try` as destructive replacement. If that initial snapshot throws, `previous` remains undefined, but the `catch` still enumerates and deletes existing save keys before iterating `previous || []`.

An isolated Chrome test seeded an original save, selected a structurally valid backup, then made the canary's first `Storage.getItem` call throw once. After confirming restore, the UI reported a failed restore and the original canary was absent. Only disposable browser storage was affected. This extends the earlier rollback checks, which covered write failure after a successful snapshot.

### Implementation sequence

| Order | Scope | Concrete change | Acceptance criteria |
| --- | --- | --- | --- |
| 1 | Backup integrity | Abort immediately if the pre-restore snapshot cannot be read. Track whether mutation actually began; only roll back from a complete snapshot. Distinguish aborted, restored and incomplete-recovery outcomes in the existing local UI. | A read failure before mutation preserves every existing key byte-for-byte. Write/delete/quota failure restores the original snapshot when storage permits. Partial recovery is stated accurately, without claiming success. Existing valid backups still restore and survive reload. |
| 2 | Save validation and concurrent tabs | Add bounded, per-game save validators before replacement; use a registry of supported keys with explicit legacy migration, rather than trusting every value under a prefix. Reject dangerous object keys, malformed shapes and invalid nested state where applicable. Coordinate restoration with other open DoPop tabs so old state cannot overwrite imported progress. | Valid legacy backups remain compatible. Malformed JSON, wrong boards/types, duplicate entries, excessive arrays/depth and unknown records do not replace working saves. Concurrent-tab tests prove restoration cannot silently be overwritten; blocked tabs cause a clear deferral. |
| 3 | Independent CI | Add build/test and security workflows for pull requests and `main`. Pin actions to full commit SHAs, use minimal job permissions, and avoid exposing deployment credentials to pull-request jobs. Pin browser-test tooling in a development-only lockfile. Add code scanning, secret checks and runtime-artifact/advisory checks. | CI runs the full build plus meaningful browser checks. A failing test, secret finding or integrity mismatch produces a failing check. App runtime gains no new package requirement. Any security-events write permission is confined to the analysis job. |
| 4 | Repository protection | After CI check names exist and pass, configure a `main` ruleset requiring pull requests and those checks. Block force pushes and deletion; document narrowly scoped emergency recovery. Require human approval when an additional maintainer is available, without making a solo-maintainer repository impossible to update. Enable Dependabot alerts and configure updates for supported manifests/workflows. | A failed/unverified PR cannot merge under normal access, and normal direct pushes cannot bypass the rule. A successful PR still triggers the existing Vercel release. Account changes require a separate explicit implementation instruction. |
| 5 | Stronger CSP and injection resistance | Emit the executable inline scripts as versioned same-origin assets while preserving their execution order and module behavior. Update guide generation and the offline asset/hash manifest together. Replace the worker fallback's inline `onclick` with a normal reload link. Remove script `unsafe-inline`; keep inline styles initially where current themes require them. Review dynamic HTML sinks and use text/DOM construction for variable data. | Injected inline scripts and event attributes fail under the enforced policy. All 24 games, dialogs, themes, audio, direct links and guides work. A fresh install, offline reload, prior-release upgrade and multi-tab deferral all pass. No extra CSP-reporting endpoint or tracking is introduced. |
| 6 | Supply-chain inventory | Record exact runtime and vendored versions, provenance, checksums and licenses. Include the CDN bundle in advisory monitoring: Dependabot alone does not discover a URL embedded in JS. Obtain upstream bundled-component provenance/SBOM where available and record unresolved dependency coverage explicitly. | Changed SDK bytes fail verification; a legitimate upgrade changes URL, hash and notices together. Vendored checksums remain valid. Reported advisories are checked against the shipped artifact rather than assumed applicable. |
| 7 | Private account and deployment settings | Review GitHub/Vercel/Grafana/DNS account membership, MFA/passkeys, scoped tokens, recovery and audit access. Check Vercel preview protection, Git integration scope, environment separation, production-branch settings and rollback. Review Grafana retention, origin configuration, ingestion limits and usage alerts. Review Google Forms access and collection settings. | Record each control as verified, unavailable or not applicable. Keep the public production game accessible and protect appropriate previews. Do not rotate public Faro ingestion addresses as if they were admin secrets. Do not expose token values in logs or documentation. |
| 8 | Release verification and recovery | Add a release smoke check for deployed commit/version, security headers on representative routes, offline cache behavior and SDK integrity. Document rollback to a previously tested artifact and the behavior of older cached clients. | Verify the actual production response after deployment, not just `vercel.json`. An update never interrupts active games, and rollback preserves save compatibility. Existing Grafana monitoring remains usable; no custom dashboard is required. |

Orders 1–2 address user data integrity. CI should land before enforcement is switched on, so protection cannot require a nonexistent check. The strict CSP migration should be a separate reviewable change because script ordering and the offline release contract are sensitive. Steps 6–7 can proceed independently once owners/access are available.

Private Vercel, Grafana and registrar controls remain **unverified**, rather than presumed missing. The review found no demonstrated critical remote exploit. It does not cover every browser, every malicious input or private infrastructure. Local progress and exported backups are accessible to the browser/device user; there is no server-side account or leaderboard integrity boundary to protect with a new backend.

Additional references: [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches), [GitHub Actions secure use](https://docs.github.com/en/actions/reference/security/secure-use), [MDN CSP implementation](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CSP), [Vercel deployment protection](https://vercel.com/docs/deployment-protection), [Grafana Frontend Observability setup](https://grafana.com/docs/grafana-cloud/observe-and-act/monitor-applications/frontend-observability/quickstart/).

## Implementation status — security hardening release

The application changes below form the security hardening release. The preceding
audit sections record historical review points. Verify publication and deployment
using the release commit and scripts/check_deployment.py; `15ff189` is the tested
previous-release reference.

- **Restore safety:** initial-snapshot failures abort without deletion. Successful
  rollback is checked, and incomplete recovery is reported explicitly. Import
  validates a registry of supported keys, bounded JSON and per-game state/undo
  records, reusing pure puzzle cores and Ants/Dot Connect/2048 validators where
  available. Valid legacy save keys and game formats are retained. Unknown keys
  are rejected without replacing current progress.
- **Other tabs:** current app tabs hold shared Web Locks leases. Replacement
  requires an exclusive lease, and a worker check also detects older/guide tabs.
  Browsers without Web Locks use the worker check with a weaker new-tab race
  guarantee. A local generation marker forces a browser-cache-restored page to
  reload if progress was replaced while it was away; that metadata is not
  exported or sent to telemetry.
- **Strict scripts:** executable inline scripts are emitted as same-origin,
  content-addressed assets with original order/types. Every emitted script is
  hash-verified and cached with the offline shell. Script `unsafe-inline` is
  removed. JSON-LD and existing theme styles remain supported. Telemetry permits
  only the known hashed asset path pattern when preserving error source identity.
- **Release checks:** final packaged HTML/assets/CSP are checked after assembly;
  tests inspect packaged code through test-only source readers. Existing engine,
  puzzle geometry, license and level fingerprints remain checked. The legacy-key
  gate now checks original identities rather than occurrence counts because the
  new registry legitimately repeats keys; the original fingerprint is retained
  in its fixture for reference.
- **CI prepared:** SHA-pinned release/browser and CodeQL workflows, locked
  development-only Playwright tooling, an OSV package-version check, safe-output
  credential-pattern checks and a runtime artifact inventory. CDN byte integrity
  is verified by the browser suite. OSV checks currently cover three exact
  package versions; upstream CDN bundled-transitive provenance remains incomplete
  and is explicitly recorded in the inventory.
- **GitHub settings applied and verified:** Dependabot alerts and automatic
  security updates are enabled. Actions now require full SHA pinning. Existing
  secret scanning, secret push protection and read-only default workflow-token
  permissions remain enabled.
- **Main enforcement deliberately pending:** the reviewed ruleset and a guarded
  activation script are provided. The script was tested in review mode and
  correctly deferred because the new workflows are not on remote main yet. After
  publication, it requires successful `release-checks` and `code-analysis` from
  GitHub Actions on the current remote head, rejects blocking CodeQL findings,
  binds check requirements to their integration and rechecks the head. It then
  enables pull requests, checks, CodeQL merge protection and force-push/deletion
  restrictions when explicitly run with `--apply`.
- **Deployment verification:** a read-only script verifies a requested deployed
  commit, representative security headers and all offline artifact hashes. The
  README documents verification and rollback. It cannot validate unpublished
  changes against production.

Validation: full build/compatibility checks passed; 384 game/viewport/theme views
passed without runtime errors; stateful Sudoku/Ants/Snake/Falling Blocks/Number
Path checks and footer/dialog focus checks passed. The security browser suite
verified game-generated saves, strict inline-script/handler blocking, Faro privacy
and SRI, initial-read failure preservation, two-tab restore blocking and a successful
restore/reload. A real upgrade test used the deployed `15ff189` artifact as its
baseline: activation waited until home, Ants trail/hearts/RNG persisted, every game
reopened offline, and an offline guide opened its intended game. The last schema
refinement additionally validates Sudoku selection/undo indices and Maze positions.

Remaining external work: Vercel membership/MFA/environment/preview protection,
Grafana retention/ingestion limits/billing alerts, and registrar/DNS recovery
controls still require access to those private account settings. No new analytics,
backend, login, cloud-save system or player-facing security controls were added.
Physical Safari/iOS/Android verification remains separate from desktop Chrome
viewport testing. GitHub CI has not run on the server until the workflows are published. Check its actual results after publication.
