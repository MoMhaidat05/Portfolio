## HTB Flag Casino - Reverse Engineering Writeup
A dive into an `easy` categorized reverse engineering challenge on HackTheBox.

## Reconnaissance
This challenge requires us to reverse the binary executable file to read its code, so we can identify where the flaws lie and exploit them to capture the flag.

There is a fantastic tool called **Ghidra** that does all the heavy lifting for us, which we can use to decompile any executable file back into readable `C` code.
First, run the `ghidra` command in your terminal, then create a new project (`File` -> `New Project` -> `Non-Shared Project` -> enter any name and hit `Finish`).
Now drag the executable file, drop it into the new project, and double-click it. This will open a pop-up asking if you want to analyze the file; click `Yes` then click `Analyze`.

From the left sidebar called `Symbol Tree`, expand `Functions`, scroll down until you reach the `main` function, and click it.

```c
undefined8 main(void)
{
  int iVar1;
  char local_d;
  uint local_c;
  
  puts("[ ** WELCOME TO ROBO CASINO **]");
  puts(
      "     ,     ,\n    (\\____/)\n     (_oo_)\n       (O)\n     __||__    \\)\n  []/______\\[] /\n   / \\______/ \\/\n /    /__\\\n(\\   /____\\\n---------------------"
      );
  puts("[*** PLEASE PLACE YOUR BETS ***]");
  local_c = 0;
  while( true ) {
    if (0x1c < local_c) {
      puts("[ ** HOUSE BALANCE $0 - PLEASE COME BACK LATER ** ]");
      return 0;
    }
    printf("> ");
    iVar1 = __isoc99_scanf(&DAT_001020fc,&local_d);
    if (iVar1 != 1) break;
    srand((int)local_d);
    iVar1 = rand();
    if (iVar1 != *(int *)(check + (long)(int)local_c * 4)) {
      puts("[ * INCORRECT * ]");
      puts("[ *** ACTIVATING SECURITY SYSTEM - PLEASE VACATE *** ]");
                    /* WARNING: Subroutine does not return */
      exit(-2);
    }
    puts("[ * CORRECT *]");
    local_c = local_c + 1;
  }
                    /* WARNING: Subroutine does not return */
  exit(-1);
}
```
Now we have the source code, and we can analyze it to find any vulnerabilities.

## Vulnerability Analysis
Diving into the code, you can notice one juicy line:
```c
srand((int)local_d);
```
This line means that our input (`local_d`) is being used as the **seed** for the PRNG (Pseudo-Random Number Generator)!

Computers are deterministic; they can't generate truly **random** numbers. This is where PRNG comes in. It takes a seed and passes it through a mathematical equation to generate a random-looking number. 
The golden rule here is: **If the seed is the same, the generated numbers will always be exactly the same.** Since we control the seed (our input character), the output of `rand()` becomes 100% predictable.

If we look at the next lines:
```c
iVar1 = rand();
if (iVar1 != *(int *)(check + (long)(int)local_c * 4))
```
The program generates a number and compares it to a value stored in a global array called `check`. If it matches, we move to the next character of the flag.

## Exploitation Strategy
Since the `check` array is hardcoded inside the binary, we can simply extract its values using Ghidra (by double-clicking the `check` variable and reading the `.data` section).

Once we have the target numbers, we don't need to guess the flag manually. We can write a Python script that loads the core Linux `C` library (`libc`), loops through all readable ASCII characters, sets each character as a seed using `srand()`, and checks if the `rand()` output matches the number in the `check` array. If it matches, we found the correct character!

## Exploit
We will use Python with the `ctypes` library to emulate the C environment perfectly. Here is the final exploit:

```python
import ctypes
import sys

# Load the C standard library to perfectly emulate rand() and srand()
try:
    libc = ctypes.CDLL("libc.so.6")
except OSError:
    print("[-] Could not load libc.so.6.")
    sys.exit(1)

# The target values extracted from the 'check' array in Ghidra (Little-Endian)
check_array = [
    0x244b28be, 0x0af77805, 0x110dfc17, 0x07afc3a1,
    0x6afec533, 0x4ed659a2, 0x33c5d4b0, 0x286582b8,
    0x43383720, 0x055a14fc, 0x19195f9f, 0x43383720,
    0x63149380, 0x615ab299, 0x6afec533, 0x6c6fcfb8,
    0x43383720, 0x0f3da237, 0x6afec533, 0x615ab299,
    0x286582b8, 0x055a14fc, 0x3ae44994, 0x06d7dfe9,
    0x4ed659a2, 0x0ccd4acd, 0x57d8ed64, 0x615ab299,
    0x22e9bc2a
]

flag = ""
print("[+] Starting Bruteforce against the Casino Security System...\n")

for index, target in enumerate(check_array):
    found = False
    
    # Brute-force all printable ASCII characters
    for char_code in range(32, 127):
        
        libc.srand(char_code)
        generated_num = libc.rand()
        
        if generated_num == target:
            flag += chr(char_code)
            found = True
            break
            
    if not found:
        print(f"[-] Failed at index {index}.")
        break

print(f"\n[+] ACCESS GRANTED. The Flag is: {flag}")
```
Running this script yields the flag: `HTB{r4nd_1s_v3ry_pr3d1ct4bl3}`.