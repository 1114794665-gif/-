# Preserving the current direct-upload production release

Production contains speed improvements and a visual CMS maintained outside the original Git branch baseline. Do not deploy the old site directory directly over the current live release.

Use a frozen, verified copy of the latest production artifact as the baseline. Run `npm install`, then `npm run compose:production -- /absolute/baseline /absolute/new-output`.

The composer preserves CMS modules, static assets and public-response policy, replaces only the enquiry handler with the tested notification-capable handler, updates English OEM copy and metadata, and adds versioned frontend patches. Unchanged original assets remain available. The generated manifest records preserved CMS assets and applied copy replacements. The output is a direct-upload Pages artifact; production deployment must explicitly name the production branch.

Before final deployment compare the baseline to current production and ensure no concurrent release advanced. Keep the prior production deployment ID for rollback. Do not replace existing database bindings or variable/secret values; only add the OEM_NOTIFY service binding where notification activation is intended.

The separate notifier is deployed with notifications/wrangler.json and has no public routes. The default site's build script remains a source-only build; use the production composer to retain the currently deployed CMS until that separate source baseline is consolidated.
