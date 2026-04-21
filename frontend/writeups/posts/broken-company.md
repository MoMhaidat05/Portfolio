## UJ Crypto CTF Broken Company challenge

A deep-dive into a `hard` categorized crypto challenge of UJ Crypto CTF.

## Reconnaissance

![Challenge Description.](images/broken-company/challenge.png)
The challenge description tells us that the company used an extremely large modulus `N` (4096 bits) to secure their data, but they decided to use a very small exponent `e = 3` because of their weak computers. [cite_start]Looking at the provided `output.txt` file, we are given `N`, `e`, and the `cipher`.
In equations, the encryption process looks like this:
```python
cipher = (m ^ 3) % N
```
Did you notice something about the size of the cipher compared to N?

## Vulnerability Analysis

In RSA, the modulo operation `% N` acts like a clock. It only wraps around and changes the number if the value exceeds `N`. 
Since our `e` is just 3, and `N` is massively huge, the value of our cubed message `m ^ 3` is actually much smaller than `N`. 
Because `m ^ 3 < N`, the modulo operation never triggers! It mathematically does absolutely nothing. The encryption equation simply becomes:
```python
cipher = m ^ 3
```
This means we do not need to factorize `N`, and we don't need `p`, `q`, `phi`, or the private key `d` at all. We just need to reverse the math by finding the exact cube root of the ciphertext.

## Exploitation Strategy
Since the encryption is just a simple cube operation without any modulo wrapping, we simply need to calculate the exact cube root of the ciphertext `c`.

You can easily reverse this using Python or any big-number math engine:
1. Use a tool or write a script that supports massive integers (e.g., Python with the `gmpy2` library, or an online engine like SageMath).
2. Calculate the exact cube root of the given ciphertext `c` (using a root degree of 3, since `e = 3`).
3. Take the resulting integer and convert it back to plain text (bytes).
4. The decoded text is your flag!

Thanks for reading :)