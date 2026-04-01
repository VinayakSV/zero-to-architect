# Multithreading & Concurrency — Scenario-Based Guide

## The Restaurant Analogy

Imagine a restaurant:
- **Single-threaded** = 1 waiter serving all tables. Customers wait forever.
- **Multi-threaded** = 5 waiters serving tables in parallel. Fast service.
- **Concurrency issue** = 2 waiters grab the last plate at the same time. Someone gets nothing.

That's multithreading in a nutshell — **speed through parallelism**, but **chaos without coordination**.

---

## 1. Creating Threads — 3 Ways

### Way 1: Extend Thread

```java
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Running in: " + Thread.currentThread().getName());
    }
}

new MyThread().start();  // start(), NOT run()!
```

### Way 2: Implement Runnable (Preferred)

```java
Runnable task = () -> System.out.println("Running in: " + Thread.currentThread().getName());
new Thread(task).start();
```

### Way 3: Implement Callable (Returns a result)

```java
Callable<Integer> task = () -> {
    Thread.sleep(1000);
    return 42;
};

ExecutorService executor = Executors.newSingleThreadExecutor();
Future<Integer> future = executor.submit(task);
System.out.println(future.get());  // blocks until result is ready → 42
executor.shutdown();
```

> **Rule**: Never extend Thread. Always use Runnable/Callable. Why? Java doesn't support multiple inheritance — if you extend Thread, you can't extend anything else.

---

## 2. Thread Lifecycle

```mermaid
stateDiagram-v2
    [*] --> NEW: Thread created
    NEW --> RUNNABLE: start()
    RUNNABLE --> RUNNING: CPU picks it
    RUNNING --> RUNNABLE: yield() / time slice over
    RUNNING --> BLOCKED: waiting for lock
    BLOCKED --> RUNNABLE: lock acquired
    RUNNING --> WAITING: wait() / join()
    WAITING --> RUNNABLE: notify() / join completes
    RUNNING --> TIMED_WAITING: sleep(ms) / wait(ms)
    TIMED_WAITING --> RUNNABLE: time expires
    RUNNING --> TERMINATED: run() completes
    TERMINATED --> [*]
```

---

## 3. synchronized — The Lock

### Scenario: Bank account with race condition

```java
class BankAccount {
    private int balance = 1000;

    // WITHOUT synchronized — BROKEN
    public void withdraw(int amount) {
        if (balance >= amount) {
            // Thread A checks: balance=1000, amount=800 ✓
            // Thread B checks: balance=1000, amount=800 ✓ (hasn't been deducted yet!)
            balance -= amount;
            // Thread A: balance = 200
            // Thread B: balance = -600 💥 NEGATIVE BALANCE!
        }
    }

    // WITH synchronized — SAFE
    public synchronized void withdrawSafe(int amount) {
        if (balance >= amount) {
            balance -= amount;  // only one thread at a time
        }
    }
}
```

### synchronized block (finer control)

```java
public void transfer(BankAccount from, BankAccount to, int amount) {
    synchronized (from) {
        synchronized (to) {
            from.withdraw(amount);
            to.deposit(amount);
        }
    }
}
```

> ⚠️ **Deadlock danger!** If Thread A locks `from` then waits for `to`, and Thread B locks `to` then waits for `from` — both wait forever. Solution: always lock in the same order.

---

## 4. volatile — Visibility Guarantee

### Scenario: Stop flag not working

```java
class Worker implements Runnable {
    private boolean running = true;  // NOT volatile — might never stop!

    public void run() {
        while (running) {  // Thread may cache 'running' and never see the update
            doWork();
        }
    }

    public void stop() {
        running = false;  // Main thread sets this, but worker might not see it
    }
}
```

### The Fix

```java
private volatile boolean running = true;
// volatile = "always read from main memory, never cache"
```

### What volatile does NOT do

```java
private volatile int counter = 0;

// This is STILL NOT thread-safe:
counter++;  // This is actually: read → increment → write (3 steps, not atomic)

// Use AtomicInteger instead:
private AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet();  // atomic operation
```

---

## 5. ExecutorService — Thread Pool

### Why not create threads manually?

Creating a thread is expensive (~1MB stack memory). If you need 1000 tasks, don't create 1000 threads.

```java
// Thread pool with 4 threads — reuses them for all tasks
ExecutorService pool = Executors.newFixedThreadPool(4);

for (int i = 0; i < 100; i++) {
    final int taskId = i;
    pool.submit(() -> {
        System.out.println("Task " + taskId + " on " + Thread.currentThread().getName());
    });
}

pool.shutdown();  // no new tasks, finish existing ones
pool.awaitTermination(10, TimeUnit.SECONDS);  // wait for completion
```

### Types of Thread Pools

| Pool | Use Case |
|------|----------|
| `newFixedThreadPool(n)` | Known number of concurrent tasks |
| `newCachedThreadPool()` | Many short-lived tasks (creates threads as needed) |
| `newSingleThreadExecutor()` | Tasks must run sequentially |
| `newScheduledThreadPool(n)` | Delayed or periodic tasks |

### Scenario: Parallel API calls

```java
ExecutorService pool = Executors.newFixedThreadPool(3);

Future<User> userFuture = pool.submit(() -> fetchUser(userId));
Future<List<Order>> ordersFuture = pool.submit(() -> fetchOrders(userId));
Future<Profile> profileFuture = pool.submit(() -> fetchProfile(userId));

// All 3 calls run in parallel — total time = max(individual times)
User user = userFuture.get();
List<Order> orders = ordersFuture.get();
Profile profile = profileFuture.get();

pool.shutdown();
```

---

## 6. Locks — More Control Than synchronized

```java
import java.util.concurrent.locks.ReentrantLock;

class SafeCounter {
    private int count = 0;
    private final ReentrantLock lock = new ReentrantLock();

    public void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock();  // ALWAYS unlock in finally!
        }
    }

    // tryLock — don't wait forever
    public boolean tryIncrement() {
        if (lock.tryLock()) {
            try {
                count++;
                return true;
            } finally {
                lock.unlock();
            }
        }
        return false;  // couldn't get lock, do something else
    }
}
```

### ReadWriteLock — Multiple readers, single writer

```java
ReadWriteLock rwLock = new ReentrantReadWriteLock();

// Multiple threads can read simultaneously
public String read() {
    rwLock.readLock().lock();
    try {
        return data;
    } finally {
        rwLock.readLock().unlock();
    }
}

// Only one thread can write (and no readers during write)
public void write(String newData) {
    rwLock.writeLock().lock();
    try {
        data = newData;
    } finally {
        rwLock.writeLock().unlock();
    }
}
```

---

## 7. wait(), notify(), notifyAll()

### Scenario: Producer-Consumer

```java
class SharedQueue {
    private final Queue<Integer> queue = new LinkedList<>();
    private final int capacity = 5;

    public synchronized void produce(int item) throws InterruptedException {
        while (queue.size() == capacity) {
            wait();  // queue full — wait for consumer
        }
        queue.add(item);
        System.out.println("Produced: " + item);
        notifyAll();  // wake up consumers
    }

    public synchronized int consume() throws InterruptedException {
        while (queue.isEmpty()) {
            wait();  // queue empty — wait for producer
        }
        int item = queue.poll();
        System.out.println("Consumed: " + item);
        notifyAll();  // wake up producers
        return item;
    }
}
```

> **Always use `while` with `wait()`, never `if`.** A thread can be woken up spuriously — the condition might still be false.

---

## 8. Atomic Classes — Lock-Free Thread Safety

```java
AtomicInteger counter = new AtomicInteger(0);

counter.incrementAndGet();     // ++counter (atomic)
counter.getAndIncrement();     // counter++ (atomic)
counter.compareAndSet(5, 10);  // if value==5, set to 10 (CAS operation)
counter.addAndGet(5);          // counter += 5 (atomic)

// Also available:
AtomicLong, AtomicBoolean, AtomicReference<T>
```

### Scenario: Thread-safe ID generator

```java
class IdGenerator {
    private static final AtomicLong counter = new AtomicLong(0);

    public static long nextId() {
        return counter.incrementAndGet();  // guaranteed unique across threads
    }
}
```

---

## 9. CountDownLatch & CyclicBarrier

### CountDownLatch — "Wait for N things to finish"

```java
// Scenario: Start the app only after all services are ready
CountDownLatch latch = new CountDownLatch(3);

executor.submit(() -> { initDatabase(); latch.countDown(); });
executor.submit(() -> { initCache(); latch.countDown(); });
executor.submit(() -> { initMessageQueue(); latch.countDown(); });

latch.await();  // blocks until count reaches 0
System.out.println("All services ready — starting app!");
```

### CyclicBarrier — "Everyone wait until all arrive"

```java
// Scenario: Parallel computation — merge results after all threads finish a phase
CyclicBarrier barrier = new CyclicBarrier(3, () -> {
    System.out.println("All threads reached barrier — merging results");
});

for (int i = 0; i < 3; i++) {
    executor.submit(() -> {
        computePartialResult();
        barrier.await();  // wait for others
        // continue to next phase
    });
}
```

---

## 10. Common Pitfalls Cheat Sheet

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Race condition | Inconsistent data | `synchronized` or `Atomic*` |
| Deadlock | App hangs forever | Lock ordering, `tryLock` with timeout |
| Starvation | One thread never runs | Fair locks: `new ReentrantLock(true)` |
| Livelock | Threads active but no progress | Add randomness to retry |
| Memory visibility | Stale values | `volatile` or `synchronized` |
| Thread leak | OOM over time | Always `shutdown()` ExecutorService |

---

---

## 🎯 Interview Corner

<div class="callout-interview">

**Q: "Explain the difference between synchronized, volatile, and Atomic classes. When would you use each?"**

synchronized gives you mutual exclusion — only one thread enters the block at a time. Use it when you have a sequence of operations that must be atomic (check-then-act, read-modify-write on multiple variables). volatile gives you visibility — changes by one thread are immediately visible to others. Use it for simple flags like a stop boolean. But volatile doesn't make compound operations atomic — `counter++` is still broken with volatile because it's read-increment-write (3 steps). Atomic classes like AtomicInteger use CAS (Compare-And-Swap) for lock-free atomic operations on a single variable. Use them for counters, sequence generators, and simple accumulators where you need both atomicity and performance.

</div>

<div class="callout-interview">

**Q: "How would you design a thread pool for a service that makes both CPU-intensive calculations and I/O calls to external APIs?"**

I'd use two separate thread pools. For CPU-bound work, a fixed pool sized to the number of CPU cores (Runtime.getRuntime().availableProcessors()) — more threads than cores just adds context-switching overhead. For I/O-bound work, a larger pool because threads spend most of their time waiting. The size depends on the I/O wait ratio: if threads wait 90% of the time, you can have 10x more threads than cores. Keeping them separate prevents a slow API call from starving CPU work. In Spring, you'd configure separate TaskExecutors with @Async annotations specifying which pool to use.

**Follow-up trap**: "Why not just use a CachedThreadPool for everything?" → CachedThreadPool creates unlimited threads. If 10,000 requests arrive and each makes a slow API call, you get 10,000 threads — each consuming ~1MB stack memory. That's 10GB just for thread stacks. You'll hit OOM. Always bound your pools.

</div>

<div class="callout-interview">

**Q: "What causes a deadlock and how do you prevent it?"**

Deadlock needs 4 conditions simultaneously: mutual exclusion (resource can't be shared), hold-and-wait (thread holds one lock while waiting for another), no preemption (locks can't be forcibly taken), and circular wait (A waits for B, B waits for A). Remove any one condition and deadlock is impossible. The most practical prevention is eliminating circular wait: always acquire locks in a consistent global order. If you need locks on Account A and Account B, always lock the one with the lower ID first. Alternatively, use tryLock() with a timeout — if you can't get the second lock within 500ms, release the first and retry.

</div>

<div class="callout-interview">

**Q: "Your production service is hanging intermittently. How do you diagnose if it's a threading issue?"**

First, take a thread dump: `jstack <pid>` or `kill -3 <pid>`. Look for threads in BLOCKED state — they're waiting for a lock. If two threads are each BLOCKED waiting for a lock the other holds, that's a deadlock (JVM actually reports this). If many threads are WAITING on the same lock, that's contention — one thread is holding a lock too long (maybe doing I/O inside a synchronized block). For intermittent issues, take 3-4 thread dumps 5 seconds apart and compare — threads stuck in the same place across dumps indicate the problem. In production, tools like Async Profiler or JFR (Java Flight Recorder) can capture this continuously without significant overhead.

</div>

<div class="callout-tip">

**Applying this** — In real projects, prefer higher-level concurrency utilities over raw threads and locks. Use ExecutorService for thread management, CompletableFuture for async composition, ConcurrentHashMap for shared state, and BlockingQueue for producer-consumer. If you find yourself writing synchronized blocks, ask: "Can I avoid shared mutable state entirely?" Immutable objects, thread-local variables, and message passing eliminate entire categories of concurrency bugs.

</div>

---

> **Golden rule of concurrency**: If you can avoid shared mutable state, do it. Use immutable objects, thread-local variables, or message passing. The best lock is the one you don't need.
