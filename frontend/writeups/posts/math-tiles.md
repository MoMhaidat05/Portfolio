## UJ Reverse Engineering CTF Math Tiles challenge

A deep-dive into a `Medium` categorized reverse engineering challenge of UJ CTF.
![Challenge Description.](images/math-tiles/challenge.png)

## Reconnaissance

1. Using the `file` command can help understand the architecture of the executable file, protections enabled, and some other useful information:
```bash
file switch_maze
```
![Result.](images/math-tiles/recon1.png)

2. Run the binary to get familiar with it:
```bash
./switch_maze
```
![Result.](images/math-tiles/recon3.png)
So the binary expects us to guide a lantern through a maze using a "Route" of exactly four steps, using only the characters `W`, `A`, and `D`.

3. Now using the `strings` command may be useful if the author left any hints, secrets or instructions hardcoded:
```bash
strings switch_maze
```
![Result.](images/math-tiles/recon2.png)
Unfortunately, he didn't :(

## Ghidra Analysis

We need to understand how the maze works and what the winning condition is. This can be achieved by using **Ghidra**.
1. Analyze the file with Ghidra and inspect the main function:
![Result.](images/math-tiles/ghidra1.png)
Reading the Ghidra C code, you can determine that the program takes our input and stores it in `local_28`. Then it checks if the length is exactly 4 (`if (sVar4 == 4)`). If we enter more or less, it fails.
    
2. After the length check, the program initializes a variable `local_c = 0` (this acts as our current score or position) and enters a loop that iterates 4 times over our input characters:
![Result.](images/math-tiles/ghidra2.png)
By analyzing the `if-else` block, we can extract the mathematical operations assigned to each tile:
* If `W`: `local_c = local_c + 5`
* If `A`: `local_c = local_c << 1` (Bitwise left shift, which means multiply by 2)
* If `D`: `local_c = local_c + -3` (Subtract 3)
* Any other character will crack the tile and exit the program.

3. Look at the final condition after the loop:
![Result.](images/math-tiles/ghidra3.png)
The program checks `if (local_c == 0x11)`. The hex value `0x11` equals `17` in decimal. If our final score is exactly 17, it opens `flag.txt` and prints the real flag.

## Exploitation Strategy

Since we understand the logic perfectly, we don't need a debugger. This is just a simple math puzzle.
We start at `0`, and we must reach exactly `17` using exactly `4` operations.
The allowed operations are: `+5` (W), `*2` (A), and `-3` (D).

Let's trace the math to find the correct path:
1. Step 1: `W` (0 + 5 = 5)
2. Step 2: `W` (5 + 5 = 10)
3. Step 3: `A` (10 * 2 = 20)
4. Step 4: `D` (20 - 3 = 17)

*(Note: `WAAD` also works perfectly: 5 -> 10 -> 20 -> 17)*

So the correct route is `WWAD` or `WAAD`.

1. Connect to the challenge server using the provided command:
```bash
nc uj-ctf.duckdns.org 8002
```
2. Enter the route `WWAD` when prompted.
3. The server will accept the route and print your flag:
![Result.](images/math-tiles/flag.png)


Thanks for reading :)