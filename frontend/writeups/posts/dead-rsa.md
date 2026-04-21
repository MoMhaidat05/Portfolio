## UJ Crypto CTF DEAD RSA challenge

A deep-dive into a `medium` categorized crypto challenge of UJ Crypto CTF.

## Reconnaissance

![Challenge Description.](images/dead-rsa/challenge.png)
The challenge description and the attached C++ file show that the admin abandoned RSA and created a custom encryption algorithm using XOR and recursion.
Looking at the code, the encryption logic is straightforward:
```cpp
if (index == 0) {
    current = plainText[index] ^ RANDOM_NUMBER;
} else {
    current = plainText[index] ^ prev;
}
```
The first character is XORed with a random key (0-255). Every character after that is XORed with the previously encrypted character.
Did you notice the comment at the bottom of the file?

## Vulnerability Analysis

The recursive function looks intimidating, but it is just a distraction. The core operation is a simple XOR block cipher.
XOR has a magical reversible property: if `A ^ B = C`, then `A ^ C = B`.
We are told the key is random, but the code comments remind us that the flag format starts with `uj{`. This opens the door for a Known Plaintext Attack (KPA).
Since we know the first plaintext character is `u` and the first ciphertext number is `172`, we can easily find the secret key:
```cpp
RANDOM_NUMBER = 172 ^ 'u'
```
After finding the key, reversing the rest of the cipher is just doing the exact same XOR operation in reverse.

## Exploitation Strategy
You can solve this by writing a simple decryption script in C++ or Python:
1. Extract the secret key by XORing the first value of the cipher array with the letter `u`.
2. Decrypt the first character using this key.
3. Loop through the rest of the cipher array starting from the second element.
4. To decrypt each character, simply XOR the current cipher value with the previous cipher value.
5. Append the decrypted characters together to get the full plain text.
6. (Optional) Since the key is between 0 and 255, you can also just write a loop to brute-force all 256 possibilities until the output starts with `uj{`.

Thanks for reading :)