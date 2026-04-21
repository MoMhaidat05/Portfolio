## UJ Crypto CTF Leaky Twins challenge

A deep-dive into a `hard` categorized crypto challenge of UJ Crypto CTF.

## Reconnaissance

![Challenge Description.](images/leaky-twins/challenge.png)
Challenge description says that admin of system generated two new keys and they are big, so we mustn't think of factorizing them to get `p`, `q`.
An important note, that admin used `one shared prime` across the two keys. In equations this means:
```python
p = bigPrime
q = bigPrime
r = bigPrime
N1 = p * q
N2 = p * r
```
Did you notice something??
## Vulnerability Analysis

Since `N1`, `N2` shares a common prime number, and since `N` itself is created using two primes, this means there is **only one** Greatest Common Divisor (GCD) that divides `N1` and `N2` at the same time.
By finding this divisor, we can easily extract the other divisor by dividing `N` by `the gcd`:
```python
gcdNumber = gcd(N1, N2)
q = N1 / gcdNumber
```
## Exploitation Strategy
If you are not willing to use python, follow the steps below:
1. Access `sageMath` website: https://sagecell.sagemath.org/.
2. Enter the following input: `gcd(N1, N2)`, replace `N1` & `N2` with the real values from the challenge file.
3. We now have `p`, now we need to extract `q`.
4. Enter the following input: `N1 / p`, replace `N1` & `p` with real values.
5. Now we have `q` also, everything is straightforward from this point.
6. Calculate `totient` & `d` using any RSA calculator you prefer.
7. Decrypt the cipher to get the flag.


Thanks for reading :)