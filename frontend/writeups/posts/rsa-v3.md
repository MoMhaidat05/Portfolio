## UJ Crypto CTF RSA V3.0 challenge

A deep-dive into a `medium` categorized crypto challenge of UJ Crypto CTF.

## Reconnaissance

![Challenge Description.](images/rsa-v3/challenge.png)
The challenge description tells us that the admin upgraded his RSA implementation to use 3 primes instead of the usual 2. Looking at the provided `output.txt` file, we are handed everything we need: `N`, `p`, `q`, `r`, `e`, and the `cipher`. 
In equations this means:
```python
N = p * q * r
```
Having all the primes handed to us is a huge advantage.

## Vulnerability Analysis

In standard RSA, the modulus `N` consists of two prime numbers, which makes calculating the totient (phi) straightforward: `phi = (p - 1) * (q - 1)`.
However, since our modulus here is constructed using three primes, the math rule must expand to include the third prime. The new equation looks like this:
```python
phi = (p - 1) * (q - 1) * (r - 1)
```
Because we already have the exact values of `p`, `q`, and `r` from the challenge file, there is no need to crack or factorize `N`. We just need to apply the modified equation properly.

## Exploitation Strategy
If you are not willing to use python, follow the steps below:
1. Open up your favorite RSA toolkit or calculator.
2. Calculate the new `totient` manually by subtracting 1 from `p`, `q`, and `r`, then multiplying them together.
3. Pass the calculated `totient` and the given `e` value to your tool to extract the private key `d`.
4. Now that you have `d`, use it along with `N` and the `cipher` to perform a standard RSA decryption.
5. Convert the resulting number into plain text, and you will get the flag.

Thanks for reading :)