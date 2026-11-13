# Preview enquiry notifications

This Worker sends business notifications only to the existing verified destination niles@boomdrinkware.com. It has no workers.dev endpoint, preview URL, or custom route. Pages calls it through the OEM_NOTIFY service binding, configured first on Preview; Production is connected only after the owner explicitly authorizes rollout.

The Pages handler stores each enquiry and its outbox entry in one D1 transaction. The private Worker sends pending jobs and retries failures at most five times. A five-minute scheduled trigger retries queued jobs. Duplicate submissions reuse the same enquiry/outbox record. The sent state means Cloudflare's send binding accepted the message; inbox placement is a separate verification. The unknown state is not automatically resent after a post-send storage failure.

Apply schema.sql before enabling the binding. Deploy this Worker with its own wrangler.json, then add the OEM_NOTIFY service binding to the intended Pages environment. Do not replace the Pages project's existing database bindings, variables, or secrets. Its Production settings remain separate. Deploy Pages using the SEO branch name explicitly.

Node 24 checks: node notifications/test.mjs and node notifications/test-pages.mjs from the repository root.

Email contains the saved enquiry reference, project fields and attachment count. Attachment bytes remain private in D1; no public attachment links are created. Notification failure never turns an already-saved enquiry into a failed receipt.
