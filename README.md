# Simple VM

A simple virtual machine with that emulates
an assembler-like language with limited functionality

Machine parameters:
  - Stack: 1000000 bytes
  - any number of registers
  - only works with 4 byte numbers (positive)

# Usage
Function definition - DEFINE&lt;function_name&gt;<br>
Entry point - DEFINE&lt;MAIN&gt;<br>
Calling function - CALL&lt;function_name&gt; or CALL&lt;function_def_instruction_number&gt;<br>
Return from function - RET (every function should return)
```
DEFINE<MAIN>
CALL<FUNC>
CALL<16>
RET
DEFINE<FUNC> --> 4th line, starting from 0, each line is 4 bytes, CALL<FUNC> same as CALL<16>
RET
```
Return value - RV <br>
Stack pointer - SP <br>
Program Counter - PC (each program line is 4 bytes, jump with increments of +-4)<br>
Memory - M // accessing heap using square brackets [address (int)] <br>
Register - R[0-9]+ (ex: R432, case insensitive, r432 works too)
```
DEFINE<FUNC>
R1 = M[SP] + 10 --> R1 = 10 + 10
SP = SP + 4 --> deallocate 4 bytes for current FUNC
RV = R1 + 5 --> set return value (RV = R1 + 5, RV = 20 + 5)
RET
DEFINE<MAIN>
SP = SP - 4 --> allocate 4 bytes for FUNC
M[SP] = 10
CALL<FUNC>
RET --> RV = 25
```
ALU functions - (+ - * /)<br>
Comparison functions (<comparison_function> value1 value2 instruction):
  - BLT -> less than<br>
  - BGT -> greater than<br>
  - BLE -> less than or equal<br>
  - BGE -> more than or equal<br>
  - BEQ -> equal<br>
  - BNE -> not equal<br>
  
```
DEFINE<MAIN>
RV = 0
BLT 5 10 PC + 12 --> 5 less than 10, so jump over two instructions
RV = 5
PC = PC + 8
RV = RV + 10 --> reach this point skipping two instructions
RET --> return value is 10
```
Every value can be accessed through js, 
debugging is possible using console, return value 
is accessible using console
