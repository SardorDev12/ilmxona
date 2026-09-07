import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default in-memory cache for now (fine for Phase 1). Swap in the R2
// incremental cache once an R2 bucket exists — see README "Cloudflare
// deployment" for the two-line change + `wrangler.jsonc` binding.
export default defineCloudflareConfig();
