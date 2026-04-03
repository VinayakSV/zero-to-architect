# CDN — Content Delivery Networks — The Global Pizza Chain Analogy

## The Pizza Chain Analogy

Imagine you own a pizza restaurant in Mumbai. A customer in New York orders a pizza. You could ship it from Mumbai — but it would take forever and arrive cold. Instead, you open franchise kitchens in every major city. Each kitchen keeps the most popular pizzas ready. When someone in New York orders, the nearest kitchen serves it instantly.

**That's exactly what a CDN does** — it caches your content (images, videos, CSS, JS, APIs) at servers distributed globally, so users get served from the nearest location instead of your origin server thousands of miles away.

---

## 1. How CDN Works — The Request Flow

When a user requests `https://yoursite.com/image.jpg`, here's what happens:

```mermaid
sequenceDiagram
    participant User
    participant DNS
    participant Edge as CDN Edge (Nearest)
    participant Origin as Origin Server

    User->>DNS: Resolve yoursite.com
    DNS->>User: Edge server IP (closest)
    User->>Edge: GET /image.jpg
    alt Cache HIT
        Edge->>User: 200 OK (cached copy, ~20ms)
    else Cache MISS
        Edge->>Origin: GET /image.jpg
        Origin->>Edge: 200 OK (original)
        Edge->>Edge: Cache it (TTL: 24h)
        Edge->>User: 200 OK (~200ms first time)
    end
```

<div class="callout-info">

**Key insight**: The first user in a region gets a cache MISS (slower). Every subsequent user in that region gets a cache HIT (blazing fast). This is called **cache warming**.

</div>

---

## 2. CDN Architecture — Edge, Shield, Origin

A modern CDN has three layers:

```mermaid
graph TB
    subgraph Users
        U1[User - Mumbai]
        U2[User - London]
        U3[User - New York]
    end

    subgraph Edge["Edge Servers (PoPs)"]
        E1[Mumbai PoP]
        E2[London PoP]
        E3[New York PoP]
    end

    subgraph Shield["Origin Shield (Mid-Tier Cache)"]
        S1[Shield Server - Singapore]
    end

    subgraph Origin["Origin Server"]
        O1[Your Server / S3 Bucket]
    end

    U1 --> E1
    U2 --> E2
    U3 --> E3
    E1 -->|MISS| S1
    E2 -->|MISS| S1
    E3 -->|MISS| S1
    S1 -->|MISS| O1
```

| Layer | What it does | Example |
|-------|-------------|---------|
| **Edge (PoP)** | Closest to user, serves cached content | CloudFront has 450+ PoPs globally |
| **Origin Shield** | Mid-tier cache, reduces load on origin | Only ONE request goes to origin even if 50 edges miss |
| **Origin** | Your actual server or S3 bucket | Where the real content lives |

<div class="callout-scenario">

**Scenario**: Your e-commerce site launches a flash sale. 10 million users hit the product page simultaneously. Without origin shield, all 450 edge servers would bombard your origin. **With origin shield**, only 1 request reaches origin — the shield caches it and serves all edges.

**Decision**: Always enable origin shield for high-traffic events.

</div>

---

## 3. Cache Invalidation — The Hardest Problem

> "There are only two hard things in Computer Science: cache invalidation and naming things." — Phil Karlton

### Three Strategies

| Strategy | How it works | When to use |
|----------|-------------|-------------|
| **TTL (Time-To-Live)** | Content expires after X seconds | Static assets (images, CSS, JS) |
| **Cache Busting** | Change filename: `app.v2.js` or `app.abc123.js` | Deploy new versions |
| **Purge/Invalidate** | Explicitly tell CDN to drop cached content | Emergency content updates |

```java
// ❌ Bad — same filename, CDN serves stale version
<script src="/app.js"></script>

// ✅ Good — hash in filename, CDN treats as new file
<script src="/app.8f3a2b.js"></script>
```

<div class="callout-warn">

**Warning**: CDN purge/invalidation is NOT instant. CloudFront takes up to 60 seconds. Akamai can take 5-10 seconds. Never rely on purge for time-critical updates — use cache busting instead.

</div>

---

## 4. CDN for Dynamic Content — Not Just Static Files

Modern CDNs can cache API responses too:

```mermaid
flowchart LR
    A[User Request] --> B{CDN Edge}
    B -->|Static: image, CSS, JS| C[Serve from Cache]
    B -->|Dynamic: API /products| D{Cache-Control header?}
    D -->|max-age=60| E[Cache for 60s]
    D -->|no-cache| F[Forward to Origin]
    D -->|stale-while-revalidate| G[Serve stale + refresh in background]
```

<div class="callout-tip">

**Applying this** — For product listing APIs that change every few minutes, use `Cache-Control: public, max-age=30, stale-while-revalidate=60`. Users get instant responses while CDN refreshes in the background.

</div>

---

## 5. CDN Providers — When to Use What

| Provider | Best for | Pricing model | Unique feature |
|----------|---------|---------------|----------------|
| **CloudFront** | AWS-native apps | Pay per request + data transfer | Deep S3/ALB integration, Lambda@Edge |
| **Cloudflare** | Any website, DDoS protection | Free tier available | Built-in WAF, Workers (serverless at edge) |
| **Akamai** | Enterprise, media streaming | Contract-based | Largest network, 4000+ PoPs |
| **Fastly** | Real-time purge needs | Pay per request | Instant purge (<150ms), VCL config |

<div class="callout-scenario">

**Scenario**: You're building a news site where articles update frequently and stale content is unacceptable. **Decision**: Use Fastly — its instant purge (<150ms) means you can invalidate articles the moment they're updated, unlike CloudFront's 60-second delay.

</div>

---

## 6. Lambda@Edge and Edge Computing

CDNs aren't just caches anymore — they run code at the edge:

```mermaid
sequenceDiagram
    participant User
    participant Edge as CloudFront Edge
    participant Lambda as Lambda@Edge
    participant Origin

    User->>Edge: GET /page (Accept-Language: fr)
    Edge->>Lambda: Viewer Request trigger
    Lambda->>Lambda: Detect language, rewrite URL to /fr/page
    Lambda->>Edge: Modified request
    Edge->>Origin: GET /fr/page
    Origin->>Edge: French version
    Edge->>User: Localized page
```

**Real use cases for edge computing:**
- A/B testing (route 10% of users to new version)
- Geo-based redirects (India users → `.in` domain)
- Authentication at edge (reject unauthorized before hitting origin)
- Image resizing on-the-fly (serve WebP to Chrome, JPEG to Safari)

<div class="callout-interview">

🎯 **Interview Ready** — "How would you serve different image formats to different browsers?" → Use Lambda@Edge or Cloudflare Workers to inspect the `Accept` header. If it contains `image/webp`, rewrite the request to fetch the WebP version. This saves 30-50% bandwidth without any client-side changes.

</div>

---

## 7. CDN Security — DDoS Protection

CDNs are your first line of defense:

```mermaid
flowchart LR
    A[Attacker: 10M requests/sec] --> B[CDN Edge]
    B --> C{WAF Rules}
    C -->|Blocked: Bot traffic| D[Drop]
    C -->|Blocked: Rate limit exceeded| E[429 Too Many Requests]
    C -->|Allowed: Legitimate| F[Origin Server]
    F --> G[Only ~1000 req/sec reach origin]
```

| Protection | What it does |
|-----------|-------------|
| **Rate Limiting** | Block IPs exceeding threshold |
| **WAF (Web Application Firewall)** | Block SQL injection, XSS at edge |
| **Geo-blocking** | Block traffic from specific countries |
| **Bot Detection** | Fingerprint and block automated traffic |
| **DDoS Absorption** | CDN's massive network absorbs volumetric attacks |

<div class="callout-tip">

**Applying this** — Always put your origin behind a CDN, even for APIs. Configure the origin to ONLY accept traffic from CDN IPs. This way, attackers can't bypass the CDN and hit your origin directly.

</div>

---

## 🎯 Interview Corner

<div class="callout-interview">

**Q: "How does a CDN decide which edge server to route a user to?"**

DNS-based routing. When a user resolves your domain, the CDN's authoritative DNS server uses **anycast** or **geolocation-based DNS** to return the IP of the nearest edge server. Some CDNs also use **latency-based routing** — they measure actual round-trip times from the user's DNS resolver to each PoP and pick the fastest, not just the geographically closest. CloudFront uses a combination of both.

**Follow-up trap**: "What if the nearest edge is overloaded?" → CDNs implement **load-aware routing**. If an edge PoP is at capacity, DNS returns the next-closest healthy PoP. This is transparent to the user.

</div>

<div class="callout-interview">

**Q: "Your origin is getting hammered despite having a CDN. What's going wrong?"**

Several possibilities: (1) **Low cache hit ratio** — check if `Cache-Control` headers are set correctly. If origin sends `no-cache` or `private`, CDN won't cache. (2) **Cache key too specific** — if query strings like `?timestamp=123` vary per request, each is treated as a unique cache key. (3) **No origin shield** — without it, every edge PoP independently fetches from origin on a miss. (4) **POST/PUT requests** — these bypass cache by default. Fix: set proper `Cache-Control`, normalize cache keys, enable origin shield, and consider caching POST responses where safe.

**Follow-up trap**: "How do you debug cache hit ratio?" → Check CDN response headers: `X-Cache: Hit from cloudfront` vs `Miss from cloudfront`. CloudFront also provides real-time metrics in CloudWatch.

</div>

<div class="callout-interview">

**Q: "How would you design a CDN from scratch?"**

I'd start with three components: (1) **DNS routing layer** — anycast DNS to route users to nearest PoP. (2) **Edge cache layer** — reverse proxy (like Nginx/Varnish) at each PoP with LRU eviction, respecting `Cache-Control` headers. (3) **Origin shield** — a mid-tier cache that collapses duplicate origin requests. For cache invalidation, I'd use a pub/sub system — when origin publishes an invalidation event, all edges subscribe and purge. For consistency, I'd use TTL-based expiry as the primary mechanism and explicit purge as secondary. The key trade-off is consistency vs latency — shorter TTLs mean fresher content but more origin load.

</div>

<div class="callout-interview">

**Q: "CDN vs reverse proxy vs load balancer — what's the difference?"**

A **reverse proxy** (Nginx) sits in front of your server, handles SSL termination, compression, and can cache — but it's in ONE location. A **load balancer** distributes traffic across multiple backend servers — it doesn't cache. A **CDN** is essentially a globally distributed network of reverse proxies with intelligent DNS routing. In practice, you use all three: CDN at the edge → load balancer in your region → reverse proxy in front of your app servers. They're complementary, not competing.

</div>

---

## Quick Reference

| Concept | One-Liner |
|---------|-----------|
| PoP | Point of Presence — a CDN edge location |
| Cache HIT | Content served from edge, no origin call |
| Cache MISS | Edge doesn't have it, fetches from origin |
| TTL | How long content stays cached before expiry |
| Origin Shield | Mid-tier cache that protects origin from thundering herd |
| Cache Busting | Changing filename to force CDN to fetch new version |
| Anycast | Same IP advertised from multiple locations, routed to nearest |
| Lambda@Edge | Run code at CDN edge (auth, redirects, A/B testing) |
| WAF | Web Application Firewall — blocks attacks at edge |
| Stale-while-revalidate | Serve cached version while refreshing in background |

---

> **A CDN doesn't just make your site faster — it makes your origin server's life easier. The best request is the one that never reaches your server.**
