# Java 17 — All Features Explained with Real Scenarios

## Why Java 17 Matters

Java 17 is an **LTS (Long-Term Support)** release. It's the version most companies are migrating to. It brings cleaner syntax, better safety, and features that make your code shorter without sacrificing readability.

---

## 1. Records — Data Classes Done Right

### The Problem

```java
// Just to hold 3 fields, you needed 50+ lines:
public class Employee {
    private final String name;
    private final int age;
    private final String department;

    public Employee(String name, int age, String department) {
        this.name = name;
        this.age = age;
        this.department = department;
    }

    public String getName() { return name; }
    public int getAge() { return age; }
    public String getDepartment() { return department; }

    @Override public boolean equals(Object o) { /* 10 lines */ }
    @Override public int hashCode() { return Objects.hash(name, age, department); }
    @Override public String toString() { return "Employee[name=" + name + "...]"; }
}
```

### The Solution — Records (Java 16+)

```java
public record Employee(String name, int age, String department) {}
```

**That's it.** You get:
- ✅ Constructor
- ✅ Getters (`name()`, `age()`, `department()`)
- ✅ `equals()`, `hashCode()`, `toString()`
- ✅ Immutability (all fields are `final`)

### Scenario: API response DTOs

```java
// Perfect for DTOs — no boilerplate
public record ApiResponse<T>(int status, String message, T data) {}

public record UserDTO(String name, String email, List<String> roles) {}

// Usage
var response = new ApiResponse<>(200, "OK", new UserDTO("Alice", "alice@example.com", List.of("ADMIN")));
System.out.println(response.status());  // 200
System.out.println(response.data().name());  // Alice
```

### Custom validation in records

```java
public record Age(int value) {
    // Compact constructor — validates before assignment
    public Age {
        if (value < 0 || value > 150) {
            throw new IllegalArgumentException("Invalid age: " + value);
        }
    }
}
```

---

## 2. Sealed Classes — Controlled Inheritance

### The Problem

```java
// Anyone can extend your class — you can't control it
public abstract class Shape { }
// Some random class in another package: class WeirdShape extends Shape { }
```

### The Solution

```java
public sealed class Shape permits Circle, Rectangle, Triangle {
    // Only these 3 can extend Shape. Period.
}

public final class Circle extends Shape {
    private final double radius;
    public Circle(double radius) { this.radius = radius; }
}

public final class Rectangle extends Shape {
    private final double width, height;
    public Rectangle(double w, double h) { this.width = w; this.height = h; }
}

public non-sealed class Triangle extends Shape {
    // non-sealed means Triangle CAN be extended further
}
```

### Scenario: Payment processing with known types

```java
public sealed interface Payment permits CreditCard, BankTransfer, Wallet {
    double amount();
}

public record CreditCard(double amount, String cardNumber, String cvv) implements Payment {}
public record BankTransfer(double amount, String iban) implements Payment {}
public record Wallet(double amount, String walletId) implements Payment {}

// Now the compiler KNOWS all possible types
// Perfect for pattern matching (see below)
```

> **Why sealed?** When you switch on a sealed type, the compiler can warn you if you miss a case. No more "forgot to handle a new subtype" bugs.

---

## 3. Pattern Matching for instanceof

### Before

```java
if (obj instanceof String) {
    String s = (String) obj;  // redundant cast
    System.out.println(s.length());
}
```

### After (Java 16+)

```java
if (obj instanceof String s) {
    System.out.println(s.length());  // s is already cast and scoped
}

// Works with negation too
if (!(obj instanceof String s)) {
    return;  // early exit
}
// s is available here!
System.out.println(s.toUpperCase());
```

### Scenario: Processing different event types

```java
public void handleEvent(Event event) {
    if (event instanceof ClickEvent click) {
        processClick(click.getX(), click.getY());
    } else if (event instanceof KeyEvent key && key.isCtrlPressed()) {
        processShortcut(key.getKeyCode());
    } else if (event instanceof ScrollEvent scroll) {
        processScroll(scroll.getDelta());
    }
}
```

---

## 4. Switch Expressions (Java 14+)

### Before — Verbose and error-prone

```java
String result;
switch (day) {
    case MONDAY:
    case TUESDAY:
        result = "Work";
        break;  // forget this and you have a bug
    case SATURDAY:
    case SUNDAY:
        result = "Rest";
        break;
    default:
        result = "Unknown";
}
```

### After — Clean and safe

```java
String result = switch (day) {
    case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY -> "Work";
    case SATURDAY, SUNDAY -> "Rest";
};
// No break needed, no fall-through bugs, returns a value
```

### With blocks

```java
int discount = switch (customerTier) {
    case GOLD -> {
        log("Gold customer discount applied");
        yield 20;  // 'yield' returns value from a block
    }
    case SILVER -> 10;
    case BRONZE -> 5;
    default -> 0;
};
```

### Scenario: HTTP status code handler

```java
String message = switch (statusCode) {
    case 200 -> "OK";
    case 201 -> "Created";
    case 400 -> "Bad Request";
    case 401 -> "Unauthorized";
    case 403 -> "Forbidden";
    case 404 -> "Not Found";
    case 500 -> "Internal Server Error";
    default -> "Unknown status: " + statusCode;
};
```

---

## 5. Text Blocks (Java 15+)

### Before — String concatenation hell

```java
String json = "{\n" +
    "  \"name\": \"Alice\",\n" +
    "  \"age\": 30,\n" +
    "  \"city\": \"NYC\"\n" +
    "}";
```

### After — Just write it naturally

```java
String json = """
        {
          "name": "Alice",
          "age": 30,
          "city": "NYC"
        }
        """;
```

### Scenario: SQL queries

```java
String query = """
        SELECT e.name, e.salary, d.department_name
        FROM employees e
        JOIN departments d ON e.dept_id = d.id
        WHERE e.salary > %d
        AND d.department_name = '%s'
        ORDER BY e.salary DESC
        """.formatted(50000, "Engineering");
```

### Scenario: HTML templates

```java
String html = """
        <html>
          <body>
            <h1>Welcome, %s!</h1>
            <p>Your account balance: $%.2f</p>
          </body>
        </html>
        """.formatted(userName, balance);
```

---

## 6. Helpful NullPointerExceptions (Java 14+)

### Before

```java
employee.getAddress().getCity().toUpperCase();
// Exception: NullPointerException
// WHICH one was null?! employee? address? city? 🤷
```

### After

```
Exception: NullPointerException:
  Cannot invoke "Address.getCity()" because the return value of
  "Employee.getAddress()" is null
```

> Now you know **exactly** what was null. No more detective work.

---

## 7. `var` — Local Variable Type Inference (Java 10+)

```java
// Before
HashMap<String, List<Employee>> departmentMap = new HashMap<>();
BufferedReader reader = new BufferedReader(new FileReader("data.txt"));

// After — compiler infers the type
var departmentMap = new HashMap<String, List<Employee>>();
var reader = new BufferedReader(new FileReader("data.txt"));

// Great for streams
var names = employees.stream()
    .map(Employee::getName)
    .collect(Collectors.toList());
```

### When to use `var`

| ✅ Use | ❌ Avoid |
|--------|---------|
| Type is obvious from right side | Type is not clear |
| Long generic types | Primitive types (`var x = 5` — is it int? long?) |
| Loop variables | Method parameters or return types |

---

## 8. New String Methods

```java
// isBlank() — checks for empty or whitespace only
"   ".isBlank();     // true (isEmpty() would return false!)
"hello".isBlank();   // false

// strip() — Unicode-aware trim
"  hello  ".strip();        // "hello"
"  hello  ".stripLeading(); // "hello  "
"  hello  ".stripTrailing();// "  hello"

// lines() — split by line breaks into stream
"line1\nline2\nline3".lines().forEach(System.out::println);

// repeat()
"ha".repeat(3);  // "hahaha"

// indent()
"hello".indent(4);  // "    hello\n"
```

---

## 9. Immutable Collections Factory Methods (Java 9+)

```java
// Before — verbose
List<String> list = Collections.unmodifiableList(Arrays.asList("a", "b", "c"));

// After — clean
List<String> list = List.of("a", "b", "c");
Set<String> set = Set.of("x", "y", "z");
Map<String, Integer> map = Map.of("a", 1, "b", 2, "c", 3);

// These are truly immutable — any modification throws UnsupportedOperationException
list.add("d");  // 💥 UnsupportedOperationException

// Copying to mutable
var mutable = new ArrayList<>(List.of("a", "b", "c"));
mutable.add("d");  // works fine
```

---

## 10. Stream Enhancements (Java 9-16)

```java
// takeWhile — take elements while condition is true (ordered streams)
List<Integer> result = List.of(1, 2, 3, 4, 5, 1, 2).stream()
    .takeWhile(n -> n < 4)
    .toList();  // [1, 2, 3]

// dropWhile — skip elements while condition is true
List<Integer> result2 = List.of(1, 2, 3, 4, 5).stream()
    .dropWhile(n -> n < 3)
    .toList();  // [3, 4, 5]

// Stream.ofNullable — safely create stream from nullable
Stream<String> s = Stream.ofNullable(getNullableValue());  // empty stream if null

// toList() — shorter than collect(Collectors.toList()) (Java 16+)
var names = employees.stream().map(Employee::getName).toList();
```

---

## Summary — What Came When

| Version | Feature | Impact |
|---------|---------|--------|
| Java 9 | `List.of()`, `Set.of()`, `Map.of()` | Immutable collections |
| Java 10 | `var` | Less typing |
| Java 11 | `String.isBlank()`, `strip()`, `lines()` | Better strings |
| Java 14 | Switch expressions, helpful NPE | Cleaner code, better debugging |
| Java 15 | Text blocks | Multi-line strings |
| Java 16 | Records, Pattern matching instanceof, `toList()` | Less boilerplate |
| Java 17 | Sealed classes | Controlled inheritance |

---

---

## 🎯 Interview Corner

<div class="callout-interview">

**Q: "What are Records and when would you use them instead of a regular class?"**

Records are immutable data carriers — you declare the fields, and Java generates the constructor, getters (name(), not getName()), equals(), hashCode(), and toString(). Use them for DTOs, API request/response objects, value objects, and any class whose identity is defined by its data. Don't use them when you need mutability, inheritance (records are implicitly final), or when you need to decouple the internal representation from the API (records expose all fields). Records are perfect for the 80% of classes that are just "bags of data" — they eliminate 40+ lines of boilerplate per class.

</div>

<div class="callout-interview">

**Q: "Explain sealed classes. What problem do they solve?"**

Sealed classes restrict which classes can extend them. You declare `sealed class Shape permits Circle, Rectangle, Triangle` and only those three can be subclasses. This solves two problems: first, it gives the compiler exhaustiveness checking — when you switch on a sealed type, the compiler warns if you miss a case. Second, it makes your domain model explicit — a Payment can only be CreditCard, BankTransfer, or Wallet, and no one can add a new type without modifying the sealed declaration. Combined with pattern matching in switch (Java 21), sealed classes enable type-safe, exhaustive handling of all variants.

**Follow-up trap**: "What's the difference between final, sealed, and non-sealed?" → final = no one can extend. sealed = only permitted classes can extend. non-sealed = a permitted subclass that reopens extension to anyone. You use non-sealed when one branch of your hierarchy needs to be extensible while others are locked down.

</div>

<div class="callout-interview">

**Q: "Your team is migrating from Java 8 to Java 17. What's your migration strategy?"**

Phased approach. First, get the code compiling on Java 17 without using new features — fix removed APIs (javax.xml.bind moved to Jakarta, Nashorn removed), update dependencies that use internal APIs (--illegal-access=deny is default now). Second, update the build toolchain (Maven/Gradle plugins, CI/CD). Third, incrementally adopt new features: replace DTOs with Records, use text blocks for SQL/JSON strings, switch expressions for cleaner conditionals, var where types are obvious. Don't rewrite everything at once — adopt new features in new code and refactor existing code during normal development. The biggest risk is third-party libraries that aren't Java 17 compatible — audit dependencies first.

</div>

<div class="callout-interview">

**Q: "What's pattern matching for instanceof and why is it useful?"**

Before Java 16, instanceof required a separate cast: `if (obj instanceof String) { String s = (String) obj; ... }`. Pattern matching combines the check and cast: `if (obj instanceof String s) { ... }` — s is already typed and scoped. It eliminates redundant casts and makes the code shorter. The real power comes with sealed classes and switch (Java 21): you can write `switch (shape) { case Circle c -> ... case Rectangle r -> ... }` and the compiler ensures you handle all cases. It's Java's version of algebraic data types — sealed classes define the variants, pattern matching destructures them.

</div>

<div class="callout-tip">

**Applying this** — When migrating, start with the highest-impact, lowest-risk features: Records for DTOs (immediate boilerplate reduction), text blocks for multi-line strings (SQL, JSON, HTML), and switch expressions (cleaner, no fall-through bugs). Save sealed classes for new domain modeling. Use `jdeprscan` to find deprecated API usage and `jdeps` to find internal API dependencies before upgrading.

</div>

---

> **Migration tip**: If you're on Java 8, the jump to 17 is big but worth it. Start by replacing DTOs with Records, using `var` where obvious, and switching to the new `switch` expressions. Your code will shrink by 30-40%.
