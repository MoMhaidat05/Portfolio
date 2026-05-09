## UJ Reverse Engineering CTF Whisper Whisper Whisper challenge

A deep-dive into a `Medium` categorized reverse engineering challenge of UJ CTF.
![Challenge Description.](images/whisper-whisper-whisper/challenge.png)

## Reconnaissance

1. Using the `file` command can help understand the architecture of the executable file, protections enabled, and some other useful information:
```bash
file vault
```
![Result.](images/whisper-whisper-whisper/recon1.png)

2. Run the binary to get familiar with it:
```bash
./vault
```
![Result.](images/whisper-whisper-whisper/recon3.png)
So the binary expects us to know **three** things: `secret 1`, `secret 2`, and `secret 3` (final phrase).


3. Now using the `strings` command may be useful if the author left some secrets hardcoded in the binary file:
```bash
strings vault
```
![Result.](images/whisper-whisper-whisper/recon2.png)
Notice `KEY1` and `KEY2` are left as hardcoded strings. Keep them in mind, we may need them later.

## Ghidra Analysis

We need to understand the binary logic and how it works, so we can be able to determine what the third secret is. This can be achieved by using **Ghidra**.
1. Analyze the file with Ghidra and inspect the main function:
![Result.](images/whisper-whisper-whisper/ghidra1.png)
Reading the Ghidra C code, you can determine that the program is asking for `secret 1` then stores it in `local_c`, then asks for `secret 2` and stores it in `local_10`, and finally the same thing for `secret 3`, which will be stored in `local_58`. Let's rename these variables so the code becomes more readable:
2. To rename a variable in Ghidra, right-click it, then hit `Rename variable`:
![Result.](images/whisper-whisper-whisper/ghidra2.png)
So basically the binary takes three inputs from you, then passes them to the `decrypt` function in order. To understand what `decrypt` exactly does, we need to analyze the function.
3. Analyze the `decrypt` function:
![Result.](images/whisper-whisper-whisper/ghidra3.png)
This is a very common encryption/decryption pattern in Ghidra, where the code iterates through an array called `cipher`, and XORs each character with `secret1` and `secret2`. After decrypting the cipher (which is here the encrypted flag), it makes another loop to store the decrypted flag in a new array called `local_58`. The function compares this decrypted flag with your third secret, then it returns the value of this comparison.

But wait, did you notice something?
![Result.](images/whisper-whisper-whisper/ghidra4.png)
The result is NEVER used! So actually this is a BLIND comparison. Because the result is not used, you will never know the decrypted flag just by running the program (unless you decrypt it manually by writing external C/C++ code).


## Exploitation Strategy
After we specified our target (accessing the address of the comparison to extract the decrypted flag), now we need to use a proper tool that helps us do this, which is `pwndbg` in this case.
1. Feed the binary to `pwndbg`:
![Result.](images/whisper-whisper-whisper/pwndbg1.png)

2. Disassemble the `decrypt` function to get the address of the `strcmp` function that we need to initialize a breakpoint at:
![Result.](images/whisper-whisper-whisper/pwndbg2.png)
Nice, we got the address: `0x0000000000401223`.

3. Make a breakpoint at that address:
```bash
b *0x0000000000401223
```

4. Run the program and feed it `secret 1` and `secret 2` so the decrypt function works properly and decrypts the flag correctly, and finally enter any third secret (remember, we don't need to make the comparison return `true`, we will extract the flag directly when we hit the break point):
![Result.](images/whisper-whisper-whisper/pwndbg3.png)

5. After hitting `Enter` directly after the third secret, you will hit the breakpoint, and the flag will easily be printed on the screen:
![Result.](images/whisper-whisper-whisper/pwndbg4.png)


Thanks for reading :)