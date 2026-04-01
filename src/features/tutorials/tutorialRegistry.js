import {
  Architecture, Speed, Dns, CloudQueue, AccountBalance, Memory,
  Code, DataObject, Hub, Layers, Cached, Settings, Sync,
  AccountTree, Storage, Api, Security, Bolt, Category, Stream,
  CloudUpload, LiveTv, CompareArrows, Shield, Cloud, SmartToy,
  Gavel, Waves,
} from '@mui/icons-material';

const tutorialRegistry = [
  // ── System Design ──
  {
    id: 'url-shortener',
    title: 'URL Shortener',
    description: 'Design a scalable URL shortening service like TinyURL / Bitly',
    category: 'System Design',
    subcategory: 'Classic Designs',
    icon: Dns,
    tags: ['HLD', 'LLD', 'Hashing', 'Database'],
  },
  {
    id: 'rate-limiter',
    title: 'Rate Limiter',
    description: 'Design a distributed rate limiter to protect APIs from abuse',
    category: 'System Design',
    subcategory: 'Classic Designs',
    icon: Speed,
    tags: ['HLD', 'LLD', 'Token Bucket', 'Sliding Window'],
  },
  {
    id: 'payment-gateway',
    title: 'Payment Gateway',
    description: 'Design a payment processing system — idempotency, retries, reconciliation',
    category: 'System Design',
    subcategory: 'Financial Domain',
    icon: AccountBalance,
    tags: ['HLD', 'LLD', 'Idempotency', 'Transactions', 'Finance'],
  },
  {
    id: 'stock-trading-platform',
    title: 'Stock Trading Platform',
    description: 'Design a real-time stock trading system with order matching engine',
    category: 'System Design',
    subcategory: 'Financial Domain',
    icon: AccountBalance,
    tags: ['HLD', 'Order Matching', 'Event Sourcing', 'Finance'],
  },
  {
    id: 'fraud-detection-system',
    title: 'Fraud Detection System',
    description: 'Design a real-time fraud detection pipeline for financial transactions',
    category: 'System Design',
    subcategory: 'Financial Domain',
    icon: Security,
    tags: ['HLD', 'Stream Processing', 'ML Pipeline', 'Finance'],
  },
  {
    id: 'cache-system',
    title: 'Distributed Cache',
    description: 'Design a distributed caching system — eviction, consistency, replication',
    category: 'System Design',
    subcategory: 'Infrastructure',
    icon: Cached,
    tags: ['HLD', 'LLD', 'LRU', 'Consistent Hashing', 'Redis'],
  },
  {
    id: 'notification-system',
    title: 'Notification System',
    description: 'Design a multi-channel notification system — push, email, SMS at scale',
    category: 'System Design',
    subcategory: 'Classic Designs',
    icon: CloudQueue,
    tags: ['HLD', 'Message Queue', 'Fan-out', 'Priority'],
  },

  // ── Real-World Builds ──
  {
    id: 'data-ingestion-platform',
    title: 'Data Ingestion Platform',
    description: 'Multi-tenant CSV/file upload system — heavy data processing, parallel pipelines, tenant isolation at scale',
    category: 'Real-World Builds',
    subcategory: 'Data Engineering',
    icon: CloudUpload,
    tags: ['Multi-Tenant', 'CSV', 'Batch Processing', 'S3', 'Kafka', 'Worker Pools'],
  },
  {
    id: 'live-streaming-platform',
    title: 'Live Streaming Platform',
    description: 'HotStar/Netflix-scale live streaming — millions of concurrent viewers, CDN, adaptive bitrate, chat',
    category: 'Real-World Builds',
    subcategory: 'High-Scale Systems',
    icon: LiveTv,
    tags: ['CDN', 'HLS', 'WebSocket', 'Edge Computing', 'Millions RPS'],
  },

  // ── Architecture Decisions ──
  {
    id: 'database-decisions',
    title: 'Database Decisions',
    description: 'SQL vs NoSQL, sharding strategies, indexing, schema design — when to pick what and why',
    category: 'Architecture Decisions',
    subcategory: 'Data Layer',
    icon: Storage,
    tags: ['SQL', 'NoSQL', 'Sharding', 'Indexing', 'Schema Design', 'DynamoDB', 'PostgreSQL'],
  },
  {
    id: 'caching-strategy',
    title: 'Caching Strategy',
    description: 'Redis vs Memcached vs local cache — eviction policies, invalidation patterns, cache-aside vs write-through',
    category: 'Architecture Decisions',
    subcategory: 'Data Layer',
    icon: Cached,
    tags: ['Redis', 'Memcached', 'Cache-Aside', 'Write-Through', 'TTL', 'Invalidation'],
  },
  {
    id: 'messaging-decisions',
    title: 'Messaging & Event Systems',
    description: 'Kafka vs RabbitMQ vs SQS vs SNS — delivery guarantees, ordering, throughput, when to use each',
    category: 'Architecture Decisions',
    subcategory: 'Communication',
    icon: Stream,
    tags: ['Kafka', 'RabbitMQ', 'SQS', 'SNS', 'Event-Driven', 'Pub/Sub'],
  },
  {
    id: 'auth-security-decisions',
    title: 'Auth & Security Decisions',
    description: 'OAuth2, OIDC, x509, JWT, session — SPA vs server app vs API, Auth0, Cognito, real-world flows',
    category: 'Architecture Decisions',
    subcategory: 'Security',
    icon: Shield,
    tags: ['OAuth2', 'OIDC', 'JWT', 'x509', 'Auth0', 'Cognito', 'SPA', 'mTLS'],
  },
  {
    id: 'cloud-infra-decisions',
    title: 'Cloud & Infrastructure',
    description: 'AWS services decision tree — ALB vs NLB, Lambda vs ECS vs EKS, RDS vs DynamoDB, Secrets Manager, VPC design',
    category: 'Architecture Decisions',
    subcategory: 'Cloud & DevOps',
    icon: Cloud,
    tags: ['AWS', 'ALB', 'NLB', 'Lambda', 'ECS', 'EKS', 'Docker', 'K8s', 'Terraform'],
  },
  {
    id: 'ai-in-system-design',
    title: 'AI in System Design',
    description: 'When and where to include AI/ML — RAG, embeddings, LLM integration, model serving, cost vs accuracy trade-offs',
    category: 'Architecture Decisions',
    subcategory: 'AI & ML Integration',
    icon: SmartToy,
    tags: ['AI', 'RAG', 'LLM', 'Embeddings', 'Model Serving', 'Vector DB', 'Cost Trade-offs'],
  },

  // ── Microservices ──
  {
    id: 'microservices-patterns',
    title: 'Microservices Patterns',
    description: 'Saga, CQRS, Event Sourcing, Circuit Breaker — when and why to use each',
    category: 'Microservices',
    subcategory: 'Patterns & Approaches',
    icon: Hub,
    tags: ['Saga', 'CQRS', 'Event Sourcing', 'Circuit Breaker'],
  },
  {
    id: 'service-communication',
    title: 'Service Communication',
    description: 'REST vs gRPC vs messaging — sync vs async, when to pick what',
    category: 'Microservices',
    subcategory: 'Patterns & Approaches',
    icon: Api,
    tags: ['REST', 'gRPC', 'Kafka', 'RabbitMQ'],
  },
  {
    id: 'api-gateway-pattern',
    title: 'API Gateway Pattern',
    description: 'Routing, auth, rate limiting, aggregation — the front door of microservices',
    category: 'Microservices',
    subcategory: 'Patterns & Approaches',
    icon: Layers,
    tags: ['API Gateway', 'BFF', 'Routing', 'Auth'],
  },
  {
    id: 'distributed-transactions',
    title: 'Distributed Transactions',
    description: '2PC, Saga, Outbox pattern — handling transactions across services',
    category: 'Microservices',
    subcategory: 'Data Management',
    icon: Sync,
    tags: ['2PC', 'Saga', 'Outbox', 'Eventual Consistency'],
  },
  {
    id: 'kafka-deep-dive',
    title: 'Apache Kafka Deep Dive',
    description: 'Producers, consumers, partitions, offsets — hands-on with Docker setup for Windows & Mac',
    category: 'Microservices',
    subcategory: 'Messaging & Streaming',
    icon: Stream,
    tags: ['Kafka', 'Event Streaming', 'Producers', 'Consumers', 'Hands-On'],
  },
  {
    id: 'service-discovery',
    title: 'Service Discovery & Config',
    description: 'How services find each other — Eureka, Consul, K8s DNS, externalized config',
    category: 'Microservices',
    subcategory: 'Infrastructure',
    icon: Settings,
    tags: ['Eureka', 'Consul', 'Config Server', 'K8s'],
  },

  // ── Java Core ──
  {
    id: 'hashmap-internals',
    title: 'HashMap Internals',
    description: 'How HashMap really works — hashing, buckets, tree-ification, resize with real scenarios',
    category: 'Java',
    subcategory: 'Collections & Data Structures',
    icon: DataObject,
    tags: ['HashMap', 'Hashing', 'Internals', 'Scenarios'],
  },
  {
    id: 'concurrent-hashmap',
    title: 'ConcurrentHashMap Deep Dive',
    description: 'Thread-safe maps — segment locking vs CAS, real-world usage scenarios',
    category: 'Java',
    subcategory: 'Collections & Data Structures',
    icon: DataObject,
    tags: ['ConcurrentHashMap', 'Thread Safety', 'CAS'],
  },
  {
    id: 'multithreading',
    title: 'Multithreading & Concurrency',
    description: 'Threads, executors, locks, synchronized, volatile — scenario-based with examples',
    category: 'Java',
    subcategory: 'Concurrency & Parallelism',
    icon: AccountTree,
    tags: ['Threads', 'ExecutorService', 'Locks', 'Volatile'],
  },
  {
    id: 'completable-future',
    title: 'CompletableFuture & Parallel Streams',
    description: 'Async programming in Java — chaining, combining, error handling with real examples',
    category: 'Java',
    subcategory: 'Concurrency & Parallelism',
    icon: Bolt,
    tags: ['CompletableFuture', 'Parallel Streams', 'Async'],
  },
  {
    id: 'java8-features',
    title: 'Java 8 — All Features',
    description: 'Lambdas, Streams, Optional, Functional Interfaces, Method References — with executable examples',
    category: 'Java',
    subcategory: 'Java 8',
    icon: Code,
    tags: ['Lambda', 'Streams', 'Optional', 'Functional Interface'],
  },
  {
    id: 'java17-features',
    title: 'Java 17 — All Features',
    description: 'Records, Sealed Classes, Pattern Matching, Text Blocks — with executable examples',
    category: 'Java',
    subcategory: 'Java 17',
    icon: Code,
    tags: ['Records', 'Sealed Classes', 'Pattern Matching', 'Text Blocks'],
  },
  {
    id: 'java-memory-model',
    title: 'Java Memory Model',
    description: 'Heap, stack, GC, memory leaks — understand where your objects live and die',
    category: 'Java',
    subcategory: 'JVM Internals',
    icon: Memory,
    tags: ['JVM', 'Heap', 'Stack', 'GC', 'Memory Leaks'],
  },
  {
    id: 'java-coding-standards',
    title: 'Java Coding Standards',
    description: 'Team lead / architect guide — naming, structure, Git workflow, PR reviews, SOLID, testing, anti-patterns',
    category: 'Java',
    subcategory: 'Coding Standards & Best Practices',
    icon: Gavel,
    tags: ['Coding Standards', 'Git', 'PR Review', 'SOLID', 'Clean Code', 'Team Lead'],
  },
  {
    id: 'reactive-programming',
    title: 'Reactive Programming',
    description: 'Project Reactor, WebFlux, backpressure, R2DBC — when reactive makes sense and when it doesn\'t',
    category: 'Java',
    subcategory: 'Reactive Programming',
    icon: Waves,
    tags: ['Reactor', 'WebFlux', 'Mono', 'Flux', 'Backpressure', 'R2DBC'],
  },
];

export const getCategories = () => [...new Set(tutorialRegistry.map((t) => t.category))];

export const getSubcategories = (category) =>
  [...new Set(tutorialRegistry.filter((t) => t.category === category).map((t) => t.subcategory))];

export const getTutorialsByCategory = (category) =>
  tutorialRegistry.filter((t) => t.category === category);

export const getTutorialsBySubcategory = (category, subcategory) =>
  tutorialRegistry.filter((t) => t.category === category && t.subcategory === subcategory);

export const getTutorialById = (id) => tutorialRegistry.find((t) => t.id === id);

export const getCategoryIcon = (category) => {
  const map = {
    'System Design': Architecture,
    'Real-World Builds': CloudUpload,
    'Architecture Decisions': CompareArrows,
    'Microservices': Hub,
    'Java': Code,
  };
  return map[category] || Category;
};

export const getAdjacentTutorials = (id) => {
  const idx = tutorialRegistry.findIndex((t) => t.id === id);
  return {
    prev: idx > 0 ? tutorialRegistry[idx - 1] : null,
    next: idx < tutorialRegistry.length - 1 ? tutorialRegistry[idx + 1] : null,
  };
};

export default tutorialRegistry;
