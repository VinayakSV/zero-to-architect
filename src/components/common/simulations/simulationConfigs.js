// Simulation configs for each system design topic
// Each config defines nodes, connections, and animated steps

export const rateLimiterSim = {
  title: 'Rate Limiter — Token Bucket in Action',
  description: 'Watch how a token bucket rate limiter allows or rejects requests',
  width: 580, height: 280,
  nodes: [
    { id: 'client', x: 80, y: 140, label: 'Client', icon: '👤' },
    { id: 'limiter', x: 290, y: 140, label: 'Rate Limiter', icon: '🪣' },
    { id: 'server', x: 500, y: 140, label: 'API Server', icon: '🖥️' },
    { id: 'bucket', x: 290, y: 50, label: 'Bucket: 5 tokens', icon: '🪙' },
  ],
  connections: [
    { id: 'c-l', from: 'client', to: 'limiter' },
    { id: 'l-s', from: 'limiter', to: 'server' },
    { id: 'b-l', from: 'bucket', to: 'limiter' },
  ],
  steps: [
    { description: '🪙 Bucket starts with 5 tokens. Each request consumes 1 token.', duration: 1800, nodeStates: { bucket: 'active', limiter: 'idle' } },
    { description: '📨 Request 1 arrives → Token consumed (4 left) → Request forwarded ✅', duration: 1500, packet: { from: 'client', to: 'limiter', label: 'REQ 1', color: '#4caf50' }, nodeStates: { client: 'active', limiter: 'active', bucket: 'active' }, activeConnections: ['c-l'] },
    { description: '✅ Request 1 reaches API server. Bucket: 4 tokens remaining.', duration: 1200, packet: { from: 'limiter', to: 'server', label: 'REQ 1', color: '#4caf50' }, nodeStates: { limiter: 'active', server: 'active' }, activeConnections: ['l-s'] },
    { description: '📨 Requests 2, 3, 4 arrive rapidly → All allowed (1 token left)', duration: 1500, packet: { from: 'client', to: 'limiter', label: 'REQ 2-4', color: '#4caf50' }, nodeStates: { client: 'active', limiter: 'active', bucket: 'warn' }, activeConnections: ['c-l', 'l-s'] },
    { description: '📨 Request 5 arrives → Last token consumed (0 left) → Allowed ✅', duration: 1500, packet: { from: 'client', to: 'limiter', label: 'REQ 5', color: '#ff9800' }, nodeStates: { client: 'active', limiter: 'warn', bucket: 'warn' }, activeConnections: ['c-l'] },
    { description: '🚫 Request 6 arrives → No tokens! → 429 Too Many Requests ❌', duration: 2000, packet: { from: 'client', to: 'limiter', label: 'REQ 6', color: '#f44336' }, nodeStates: { client: 'active', limiter: 'error', bucket: 'error' }, activeConnections: ['c-l'] },
    { description: '⏳ 1 second passes → Token refills (1 token) → Next request allowed', duration: 1800, nodeStates: { bucket: 'active', limiter: 'active' } },
    { description: '📨 Request 7 arrives → Token available → Allowed ✅', duration: 1500, packet: { from: 'client', to: 'server', label: 'REQ 7', color: '#4caf50' }, nodeStates: { client: 'active', limiter: 'active', server: 'active', bucket: 'active' }, activeConnections: ['c-l', 'l-s'] },
  ],
};

export const cdnSim = {
  title: 'CDN — Cache Hit vs Cache Miss',
  description: 'See how a CDN serves content from edge vs origin',
  width: 600, height: 300,
  nodes: [
    { id: 'user', x: 80, y: 150, label: 'User', icon: '👤' },
    { id: 'edge', x: 280, y: 80, label: 'CDN Edge', icon: '🌐' },
    { id: 'shield', x: 280, y: 220, label: 'Origin Shield', icon: '🛡️' },
    { id: 'origin', x: 500, y: 150, label: 'Origin Server', icon: '🖥️' },
  ],
  connections: [
    { id: 'u-e', from: 'user', to: 'edge' },
    { id: 'e-s', from: 'edge', to: 'shield' },
    { id: 's-o', from: 'shield', to: 'origin' },
  ],
  steps: [
    { description: '👤 User requests image.jpg from CDN', duration: 1500, packet: { from: 'user', to: 'edge', label: 'GET image.jpg', color: '#2196f3' }, nodeStates: { user: 'active' }, activeConnections: ['u-e'] },
    { description: '❌ Cache MISS at edge — first request for this file in this region', duration: 1500, nodeStates: { edge: 'warn' } },
    { description: '🛡️ Edge asks Origin Shield (mid-tier cache)', duration: 1500, packet: { from: 'edge', to: 'shield', label: 'GET image.jpg', color: '#ff9800' }, nodeStates: { edge: 'warn', shield: 'active' }, activeConnections: ['e-s'] },
    { description: '❌ Shield also misses — forwards to Origin Server', duration: 1500, packet: { from: 'shield', to: 'origin', label: 'GET image.jpg', color: '#f44336' }, nodeStates: { shield: 'warn', origin: 'active' }, activeConnections: ['s-o'] },
    { description: '✅ Origin returns file → Shield caches it → Edge caches it', duration: 1800, packet: { from: 'origin', to: 'edge', label: 'image.jpg', color: '#4caf50' }, nodeStates: { origin: 'active', shield: 'active', edge: 'active' }, activeConnections: ['s-o', 'e-s'] },
    { description: '✅ User receives file (slow first time ~200ms)', duration: 1200, packet: { from: 'edge', to: 'user', label: 'image.jpg', color: '#4caf50' }, nodeStates: { edge: 'active', user: 'active' }, activeConnections: ['u-e'] },
    { description: '👤 Second user requests same file...', duration: 1500, packet: { from: 'user', to: 'edge', label: 'GET image.jpg', color: '#2196f3' }, nodeStates: { user: 'active' }, activeConnections: ['u-e'] },
    { description: '⚡ Cache HIT at edge! Served instantly (~20ms) — no origin call!', duration: 1500, packet: { from: 'edge', to: 'user', label: 'image.jpg ⚡', color: '#4caf50' }, nodeStates: { edge: 'highlight', user: 'active' }, activeConnections: ['u-e'] },
  ],
};


export const loadBalancerSim = {
  title: 'Load Balancer — Round Robin Distribution',
  description: 'Watch requests get distributed across servers',
  width: 600, height: 300,
  nodes: [
    { id: 'users', x: 80, y: 150, label: 'Users', icon: '👥' },
    { id: 'lb', x: 280, y: 150, label: 'Load Balancer', icon: '⚖️' },
    { id: 's1', x: 500, y: 60, label: 'Server 1', icon: '🖥️' },
    { id: 's2', x: 500, y: 150, label: 'Server 2', icon: '🖥️' },
    { id: 's3', x: 500, y: 240, label: 'Server 3', icon: '🖥️' },
  ],
  connections: [
    { id: 'u-lb', from: 'users', to: 'lb' },
    { id: 'lb-s1', from: 'lb', to: 's1' },
    { id: 'lb-s2', from: 'lb', to: 's2' },
    { id: 'lb-s3', from: 'lb', to: 's3' },
  ],
  steps: [
    { description: '📨 Request 1 arrives at Load Balancer', duration: 1200, packet: { from: 'users', to: 'lb', label: 'REQ 1', color: '#2196f3' }, nodeStates: { users: 'active' }, activeConnections: ['u-lb'] },
    { description: '➡️ Round Robin → Route to Server 1', duration: 1200, packet: { from: 'lb', to: 's1', label: 'REQ 1', color: '#4caf50' }, nodeStates: { lb: 'active', s1: 'active' }, activeConnections: ['lb-s1'] },
    { description: '📨 Request 2 arrives at Load Balancer', duration: 1200, packet: { from: 'users', to: 'lb', label: 'REQ 2', color: '#2196f3' }, nodeStates: { users: 'active' }, activeConnections: ['u-lb'] },
    { description: '➡️ Round Robin → Route to Server 2', duration: 1200, packet: { from: 'lb', to: 's2', label: 'REQ 2', color: '#4caf50' }, nodeStates: { lb: 'active', s2: 'active' }, activeConnections: ['lb-s2'] },
    { description: '📨 Request 3 arrives at Load Balancer', duration: 1200, packet: { from: 'users', to: 'lb', label: 'REQ 3', color: '#2196f3' }, nodeStates: { users: 'active' }, activeConnections: ['u-lb'] },
    { description: '➡️ Round Robin → Route to Server 3', duration: 1200, packet: { from: 'lb', to: 's3', label: 'REQ 3', color: '#4caf50' }, nodeStates: { lb: 'active', s3: 'active' }, activeConnections: ['lb-s3'] },
    { description: '💀 Server 2 goes down! Health check fails.', duration: 1800, nodeStates: { s2: 'error', lb: 'warn' } },
    { description: '📨 Request 4 arrives → LB skips Server 2 → Routes to Server 1', duration: 1500, packet: { from: 'lb', to: 's1', label: 'REQ 4', color: '#4caf50' }, nodeStates: { lb: 'active', s1: 'active', s2: 'error' }, activeConnections: ['lb-s1'] },
    { description: '✅ Traffic flows to healthy servers only. Users never notice!', duration: 1500, nodeStates: { s1: 'active', s3: 'active', s2: 'error', lb: 'highlight' } },
  ],
};

export const rideSharingSim = {
  title: 'Uber — Ride Matching Flow',
  description: 'Watch how a rider gets matched with the nearest driver',
  width: 600, height: 300,
  nodes: [
    { id: 'rider', x: 80, y: 150, label: 'Rider', icon: '🧑' },
    { id: 'api', x: 250, y: 150, label: 'Ride Service', icon: '📡' },
    { id: 'match', x: 420, y: 70, label: 'Matching', icon: '🎯' },
    { id: 'loc', x: 420, y: 230, label: 'Location Svc', icon: '📍' },
    { id: 'driver', x: 560, y: 150, label: 'Driver', icon: '🚗' },
  ],
  connections: [
    { id: 'r-a', from: 'rider', to: 'api' },
    { id: 'a-m', from: 'api', to: 'match' },
    { id: 'a-l', from: 'api', to: 'loc' },
    { id: 'm-d', from: 'match', to: 'driver' },
  ],
  steps: [
    { description: '🧑 Rider requests a ride from Location A to B', duration: 1500, packet: { from: 'rider', to: 'api', label: 'Book Ride', color: '#2196f3' }, nodeStates: { rider: 'active' }, activeConnections: ['r-a'] },
    { description: '📍 Location Service finds nearby drivers using QuadTree/Geohash', duration: 1500, packet: { from: 'api', to: 'loc', label: 'Find drivers', color: '#ff9800' }, nodeStates: { api: 'active', loc: 'active' }, activeConnections: ['a-l'] },
    { description: '📍 Found 3 drivers within 3km radius', duration: 1200, nodeStates: { loc: 'highlight' } },
    { description: '🎯 Matching Service calculates ETA for each driver', duration: 1500, packet: { from: 'api', to: 'match', label: 'Rank drivers', color: '#9c27b0' }, nodeStates: { api: 'active', match: 'active' }, activeConnections: ['a-m'] },
    { description: '🎯 Best match: Driver C (ETA 3 min, rating 4.8, heading toward rider)', duration: 1500, nodeStates: { match: 'highlight' } },
    { description: '🚗 Ride request sent to Driver C', duration: 1500, packet: { from: 'match', to: 'driver', label: 'Ride offer', color: '#4caf50' }, nodeStates: { match: 'active', driver: 'active' }, activeConnections: ['m-d'] },
    { description: '✅ Driver accepts! Rider notified. ETA: 3 minutes.', duration: 1800, packet: { from: 'api', to: 'rider', label: 'Driver assigned!', color: '#4caf50' }, nodeStates: { rider: 'highlight', driver: 'highlight', api: 'active' }, activeConnections: ['r-a'] },
  ],
};


export const atmSim = {
  title: 'ATM — Withdrawal Transaction Flow',
  description: 'Watch a complete ATM withdrawal with safety checks',
  width: 600, height: 280,
  nodes: [
    { id: 'user', x: 70, y: 140, label: 'User', icon: '👤' },
    { id: 'atm', x: 230, y: 140, label: 'ATM', icon: '🏧' },
    { id: 'bank', x: 420, y: 80, label: 'Bank Server', icon: '🏦' },
    { id: 'db', x: 420, y: 210, label: 'Account DB', icon: '💾' },
    { id: 'cash', x: 560, y: 140, label: 'Dispenser', icon: '💵' },
  ],
  connections: [
    { id: 'u-a', from: 'user', to: 'atm' },
    { id: 'a-b', from: 'atm', to: 'bank' },
    { id: 'b-d', from: 'bank', to: 'db' },
    { id: 'a-c', from: 'atm', to: 'cash' },
  ],
  steps: [
    { description: '💳 User inserts card and enters PIN', duration: 1500, nodeStates: { user: 'active', atm: 'active' }, activeConnections: ['u-a'] },
    { description: '🔐 ATM sends encrypted PIN to Bank for verification', duration: 1500, packet: { from: 'atm', to: 'bank', label: 'Verify PIN', color: '#2196f3' }, nodeStates: { atm: 'active', bank: 'active' }, activeConnections: ['a-b'] },
    { description: '✅ PIN verified! User selects Withdraw ₹5,000', duration: 1200, nodeStates: { bank: 'highlight', atm: 'active' } },
    { description: '🏦 Bank checks balance: ₹25,000 available', duration: 1500, packet: { from: 'bank', to: 'db', label: 'Check balance', color: '#ff9800' }, nodeStates: { bank: 'active', db: 'active' }, activeConnections: ['b-d'] },
    { description: '💰 Balance sufficient → Deduct ₹5,000 (PENDING state)', duration: 1500, packet: { from: 'db', to: 'bank', label: 'Deducted', color: '#4caf50' }, nodeStates: { db: 'warn', bank: 'active' }, activeConnections: ['b-d'] },
    { description: '💵 ATM dispenses cash — counting notes...', duration: 2000, packet: { from: 'atm', to: 'cash', label: 'Dispense', color: '#4caf50' }, nodeStates: { atm: 'active', cash: 'active' }, activeConnections: ['a-c'] },
    { description: '✅ Cash dispensed! Transaction marked COMPLETED', duration: 1500, packet: { from: 'atm', to: 'bank', label: 'Confirm', color: '#4caf50' }, nodeStates: { cash: 'highlight', bank: 'highlight', atm: 'highlight' }, activeConnections: ['a-b'] },
    { description: '🧾 Receipt printed. Card ejected. New balance: ₹20,000', duration: 1500, nodeStates: { user: 'highlight', atm: 'active' } },
  ],
};

export const netflixSim = {
  title: 'Netflix — Adaptive Bitrate Streaming',
  description: 'Watch how Netflix adjusts video quality based on bandwidth',
  width: 600, height: 280,
  nodes: [
    { id: 'player', x: 80, y: 140, label: 'Player', icon: '📱' },
    { id: 'cdn', x: 300, y: 80, label: 'CDN Edge', icon: '🌐' },
    { id: 'origin', x: 300, y: 220, label: 'Origin (S3)', icon: '☁️' },
    { id: 'screen', x: 520, y: 140, label: 'Screen', icon: '🖥️' },
  ],
  connections: [
    { id: 'p-c', from: 'player', to: 'cdn' },
    { id: 'c-o', from: 'cdn', to: 'origin' },
    { id: 'p-s', from: 'player', to: 'screen' },
  ],
  steps: [
    { description: '▶️ User presses Play — player requests manifest (chunk list)', duration: 1500, packet: { from: 'player', to: 'cdn', label: 'manifest', color: '#2196f3' }, nodeStates: { player: 'active' }, activeConnections: ['p-c'] },
    { description: '📋 Manifest received — lists chunks in 360p, 720p, 1080p, 4K', duration: 1200, nodeStates: { cdn: 'active', player: 'active' } },
    { description: '🎬 Start with 480p (fast start, small chunk)', duration: 1500, packet: { from: 'cdn', to: 'player', label: '480p chunk', color: '#ff9800' }, nodeStates: { cdn: 'active', player: 'active' }, activeConnections: ['p-c'] },
    { description: '📺 Playing at 480p — measuring bandwidth: 8 Mbps ✅', duration: 1500, packet: { from: 'player', to: 'screen', label: '480p', color: '#ff9800' }, nodeStates: { player: 'active', screen: 'active' }, activeConnections: ['p-s'] },
    { description: '⬆️ Bandwidth good! Upgrade to 1080p for next chunk', duration: 1500, packet: { from: 'cdn', to: 'player', label: '1080p chunk', color: '#4caf50' }, nodeStates: { cdn: 'highlight', player: 'active' }, activeConnections: ['p-c'] },
    { description: '📺 Now playing at 1080p — crystal clear!', duration: 1500, packet: { from: 'player', to: 'screen', label: '1080p ✨', color: '#4caf50' }, nodeStates: { screen: 'highlight' }, activeConnections: ['p-s'] },
    { description: '📉 Bandwidth drops to 2 Mbps (user on train)', duration: 1500, nodeStates: { player: 'warn', cdn: 'warn' } },
    { description: '⬇️ Auto-downgrade to 480p — no buffering!', duration: 1500, packet: { from: 'cdn', to: 'player', label: '480p chunk', color: '#ff9800' }, nodeStates: { cdn: 'active', player: 'active', screen: 'active' }, activeConnections: ['p-c'] },
  ],
};

export const chatSim = {
  title: 'WhatsApp — Message Delivery Flow',
  description: 'Watch a message travel from sender to receiver',
  width: 600, height: 280,
  nodes: [
    { id: 'alice', x: 70, y: 140, label: 'Alice', icon: '👩' },
    { id: 'ws1', x: 220, y: 80, label: 'WS Server 1', icon: '📡' },
    { id: 'kafka', x: 370, y: 140, label: 'Kafka', icon: '📬' },
    { id: 'ws2', x: 220, y: 220, label: 'WS Server 2', icon: '📡' },
    { id: 'bob', x: 530, y: 140, label: 'Bob', icon: '👨' },
  ],
  connections: [
    { id: 'a-w1', from: 'alice', to: 'ws1' },
    { id: 'w1-k', from: 'ws1', to: 'kafka' },
    { id: 'k-w2', from: 'kafka', to: 'ws2' },
    { id: 'w2-b', from: 'ws2', to: 'bob' },
  ],
  steps: [
    { description: '👩 Alice types "Hey Bob!" and hits send', duration: 1500, nodeStates: { alice: 'active' } },
    { description: '📤 Message sent via WebSocket to Alice\'s server', duration: 1300, packet: { from: 'alice', to: 'ws1', label: '🔒 encrypted', color: '#2196f3' }, nodeStates: { alice: 'active', ws1: 'active' }, activeConnections: ['a-w1'] },
    { description: '✓ Single tick — message reached server', duration: 1000, nodeStates: { ws1: 'highlight', alice: 'active' } },
    { description: '📬 Persisted to Kafka (durable — never lost)', duration: 1300, packet: { from: 'ws1', to: 'kafka', label: 'Store msg', color: '#ff9800' }, nodeStates: { ws1: 'active', kafka: 'active' }, activeConnections: ['w1-k'] },
    { description: '🔍 Redis lookup: Bob is connected to WS Server 2', duration: 1200, nodeStates: { kafka: 'highlight' } },
    { description: '📨 Route message to Bob\'s WebSocket server', duration: 1300, packet: { from: 'kafka', to: 'ws2', label: 'Forward', color: '#9c27b0' }, nodeStates: { kafka: 'active', ws2: 'active' }, activeConnections: ['k-w2'] },
    { description: '📱 Delivered to Bob\'s phone via WebSocket', duration: 1300, packet: { from: 'ws2', to: 'bob', label: '🔓 decrypt', color: '#4caf50' }, nodeStates: { ws2: 'active', bob: 'active' }, activeConnections: ['w2-b'] },
    { description: '✓✓ Double tick — Bob received! Blue tick when Bob reads it.', duration: 1800, nodeStates: { alice: 'highlight', bob: 'highlight' } },
  ],
};


export const webCrawlerSim = {
  title: 'Web Crawler — Crawl & Index Flow',
  description: 'Watch how a crawler discovers and indexes web pages',
  width: 600, height: 280,
  nodes: [
    { id: 'frontier', x: 80, y: 140, label: 'URL Frontier', icon: '📋' },
    { id: 'fetcher', x: 250, y: 80, label: 'Fetcher', icon: '🕷️' },
    { id: 'web', x: 420, y: 80, label: 'Web Page', icon: '🌐' },
    { id: 'parser', x: 250, y: 220, label: 'Parser', icon: '🔍' },
    { id: 'store', x: 420, y: 220, label: 'Index Store', icon: '💾' },
    { id: 'dedup', x: 530, y: 140, label: 'Dedup Filter', icon: '🔄' },
  ],
  connections: [
    { id: 'f-fe', from: 'frontier', to: 'fetcher' },
    { id: 'fe-w', from: 'fetcher', to: 'web' },
    { id: 'w-p', from: 'web', to: 'parser' },
    { id: 'p-s', from: 'parser', to: 'store' },
    { id: 'p-d', from: 'parser', to: 'dedup' },
    { id: 'd-f', from: 'dedup', to: 'frontier' },
  ],
  steps: [
    { description: '📋 URL Frontier picks next URL to crawl (priority-based)', duration: 1300, nodeStates: { frontier: 'active' } },
    { description: '🕷️ Fetcher downloads the web page (respects robots.txt)', duration: 1500, packet: { from: 'frontier', to: 'fetcher', label: 'URL', color: '#2196f3' }, nodeStates: { frontier: 'active', fetcher: 'active' }, activeConnections: ['f-fe'] },
    { description: '🌐 Page downloaded — 500KB HTML content', duration: 1300, packet: { from: 'fetcher', to: 'web', label: 'GET', color: '#2196f3' }, nodeStates: { fetcher: 'active', web: 'active' }, activeConnections: ['fe-w'] },
    { description: '🔍 Parser extracts content + discovers 15 new links', duration: 1500, packet: { from: 'web', to: 'parser', label: 'HTML', color: '#ff9800' }, nodeStates: { web: 'active', parser: 'active' }, activeConnections: ['w-p'] },
    { description: '💾 Content stored in index for search', duration: 1200, packet: { from: 'parser', to: 'store', label: 'Index', color: '#4caf50' }, nodeStates: { parser: 'active', store: 'active' }, activeConnections: ['p-s'] },
    { description: '🔄 Bloom Filter checks: 10 URLs already seen, 5 are new', duration: 1500, packet: { from: 'parser', to: 'dedup', label: '15 URLs', color: '#9c27b0' }, nodeStates: { parser: 'active', dedup: 'active' }, activeConnections: ['p-d'] },
    { description: '📋 5 new URLs added to Frontier — cycle continues!', duration: 1500, packet: { from: 'dedup', to: 'frontier', label: '5 new', color: '#4caf50' }, nodeStates: { dedup: 'highlight', frontier: 'highlight' }, activeConnections: ['d-f'] },
  ],
};

export const newsfeedSim = {
  title: 'Facebook Newsfeed — Fanout on Write',
  description: 'Watch how a post reaches all friends\' feeds',
  width: 600, height: 300,
  nodes: [
    { id: 'author', x: 70, y: 150, label: 'Alice posts', icon: '👩' },
    { id: 'post', x: 220, y: 150, label: 'Post Service', icon: '📝' },
    { id: 'fanout', x: 370, y: 150, label: 'Fanout Svc', icon: '📢' },
    { id: 'f1', x: 530, y: 60, label: 'Bob\'s Feed', icon: '📰' },
    { id: 'f2', x: 530, y: 150, label: 'Carol\'s Feed', icon: '📰' },
    { id: 'f3', x: 530, y: 240, label: 'Dave\'s Feed', icon: '📰' },
  ],
  connections: [
    { id: 'a-p', from: 'author', to: 'post' },
    { id: 'p-f', from: 'post', to: 'fanout' },
    { id: 'f-f1', from: 'fanout', to: 'f1' },
    { id: 'f-f2', from: 'fanout', to: 'f2' },
    { id: 'f-f3', from: 'fanout', to: 'f3' },
  ],
  steps: [
    { description: '👩 Alice creates a new post: "Just got promoted! 🎉"', duration: 1500, nodeStates: { author: 'active' } },
    { description: '📝 Post saved to database', duration: 1300, packet: { from: 'author', to: 'post', label: 'New post', color: '#2196f3' }, nodeStates: { author: 'active', post: 'active' }, activeConnections: ['a-p'] },
    { description: '📢 Fanout Service gets Alice\'s friend list (500 friends)', duration: 1300, packet: { from: 'post', to: 'fanout', label: 'Fan out!', color: '#ff9800' }, nodeStates: { post: 'active', fanout: 'active' }, activeConnections: ['p-f'] },
    { description: '📰 Push post to Bob\'s feed cache', duration: 1000, packet: { from: 'fanout', to: 'f1', label: 'Post', color: '#4caf50' }, nodeStates: { fanout: 'active', f1: 'active' }, activeConnections: ['f-f1'] },
    { description: '📰 Push post to Carol\'s feed cache', duration: 1000, packet: { from: 'fanout', to: 'f2', label: 'Post', color: '#4caf50' }, nodeStates: { fanout: 'active', f2: 'active' }, activeConnections: ['f-f2'] },
    { description: '📰 Push post to Dave\'s feed cache', duration: 1000, packet: { from: 'fanout', to: 'f3', label: 'Post', color: '#4caf50' }, nodeStates: { fanout: 'active', f3: 'active' }, activeConnections: ['f-f3'] },
    { description: '✅ All 500 friends see Alice\'s post in their feed instantly!', duration: 1800, nodeStates: { f1: 'highlight', f2: 'highlight', f3: 'highlight', author: 'highlight' } },
  ],
};

export const urlShortenerSim = {
  title: 'URL Shortener — Shorten & Redirect',
  description: 'Watch how a URL gets shortened and redirected',
  width: 580, height: 260,
  nodes: [
    { id: 'user', x: 70, y: 130, label: 'User', icon: '👤' },
    { id: 'api', x: 240, y: 130, label: 'API Service', icon: '⚙️' },
    { id: 'db', x: 410, y: 60, label: 'Database', icon: '💾' },
    { id: 'cache', x: 410, y: 200, label: 'Redis Cache', icon: '⚡' },
    { id: 'dest', x: 540, y: 130, label: 'Destination', icon: '🌐' },
  ],
  connections: [
    { id: 'u-a', from: 'user', to: 'api' },
    { id: 'a-d', from: 'api', to: 'db' },
    { id: 'a-c', from: 'api', to: 'cache' },
    { id: 'a-de', from: 'api', to: 'dest' },
  ],
  steps: [
    { description: '📎 User submits long URL to shorten', duration: 1300, packet: { from: 'user', to: 'api', label: 'Long URL', color: '#2196f3' }, nodeStates: { user: 'active' }, activeConnections: ['u-a'] },
    { description: '🔢 Generate Base62 code from counter: abc123', duration: 1200, nodeStates: { api: 'active' } },
    { description: '💾 Store mapping: abc123 → long URL', duration: 1300, packet: { from: 'api', to: 'db', label: 'Save', color: '#ff9800' }, nodeStates: { api: 'active', db: 'active' }, activeConnections: ['a-d'] },
    { description: '✅ Return short URL: site.co/abc123', duration: 1200, packet: { from: 'api', to: 'user', label: 'site.co/abc123', color: '#4caf50' }, nodeStates: { api: 'highlight', user: 'active' }, activeConnections: ['u-a'] },
    { description: '🔗 Later: Someone clicks site.co/abc123', duration: 1500, packet: { from: 'user', to: 'api', label: 'GET /abc123', color: '#2196f3' }, nodeStates: { user: 'active' }, activeConnections: ['u-a'] },
    { description: '⚡ Check Redis cache first — HIT! Found the long URL', duration: 1200, packet: { from: 'api', to: 'cache', label: 'Lookup', color: '#4caf50' }, nodeStates: { api: 'active', cache: 'highlight' }, activeConnections: ['a-c'] },
    { description: '↩️ 302 Redirect to original long URL', duration: 1500, packet: { from: 'api', to: 'user', label: '302 Redirect', color: '#4caf50' }, nodeStates: { api: 'active', user: 'highlight', dest: 'highlight' }, activeConnections: ['u-a'] },
  ],
};

export const typeaheadSim = {
  title: 'Typeahead — Autocomplete Search',
  description: 'Watch how suggestions appear as you type',
  width: 560, height: 260,
  nodes: [
    { id: 'user', x: 70, y: 130, label: 'User types', icon: '⌨️' },
    { id: 'api', x: 240, y: 130, label: 'Typeahead Svc', icon: '🔍' },
    { id: 'trie', x: 420, y: 70, label: 'Trie (Memory)', icon: '🌳' },
    { id: 'rank', x: 420, y: 200, label: 'Ranker', icon: '📊' },
  ],
  connections: [
    { id: 'u-a', from: 'user', to: 'api' },
    { id: 'a-t', from: 'api', to: 'trie' },
    { id: 't-r', from: 'trie', to: 'rank' },
    { id: 'r-a', from: 'rank', to: 'api' },
  ],
  steps: [
    { description: '⌨️ User types "j" — debounce waits 150ms...', duration: 1200, nodeStates: { user: 'active' } },
    { description: '⌨️ User types "ja" — debounce waits...', duration: 800, nodeStates: { user: 'active' } },
    { description: '⌨️ User types "jav" — 150ms passed, send request!', duration: 1200, packet: { from: 'user', to: 'api', label: 'q=jav', color: '#2196f3' }, nodeStates: { user: 'active' }, activeConnections: ['u-a'] },
    { description: '🌳 Trie lookup: traverse j → a → v node', duration: 1200, packet: { from: 'api', to: 'trie', label: 'Prefix: jav', color: '#ff9800' }, nodeStates: { api: 'active', trie: 'active' }, activeConnections: ['a-t'] },
    { description: '🌳 Found pre-computed suggestions at "v" node', duration: 1000, nodeStates: { trie: 'highlight' } },
    { description: '📊 Rank by popularity: javascript(80K), java(50K), javafx(5K)', duration: 1200, packet: { from: 'trie', to: 'rank', label: '10 results', color: '#9c27b0' }, nodeStates: { trie: 'active', rank: 'active' }, activeConnections: ['t-r'] },
    { description: '✅ Top 5 suggestions returned in < 50ms!', duration: 1500, packet: { from: 'api', to: 'user', label: '5 suggestions', color: '#4caf50' }, nodeStates: { api: 'active', user: 'highlight' }, activeConnections: ['u-a'] },
  ],
};

export const cloudStorageSim = {
  title: 'Dropbox — File Sync with Chunking',
  description: 'Watch how a file edit syncs across devices',
  width: 600, height: 280,
  nodes: [
    { id: 'laptop', x: 70, y: 80, label: 'Laptop', icon: '💻' },
    { id: 'sync', x: 280, y: 140, label: 'Sync Service', icon: '🔄' },
    { id: 'store', x: 480, y: 80, label: 'S3 Storage', icon: '☁️' },
    { id: 'phone', x: 70, y: 220, label: 'Phone', icon: '📱' },
    { id: 'notify', x: 480, y: 220, label: 'Notification', icon: '🔔' },
  ],
  connections: [
    { id: 'l-s', from: 'laptop', to: 'sync' },
    { id: 's-st', from: 'sync', to: 'store' },
    { id: 's-n', from: 'sync', to: 'notify' },
    { id: 'n-p', from: 'notify', to: 'phone' },
    { id: 'p-s', from: 'phone', to: 'sync' },
  ],
  steps: [
    { description: '💻 User edits page 5 of a 100MB PDF on laptop', duration: 1500, nodeStates: { laptop: 'active' } },
    { description: '🔍 Client detects only chunk #5 changed (4MB of 100MB)', duration: 1300, nodeStates: { laptop: 'highlight' } },
    { description: '📤 Upload only the changed chunk (4MB, not 100MB!)', duration: 1500, packet: { from: 'laptop', to: 'sync', label: 'Chunk #5', color: '#2196f3' }, nodeStates: { laptop: 'active', sync: 'active' }, activeConnections: ['l-s'] },
    { description: '☁️ New chunk stored in S3, metadata updated', duration: 1300, packet: { from: 'sync', to: 'store', label: 'Store', color: '#ff9800' }, nodeStates: { sync: 'active', store: 'active' }, activeConnections: ['s-st'] },
    { description: '🔔 Push notification to all other devices', duration: 1300, packet: { from: 'sync', to: 'notify', label: 'File changed!', color: '#9c27b0' }, nodeStates: { sync: 'active', notify: 'active' }, activeConnections: ['s-n'] },
    { description: '📱 Phone receives notification, downloads only chunk #5', duration: 1500, packet: { from: 'notify', to: 'phone', label: 'Sync chunk #5', color: '#4caf50' }, nodeStates: { notify: 'active', phone: 'active' }, activeConnections: ['n-p'] },
    { description: '✅ Both devices in sync! Only 4MB transferred (not 100MB)', duration: 1800, nodeStates: { laptop: 'highlight', phone: 'highlight', store: 'highlight' } },
  ],
};


export const recommendationSim = {
  title: 'Recommendation Engine — How Netflix Suggests',
  description: 'Watch how recommendations are generated',
  width: 580, height: 260,
  nodes: [
    { id: 'user', x: 70, y: 130, label: 'User opens app', icon: '👤' },
    { id: 'api', x: 230, y: 130, label: 'Rec Service', icon: '🎯' },
    { id: 'cf', x: 400, y: 50, label: 'Collab Filter', icon: '👥' },
    { id: 'cb', x: 400, y: 130, label: 'Content-Based', icon: '🎬' },
    { id: 'trend', x: 400, y: 210, label: 'Trending', icon: '📈' },
  ],
  connections: [
    { id: 'u-a', from: 'user', to: 'api' },
    { id: 'a-cf', from: 'api', to: 'cf' },
    { id: 'a-cb', from: 'api', to: 'cb' },
    { id: 'a-tr', from: 'api', to: 'trend' },
  ],
  steps: [
    { description: '👤 User opens Netflix — request personalized feed', duration: 1300, packet: { from: 'user', to: 'api', label: 'Feed', color: '#2196f3' }, nodeStates: { user: 'active' }, activeConnections: ['u-a'] },
    { description: '👥 Collaborative: "Users like you watched Inception, Dark Knight"', duration: 1500, packet: { from: 'api', to: 'cf', label: 'Similar users', color: '#9c27b0' }, nodeStates: { api: 'active', cf: 'active' }, activeConnections: ['a-cf'] },
    { description: '🎬 Content-based: "You liked Sci-Fi → here\'s Interstellar"', duration: 1500, packet: { from: 'api', to: 'cb', label: 'Genre match', color: '#ff9800' }, nodeStates: { api: 'active', cb: 'active' }, activeConnections: ['a-cb'] },
    { description: '📈 Trending: "Popular in India right now"', duration: 1300, packet: { from: 'api', to: 'trend', label: 'Trending', color: '#4caf50' }, nodeStates: { api: 'active', trend: 'active' }, activeConnections: ['a-tr'] },
    { description: '🎯 ML model re-ranks 1000 candidates → Top 50 shown', duration: 1500, nodeStates: { api: 'highlight', cf: 'highlight', cb: 'highlight', trend: 'highlight' } },
    { description: '✅ Personalized homepage in < 200ms!', duration: 1500, packet: { from: 'api', to: 'user', label: '50 picks', color: '#4caf50' }, nodeStates: { user: 'highlight', api: 'active' }, activeConnections: ['u-a'] },
  ],
};

export const parkingLotSim = {
  title: 'Parking Lot — Vehicle Entry & Spot Assignment',
  description: 'Watch how a vehicle gets assigned a parking spot',
  width: 560, height: 260,
  nodes: [
    { id: 'car', x: 70, y: 130, label: 'Car arrives', icon: '🚗' },
    { id: 'gate', x: 210, y: 130, label: 'Entry Gate', icon: '🚧' },
    { id: 'ctrl', x: 360, y: 70, label: 'Controller', icon: '🧠' },
    { id: 'spot', x: 360, y: 200, label: 'Spot L2-A5', icon: '🅿️' },
    { id: 'ticket', x: 500, y: 130, label: 'Ticket', icon: '🎫' },
  ],
  connections: [
    { id: 'c-g', from: 'car', to: 'gate' },
    { id: 'g-ct', from: 'gate', to: 'ctrl' },
    { id: 'ct-s', from: 'ctrl', to: 'spot' },
    { id: 'ct-t', from: 'ctrl', to: 'ticket' },
  ],
  steps: [
    { description: '🚗 Car arrives at entry gate', duration: 1300, nodeStates: { car: 'active' } },
    { description: '🚧 Gate sensor detects vehicle type: Regular Car', duration: 1200, packet: { from: 'car', to: 'gate', label: 'Detect', color: '#2196f3' }, nodeStates: { car: 'active', gate: 'active' }, activeConnections: ['c-g'] },
    { description: '🧠 Controller searches: smallest suitable spot on nearest level', duration: 1500, packet: { from: 'gate', to: 'ctrl', label: 'Find spot', color: '#ff9800' }, nodeStates: { gate: 'active', ctrl: 'active' }, activeConnections: ['g-ct'] },
    { description: '🅿️ Found! Level 2, Row A, Spot 5 (Regular size) — CAS lock acquired', duration: 1500, packet: { from: 'ctrl', to: 'spot', label: 'Assign', color: '#4caf50' }, nodeStates: { ctrl: 'active', spot: 'highlight' }, activeConnections: ['ct-s'] },
    { description: '🎫 Ticket generated: Entry 10:30 AM, Spot L2-A5, Rate ₹40/hr', duration: 1300, packet: { from: 'ctrl', to: 'ticket', label: 'Print', color: '#4caf50' }, nodeStates: { ctrl: 'active', ticket: 'active' }, activeConnections: ['ct-t'] },
    { description: '🚧 Gate opens! Display shows "L2 → Row A → Spot 5"', duration: 1500, nodeStates: { gate: 'highlight', car: 'highlight', spot: 'highlight' } },
  ],
};

export const trafficControlSim = {
  title: 'Traffic Control — Signal State Machine',
  description: 'Watch traffic lights cycle through states safely',
  width: 560, height: 280,
  nodes: [
    { id: 'ns', x: 140, y: 70, label: 'North-South', icon: '🟢' },
    { id: 'ctrl', x: 280, y: 150, label: 'Controller', icon: '🧠' },
    { id: 'ew', x: 420, y: 70, label: 'East-West', icon: '🔴' },
    { id: 'sensor', x: 140, y: 230, label: 'Sensor', icon: '📡' },
    { id: 'emerg', x: 420, y: 230, label: 'Emergency', icon: '🚑' },
  ],
  connections: [
    { id: 'c-ns', from: 'ctrl', to: 'ns' },
    { id: 'c-ew', from: 'ctrl', to: 'ew' },
    { id: 's-c', from: 'sensor', to: 'ctrl' },
    { id: 'e-c', from: 'emerg', to: 'ctrl' },
  ],
  steps: [
    { description: '🟢 North-South: GREEN | 🔴 East-West: RED', duration: 2000, nodeStates: { ns: 'active', ew: 'error', ctrl: 'active' }, activeConnections: ['c-ns'] },
    { description: '🟡 North-South: YELLOW (5 sec warning)', duration: 1500, nodeStates: { ns: 'warn', ew: 'error', ctrl: 'active' } },
    { description: '🔴 ALL RED — 2 second safety buffer (cars clearing intersection)', duration: 1800, nodeStates: { ns: 'error', ew: 'error', ctrl: 'warn' } },
    { description: '🟢 East-West: GREEN | 🔴 North-South: RED', duration: 2000, nodeStates: { ns: 'error', ew: 'active', ctrl: 'active' }, activeConnections: ['c-ew'] },
    { description: '📡 Sensor detects heavy traffic on North-South road', duration: 1500, packet: { from: 'sensor', to: 'ctrl', label: '20 cars waiting', color: '#ff9800' }, nodeStates: { sensor: 'active', ctrl: 'active' }, activeConnections: ['s-c'] },
    { description: '🧠 Controller extends North-South green by 15 seconds next cycle', duration: 1200, nodeStates: { ctrl: 'highlight' } },
    { description: '🚑 EMERGENCY! Ambulance detected approaching from North!', duration: 1800, packet: { from: 'emerg', to: 'ctrl', label: 'OVERRIDE!', color: '#f44336' }, nodeStates: { emerg: 'error', ctrl: 'error' }, activeConnections: ['e-c'] },
    { description: '🔴 ALL RED → Then North: GREEN only. Ambulance passes safely!', duration: 2000, nodeStates: { ns: 'highlight', ew: 'error', ctrl: 'highlight', emerg: 'highlight' }, activeConnections: ['c-ns'] },
  ],
};

// Master lookup: tutorial ID → simulation config
export const simulationMap = {
  'rate-limiter': rateLimiterSim,
  'design-rate-limiter-distributed': rateLimiterSim,
  'cdn-deep-dive': cdnSim,
  'load-balancing': loadBalancerSim,
  'design-ride-sharing': rideSharingSim,
  'design-atm': atmSim,
  'design-netflix': netflixSim,
  'design-chat-system': chatSim,
  'design-web-crawler': webCrawlerSim,
  'design-newsfeed': newsfeedSim,
  'design-url-shortener': urlShortenerSim,
  'url-shortener': urlShortenerSim,
  'design-typeahead': typeaheadSim,
  'design-cloud-storage': cloudStorageSim,
  'design-recommendation': recommendationSim,
  'design-parking-lot': parkingLotSim,
  'design-traffic-control': trafficControlSim,
  'notification-system': newsfeedSim,
  'cache-system': cdnSim,
  'design-forum': newsfeedSim,
  'design-tic-tac-toe': parkingLotSim,
};
