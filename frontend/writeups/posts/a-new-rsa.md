## UJ Crypto CTF a new RSA? challenge

A deep-dive into an `easy` categorized crypto challenge of UJ Crypto CTF.

## Reconnaissance

![Challenge Description.](images/a-new-rsa/challenge.png)
Challenge description says that the employee invented a new RSA by using only one prime instead of two. In equations this means:
```python
p = bigPrime
N = p
```
Did you notice something?

## Vulnerability Analysis

Since `N` is created using only one prime number, we don't need to factorize it. `N` is already the prime itself! 
In normal RSA, `totient` (or `phi`) is calculated as `(p - 1) * (q - 1)`. Since we only have one prime, the equation changes.
By knowing this, we can easily extract the totient:
```python
phi = N - 1
```

## Exploitation Strategy
If you are not willing to use python, follow the steps below:
1. We already have `N`, `e`, and `cipher` from the output file.
2. Since `N` is prime, calculate the totient by subtracting 1 from `N`.
3. Now we have `phi`, everything is easy from here on out.
4. Calculate `d` using any RSA calculator you prefer.
5. Decrypt the cipher to get the flag.

Thanks for reading :)