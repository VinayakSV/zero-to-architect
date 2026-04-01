# Database Decisions — When to Pick What and Why

## The Decision Framework

Every database choice comes down to 4 questions:
1. **What's your access pattern?** — Read-heavy? Write-heavy? Both?
2. **Do you need transactions?** — ACID or eventual consistency?
3. **What's your scale?** — 1K rows or 1B rows?
4. **What's your query complexity?** — Simple key-value or complex joins?

---

## SQL vs NoSQL — The Real Decision

### It's NOT about "modern vs legacy"

```
❌ "NoSQL is faster" — Wrong. PostgreSQL handles 100K+ TPS.
❌ "SQL doesn't scale" — Wrong. Vitess runs YouTube's MySQL at billions of rows.
❌ "NoSQL is schema-less" — Wrong. You just moved the schema to application code.
```

### When to pick what

| Scenario | Pick | Why |
|----------|------|-----|
| E-commerce orders, payments | PostgreSQL | ACID transactions, complex queries (joins), data integrity |
| User sessions, shopping cart | Redis / DynamoDB | Simple key-value, high throughput, TTL support |
| Product catalog (read-heavy) | DynamoDB / MongoDB | Denormalized reads, flexible schema, auto-scaling |
| Analytics, time-series | ClickHouse / TimescaleDB | Columnar storage, fast aggregations |
| Social graph (friends, followers) | Neo4j / Neptune | Relationship traversal, graph queries |
| Full-text search | Elasticsearch | Inverted index, relevance scoring |
| Chat messages | Cassandra / ScyllaDB | Write-heavy, time-ordered, partition by conversation |

<div class="callout-scenario">

**Scenario**: You're building an e-commerce platform. Product catalog is read 1000x more than written. Orders need ACID. User sessions expire after 30 min. **Answer**: PostgreSQL for orders, DynamoDB for catalog (denormalized), Redis for sessions. Three databases, each optimized for its access pattern.

</div>

---

## Schema Design — Performance First

### Normalization vs Denormalization

**Normalized** (3NF) — No data duplication, joins required
```sql
-- 3 tables, 2 joins to get order details
SELECT o.id, u.name, p.title, oi.quantity
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON oi.product_id = p.id
WHERE o.id = 12345;
```

**Denormalized** — Data duplicated, no joins needed
```sql
-- 1 table, 0 joins
SELECT order_id, user_name, product_title, quantity
FROM order_details_view
WHERE order_id = 12345;
```

### When to denormalize

| Signal | Action |
|--------|--------|
| Read:Write ratio > 100:1 | Denormalize read paths |
| Join queries > 50ms at p99 | Materialize the join as a view/table |
| Same join query called > 1000 RPS | Create a read-optimized table |
| Data changes < 1x/hour | Safe to denormalize (stale data acceptable) |

<div class="callout-tip">

**Applying this** — Normalize your write path (source of truth). Denormalize your read path (optimized for queries). Use CDC (Change Data Capture) or events to keep them in sync. This is the CQRS pattern applied to database design.

</div>

---

## Indexing — The #1 Performance Lever

### How indexes work (simplified)

Without index: Database scans every row (full table scan). 10M rows = 10M comparisons.

With index: Database uses a B-tree to find the row in ~23 comparisons (log₂ of 10M).

### Index Decision Matrix

| Query Pattern | Index Type | Example |
|--------------|-----------|---------|
| `WHERE user_id = ?` | B-tree (default) | `CREATE INDEX idx_user ON orders(user_id)` |
| `WHERE email = ?` (unique) | Unique index | `CREATE UNIQUE INDEX idx_email ON users(email)` |
| `WHERE status = ? AND created_at > ?` | Composite | `CREATE INDEX idx_status_date ON orders(status, created_at)` |
| `WHERE name ILIKE '%john%'` | GIN trigram | `CREATE INDEX idx_name_trgm ON users USING gin(name gin_trgm_ops)` |
| `WHERE location <-> point(x,y) < 1000` | GiST spatial | `CREATE INDEX idx_geo ON stores USING gist(location)` |
| `WHERE tags @> '{java}'` | GIN array | `CREATE INDEX idx_tags ON posts USING gin(tags)` |

### Composite Index Column Order Matters

```sql
-- Index: (status, created_at)

-- ✅ Uses index fully
WHERE status = 'ACTIVE' AND created_at > '2024-01-01'

-- ✅ Uses index (left prefix)
WHERE status = 'ACTIVE'

-- ❌ Cannot use index (skips left column)
WHERE created_at > '2024-01-01'
```

**Rule**: Put equality columns first, range columns last.

### When NOT to index

| Situation | Why |
|-----------|-----|
| Table < 1000 rows | Full scan is faster than index lookup |
| Column with < 5 distinct values | Index selectivity too low (e.g., boolean) |
| Write-heavy table (> 80% writes) | Every write updates every index — slows inserts |
| Column rarely queried | Index wastes storage and slows writes for no benefit |

---

## Sharding — When and How

### When do you need sharding?

```
Single PostgreSQL instance:
  ✅ Up to ~500GB data
  ✅ Up to ~50K TPS (read + write)
  ✅ Up to ~500 connections

If you're below these → DON'T SHARD. Use read replicas instead.
```

### Horizontal Sharding Strategies

**1. Range-based** — Shard by date range
```
Shard 1: Jan-Mar 2024
Shard 2: Apr-Jun 2024
Shard 3: Jul-Sep 2024
```
- ✅ Simple, time-series friendly
- ❌ Hot shard problem (current month gets all writes)

**2. Hash-based** — Shard by hash of key
```
shard_id = hash(user_id) % num_shards
```
- ✅ Even distribution
- ❌ Range queries across shards are expensive
- ❌ Adding shards requires reshuffling

**3. Directory-based** — Lookup table maps key to shard
```
user_id 1-1000    → Shard A
user_id 1001-5000 → Shard B
user_id 5001+     → Shard C
```
- ✅ Flexible, can rebalance without reshuffling
- ❌ Lookup table is a single point of failure

**4. Tenant-based** (for SaaS) — One shard per tenant or group
```
Tenant: Acme Corp    → Shard 1 (dedicated, they pay for it)
Tenant: Small Co 1-50 → Shard 2 (shared)
Tenant: Small Co 51-100 → Shard 3 (shared)
```
- ✅ Perfect tenant isolation
- ✅ Can give big tenants dedicated resources
- ❌ Uneven shard sizes

<div class="callout-tip">

**Applying this** — Before sharding, exhaust these options first: (1) Add read replicas, (2) Add indexes, (3) Optimize queries, (4) Add caching layer, (5) Vertical scaling (bigger instance). Sharding adds massive operational complexity — it should be your last resort, not your first.

</div>

<div class="callout-interview">

**🎯 Interview Ready** — "When would you shard a database?" → Only when you've exhausted vertical scaling, read replicas, caching, and query optimization. Sharding is for write throughput or data size that exceeds a single node. Choose hash-based for even distribution, tenant-based for SaaS isolation. Always pick a shard key that matches your most common query pattern — you can't efficiently query across shards.

</div>

---

## PostgreSQL vs MySQL vs DynamoDB — Decision Table

| Factor | PostgreSQL | MySQL | DynamoDB |
|--------|-----------|-------|----------|
| Complex queries | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| JSON support | ⭐⭐⭐ (JSONB) | ⭐⭐ | ⭐⭐⭐ (native) |
| Transactions | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ (limited) |
| Auto-scaling | ❌ (manual) | ❌ (manual) | ⭐⭐⭐ (automatic) |
| Ops overhead | Medium | Medium | Zero |
| Cost at scale | $$ | $$ | $$$ (can be expensive) |
| Best for | General purpose, analytics | Web apps, read-heavy | Key-value, serverless |

<div class="callout-scenario">

**Scenario**: Startup with 3 engineers, building fast, don't know final access patterns yet. **Pick PostgreSQL.** It handles JSON, full-text search, geospatial, time-series, and relational — all in one. You can always extract specific workloads to specialized databases later. Don't prematurely optimize with 5 databases when one will do.

</div>
