---
name: DuoSpace database choice
description: The durable database-provider decision for DuoSpace.
---

DuoSpace uses Replit managed PostgreSQL for shared workspace data. Do not switch this product to Supabase without revisiting the decision with the user.

**Why:** No Supabase connection was available during setup, and the user selected managed PostgreSQL as the alternative.

**How to apply:** Keep persistence in the API server and enforce workspace ownership there. Revisit the database provider only if the user asks.
