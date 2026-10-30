# dopop offline release plan

## Decision
Use an installable PWA with an explicitly verified, cache-first app shell. All 24 games, levels, styles and synthesized sounds are already self-contained in one HTML document; no game needs a server. A custom small service worker is sufficient here; adding a runtime caching framework or native wrapper would add dependencies without improving this static bundle.

References: https://web.dev/articles/service-worker-lifecycle, https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching, https://webkit.org/blog/14403/updates-to-storage-policy/.

## Release transaction
The build creates a manifest, 180/192/512 PNG icons and service worker. The release identity includes every asset hash and the worker implementation. Installation downloads every required file and checks its SHA-256 before activation. Interrupted downloads or mixed deployments fail installation and preserve the older active release. Root navigation and known assets are served cache-first. The worker does not intercept unrelated requests. No skipWaiting during installation.

New releases wait. Update ready appears on the home page. Applying an update asks every open app client whether it is at home without an open dialog. Clients temporarily lock navigation while agreeing. Any active game or unresponsive client prevents immediate activation. Home pages reload when the controller changes; games are not forcibly reloaded. Normal service-worker activation also occurs after all old clients close. Retain current and one previous release cache, never delete game saves or unrelated caches.

## Readiness and recovery
Only report ready after the active worker confirms all five cache entries. Expose retry/check and missing-file repair. Registration errors and unavailable secure contexts show honest status. First use requires connectivity; unsupported/private/restricted browsers may not retain storage. Request persistent storage only from a user-pressed button and report browser denial truthfully.

## Installation and progress
Manifest uses stable identity /, scope /, start URL / and standalone display. Local generated icons support Android maskable and iOS touch icons. Chrome's install prompt is used if available, otherwise show Safari/Android menu instructions. Ask users to open the installed app online once, because browser and installed-app storage behavior can differ. Do not change domain or save keys. www.dopop.fun remains the existing canonical origin.

Back up only dopop save keys, never other localStorage data. Export as versioned JSON. Import checks app/version, entry count, keys, duplicate keys, types and sizes, then asks explicit replacement confirmation. Restore attempts rollback on write failure. A backup is not cloud sync. Existing games retain their existing persistence granularity (not every arcade game stores an active run). Ants Apart version 2 additionally saves per-level boards and unfinished trails under its existing key. Exit-time writes are suspended while importing a backup so they cannot overwrite restored data during reload; a failed import restores normal saving after rollback.

## Appearance and new puzzles

Rotate Network, Loop, Color Code and Picture Grid each bundle 30 fixed levels in the same cached HTML. Their independent saves and undo history fit the existing backup allowlist. System/Light/Dark appearance uses `pocketpause.v1.appearance`, follows the device by default and is included in backups. Theme scripts, CSS tokens and canvas presentation support are bundled offline. The browser theme color follows the selected palette through a single meta tag.

## Verification
Automated worker tests use actual generated assets with a simulated offline network: navigation, cache-only requests, all 24 game implementations bundled, failed/mismatched installs, readiness, repair, activation/cache isolation, safe/blocked multi-tab updates and icon/manifest validation. Existing puzzle and 2048 regression suites also run. Chrome checks cover the 24 game pages, 46 dark-mode settings/help/level dialogs, saved appearance choices, device-theme changes, offline reopening, Ants Apart board restoration, successful backup import and rollback after a simulated storage failure. Production deployment readiness must be checked after publishing.

Physical Android and iPhone Home Screen installation, airplane-mode cold launch, OS eviction, and device file-picker backup round trips require device testing; do not claim these are verified by desktop browser tests.

## Search guide integration

The search build adds a directory and 24 lightweight static game guides outside the five-asset verified game bundle. Known guide URLs use network-first navigation; if fetching fails, the worker returns the cached app, which can open the requested game. Unknown paths remain real 404s. Static guide tabs acknowledge safe-update requests, defer while a dialog is open and release temporary locks on cancellation, activation or timeout. They do not register workers or initiate updates themselves.

Faro now receives bounded offline readiness, installation/repair, update and backup outcomes in eligible production sessions. It does not persist an offline telemetry history or record save contents. Events use fixed names and enumerated outcomes; local previews and analytics-disabled sessions are excluded.
