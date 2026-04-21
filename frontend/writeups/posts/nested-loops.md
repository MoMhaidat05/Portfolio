## UJ Crypto CTF Nested Loops challenge

A deep-dive into a `hard` categorized crypto challenge of UJ Crypto CTF.

## Reconnaissance

![Challenge Description.](images/nested-loops/challenge.png)
The challenge description asks us for the inverse of nested loops. By looking at the provided C++ file, we can see a custom encryption algorithm.
Inside the main loop, there is a smaller loop that does the following:
```cpp
for (int j = 1; j < 5; j++){
    encryptedCharacter *= j;
}
```
Before this loop, the character is XORed with its position index `(i + 1)`.
Did you notice something about the inner loop?

## Vulnerability Analysis

The nested loop looks like a complex mathematical operation, but it is actually a static calculation. 
It takes the character and multiplies it by 1, then by 2, then by 3, and finally by 4. Mathematically, `1 * 2 * 3 * 4 = 24`.
So, the entire nested loop is just a fancy way of writing:
```cpp
encryptedCharacter = encryptedCharacter * 24;
```
To reverse this encryption, we simply need to do the exact opposite operations in reverse order. The inverse of multiplication is division, and the inverse of XOR is XOR itself.
First, we divide the cipher number by 24. Then, we XOR the result with `(i + 1)`.

## Exploitation Strategy
You can easily solve this by writing the decryption algorithm in C++ or Python:
1. Loop through each number in the provided `cipherText` array.
2. Divide the current cipher number by 24.
3. Take the result and XOR it with the current index plus one `(i + 1)`.
4. Convert the final integer back into an ASCII character.
5. Append the characters together to form the plain text.
6. Print the result, and you will get your flag!

Thanks for reading :)