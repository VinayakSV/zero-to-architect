# Java 8 — All Features Explained with Real Scenarios

## Why Java 8 Was a Game Changer

Before Java 8, writing Java felt like writing an essay when you just needed a tweet. Java 8 brought **functional programming** to Java — less boilerplate, more expressive code.

---

## 1. Lambda Expressions

### The Problem (Before Java 8)

```java
// To sort a list, you needed this monster:
Collections.sort(names, new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.compareTo(b);
    }
});
```

### The Solution (Java 8)

```java
// Same thing, one line:
names.sort((a, b) -> a.compareTo(b));

// Even shorter with method reference:
names.sort(String::compareTo);
```

### Real Scenario: Filtering employees by salary

```java
// Before: 10 lines of loop + if
List<Employee> highPaid = new ArrayList<>();
for (Employee e : employees) {
    if (e.getSalary() > 50000) {
        highPaid.add(e);
    }
}

// After: 1 line
List<Employee> highPaid = employees.stream()
    .filter(e -> e.getSalary() > 50000)
    .collect(Collectors.toList());
```

> **Think of lambdas as**: "Here's a small recipe I'm handing you — do this when the time comes."

---

## 2. Functional Interfaces

A functional interface has **exactly one abstract method**. Lambdas work because of these.

### The 4 Core Functional Interfaces

| Interface | Method | Takes | Returns | Use Case |
|-----------|--------|-------|---------|----------|
| `Predicate<T>` | `test(T)` | T | boolean | Filtering |
| `Function<T,R>` | `apply(T)` | T | R | Transforming |
| `Consumer<T>` | `accept(T)` | T | void | Side effects (print, save) |
| `Supplier<T>` | `get()` | nothing | T | Lazy creation |

### Scenario: Building a flexible validation system

```java
// Instead of hardcoding validation rules:
Predicate<String> isNotEmpty = s -> !s.isEmpty();
Predicate<String> isEmail = s -> s.contains("@");
Predicate<String> isValidEmail = isNotEmpty.and(isEmail);

// Now you can compose rules:
if (isValidEmail.test(userInput)) {
    System.out.println("Valid!");
}
```

### Scenario: Configurable data transformer

```java
Function<String, String> trim = String::trim;
Function<String, String> toUpper = String::toUpperCase;
Function<String, String> sanitize = trim.andThen(toUpper);

String result = sanitize.apply("  hello world  ");  // "HELLO WORLD"
```

---

## 3. Streams API

### Think of Streams Like a Factory Assembly Line

```
Raw Materials → Filter → Transform → Sort → Package → Ship
   (source)   (filter)    (map)     (sorted) (collect) (terminal)
```

Each station does ONE thing and passes the result to the next.

### Key Operations

```java
List<Employee> employees = getEmployees();

// 1. Filter + Map + Collect
List<String> seniorNames = employees.stream()
    .filter(e -> e.getYearsOfExp() > 5)        // keep seniors
    .map(Employee::getName)                      // extract names
    .sorted()                                    // alphabetical
    .collect(Collectors.toList());               // gather results

// 2. Find first match
Optional<Employee> first = employees.stream()
    .filter(e -> e.getDepartment().equals("Engineering"))
    .findFirst();

// 3. Check conditions
boolean allActive = employees.stream().allMatch(Employee::isActive);
boolean anyRemote = employees.stream().anyMatch(Employee::isRemote);

// 4. Reduce — combine all elements into one
int totalSalary = employees.stream()
    .mapToInt(Employee::getSalary)
    .sum();

// 5. Grouping
Map<String, List<Employee>> byDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDepartment));

// 6. Partitioning (split into two groups)
Map<Boolean, List<Employee>> seniorVsJunior = employees.stream()
    .collect(Collectors.partitioningBy(e -> e.getYearsOfExp() > 5));
```

### Scenario: E-commerce order processing

```java
// "Give me the top 3 most expensive orders from VIP customers this month"
List<Order> result = orders.stream()
    .filter(o -> o.getCustomer().isVip())
    .filter(o -> o.getDate().getMonth() == LocalDate.now().getMonth())
    .sorted(Comparator.comparing(Order::getTotal).reversed())
    .limit(3)
    .collect(Collectors.toList());
```

### Lazy Evaluation — Streams Don't Do Work Until They Must

```java
// Nothing happens here — no filtering, no mapping
Stream<String> stream = names.stream()
    .filter(n -> {
        System.out.println("Filtering: " + n);
        return n.startsWith("A");
    })
    .map(n -> {
        System.out.println("Mapping: " + n);
        return n.toUpperCase();
    });

// Work starts HERE when you call a terminal operation
List<String> result = stream.collect(Collectors.toList());
```

> **Important**: Streams are **lazy** — intermediate operations build a pipeline, terminal operations trigger execution.

---

## 4. Optional — No More NullPointerException

### The Problem

```java
// This code is a NullPointerException waiting to happen:
String city = user.getAddress().getCity().toUpperCase();
```

### The Solution

```java
String city = Optional.ofNullable(user)
    .map(User::getAddress)
    .map(Address::getCity)
    .map(String::toUpperCase)
    .orElse("UNKNOWN");
```

### Key Methods

```java
// Creating
Optional<String> opt1 = Optional.of("hello");        // throws if null
Optional<String> opt2 = Optional.ofNullable(value);   // safe with null
Optional<String> opt3 = Optional.empty();              // empty optional

// Using
opt.isPresent();                    // true/false
opt.ifPresent(v -> print(v));       // do something if present
opt.orElse("default");              // get value or default
opt.orElseGet(() -> compute());     // lazy default
opt.orElseThrow(() -> new Ex());    // throw if empty
opt.map(String::toUpperCase);       // transform if present
opt.filter(s -> s.length() > 3);    // filter if present
opt.flatMap(this::findById);        // chain optionals
```

### Scenario: Safe database lookup chain

```java
// Find user → get their subscription → get the plan name
String planName = userRepository.findById(userId)        // Optional<User>
    .flatMap(User::getSubscription)                       // Optional<Subscription>
    .map(Subscription::getPlanName)                       // Optional<String>
    .orElse("Free Plan");
```

> **Rule of thumb**: Never use Optional as a field or method parameter. Use it only as a **return type** to signal "this might not have a value."

---

## 5. Method References

Four types — all are shortcuts for lambdas:

```java
// 1. Static method reference
Function<String, Integer> parse = Integer::parseInt;
// same as: s -> Integer.parseInt(s)

// 2. Instance method of a particular object
String prefix = "Hello";
Predicate<String> startsWith = prefix::startsWith;
// same as: s -> prefix.startsWith(s)

// 3. Instance method of an arbitrary object
Function<String, String> toUpper = String::toUpperCase;
// same as: s -> s.toUpperCase()

// 4. Constructor reference
Supplier<ArrayList<String>> listMaker = ArrayList::new;
// same as: () -> new ArrayList<>()
```

---

## 6. Default Methods in Interfaces

Before Java 8, adding a method to an interface broke every class that implemented it. Now:

```java
public interface Sortable<T> {
    List<T> getItems();

    // Default method — implementations get this for free
    default List<T> getSorted(Comparator<T> comparator) {
        List<T> copy = new ArrayList<>(getItems());
        copy.sort(comparator);
        return copy;
    }
}
```

### Scenario: Evolving an API without breaking clients

```java
public interface PaymentProcessor {
    void processPayment(Payment payment);

    // Added later — existing implementations don't break
    default void processRefund(Payment payment) {
        throw new UnsupportedOperationException("Refunds not supported");
    }

    // Static helper method
    static PaymentProcessor getDefault() {
        return new StripeProcessor();
    }
}
```

---

## 7. New Date/Time API (java.time)

The old `Date` and `Calendar` were mutable, confusing, and not thread-safe. Java 8 fixed everything:

```java
// Immutable, clear, thread-safe
LocalDate today = LocalDate.now();                    // 2024-01-15
LocalTime now = LocalTime.now();                      // 14:30:00
LocalDateTime dateTime = LocalDateTime.now();         // 2024-01-15T14:30:00
ZonedDateTime zoned = ZonedDateTime.now(ZoneId.of("America/New_York"));

// Operations (all return NEW objects — immutable!)
LocalDate nextWeek = today.plusWeeks(1);
LocalDate lastMonth = today.minusMonths(1);

// Parsing and formatting
LocalDate parsed = LocalDate.parse("2024-01-15");
String formatted = today.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

// Duration and Period
Duration duration = Duration.between(startTime, endTime);  // hours, minutes, seconds
Period period = Period.between(startDate, endDate);          // years, months, days
```

### Scenario: Calculate business days between two dates

```java
long businessDays = startDate.datesUntil(endDate)
    .filter(d -> d.getDayOfWeek() != DayOfWeek.SATURDAY)
    .filter(d -> d.getDayOfWeek() != DayOfWeek.SUNDAY)
    .count();
```

---

## 8. CompletableFuture (Intro)

```java
// Run something async and chain operations
CompletableFuture.supplyAsync(() -> fetchUserFromDB(userId))
    .thenApply(user -> enrichWithProfile(user))
    .thenAccept(user -> sendWelcomeEmail(user))
    .exceptionally(ex -> { log.error("Failed", ex); return null; });
```

> Deep dive in the **CompletableFuture & Parallel Streams** tutorial.

---

## 9. Collectors — The Swiss Army Knife

```java
// toList, toSet, toMap
List<String> names = employees.stream().map(Employee::getName).collect(Collectors.toList());
Set<String> depts = employees.stream().map(Employee::getDept).collect(Collectors.toSet());
Map<Integer, String> idToName = employees.stream()
    .collect(Collectors.toMap(Employee::getId, Employee::getName));

// joining
String csv = names.stream().collect(Collectors.joining(", "));  // "Alice, Bob, Charlie"

// summarizing
IntSummaryStatistics stats = employees.stream()
    .collect(Collectors.summarizingInt(Employee::getSalary));
// stats.getAverage(), stats.getMax(), stats.getMin(), stats.getSum(), stats.getCount()

// groupingBy with downstream collector
Map<String, Double> avgSalaryByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDept,
        Collectors.averagingInt(Employee::getSalary)
    ));
```

---

## 10. Quick Reference Card

| Feature | What It Does | One-Liner Example |
|---------|-------------|-------------------|
| Lambda | Anonymous function | `(a, b) -> a + b` |
| Stream | Pipeline processing | `list.stream().filter().map().collect()` |
| Optional | Null-safe wrapper | `Optional.ofNullable(x).orElse(default)` |
| Method Ref | Lambda shortcut | `String::toUpperCase` |
| Default Method | Interface evolution | `default void log() { ... }` |
| java.time | Immutable dates | `LocalDate.now().plusDays(7)` |
| Functional Interface | Lambda target | `Predicate<T>`, `Function<T,R>` |

---

---

## 🎯 Interview Corner

<div class="callout-interview">

**Q: "Explain the Stream pipeline. What's the difference between intermediate and terminal operations?"**

A Stream pipeline has three parts: a source (collection, array, generator), zero or more intermediate operations (filter, map, sorted — these are lazy and return a new Stream), and one terminal operation (collect, forEach, reduce — this triggers execution). Nothing happens until the terminal operation is called. This is important because it means the pipeline can optimize: if you do `.filter().map().findFirst()`, it doesn't filter the entire list then map the entire list — it processes one element at a time through the full chain and stops at the first match.

</div>

<div class="callout-interview">

**Q: "What's the difference between map() and flatMap() in Streams?"**

map() transforms each element one-to-one: `Stream<String>` → `Stream<Integer>` via `map(String::length)`. flatMap() transforms each element into a stream and flattens them: if each customer has a list of orders, `customers.stream().map(Customer::getOrders)` gives you `Stream<List<Order>>` — a stream of lists. `customers.stream().flatMap(c -> c.getOrders().stream())` gives you `Stream<Order>` — all orders flattened into one stream. Use flatMap whenever you need to "unwrap" nested collections.

**Follow-up trap**: "What about flatMap with Optional?" → Same concept. `optional.map(User::getAddress)` returns `Optional<Optional<Address>>` if getAddress() returns Optional. `optional.flatMap(User::getAddress)` unwraps it to `Optional<Address>`.

</div>

<div class="callout-interview">

**Q: "When should you use Optional and when shouldn't you?"**

Use Optional as a return type to signal "this method might not return a value" — like findById() returning Optional<User>. Don't use Optional as a method parameter (it forces callers to wrap values), as a class field (it's not Serializable and adds overhead), or in collections (use an empty collection instead). Never call get() without checking isPresent() first — that defeats the purpose. Prefer orElse(), orElseThrow(), or map() chains. The goal is to make the "might be absent" case explicit in the API contract so callers can't forget to handle it.

</div>

<div class="callout-interview">

**Q: "Write a stream pipeline that groups employees by department, then finds the highest-paid employee in each department."**

```java
Map<String, Optional<Employee>> topByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,
        Collectors.maxBy(Comparator.comparing(Employee::getSalary))
    ));
```

This uses groupingBy with a downstream collector. groupingBy partitions the stream by department, then maxBy finds the max salary within each group. The result is `Map<String, Optional<Employee>>` because a group could theoretically be empty. In practice, you can use `collectingAndThen(maxBy(...), Optional::get)` if you're sure groups are non-empty.

</div>

<div class="callout-tip">

**Applying this** — In real codebases, Streams shine for data transformation pipelines: filtering lists, grouping results, computing aggregates. But don't force everything into streams. A simple for-loop is more readable for imperative logic with side effects, early exits, or exception handling. If your stream pipeline exceeds 5-6 operations, extract intermediate results into named variables for readability.

</div>

---

> **The mindset shift**: Java 8 is about telling the computer **what** you want, not **how** to do it. Instead of writing loops, you describe transformations. Instead of null checks, you chain Optionals. Think declarative, not imperative.
