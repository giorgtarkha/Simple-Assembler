evaluate_single = function(obj, registers, memory, stack_pointer, program_counter, return_value, line) {
    if (is_number(obj)) {
        return parseInt(obj);
    }
    if (is_register(obj)) {
        if (obj === "PC") {
            return program_counter;
        }
        if (obj === "SP") {
            return stack_pointer;
        }
        if (obj === "RV") {
            return return_value;
        }
        if (registers[obj] == undefined) {
            console.log("register " + obj + " at line " + line + " is not defined");
            return undefined;
        }
        return parseInt(registers[obj]);
    }
    if (is_memory(obj)) {
        let address_ue = parse_memory_address(obj);
        let address = evaluate_single(address_ue, registers, memory, stack_pointer, program_counter, return_value, line);
        if (address < 0) {
            console.log("memory address becomes negative at line " + line + " which is not allowed");
            return undefined;
        }
        if (address > 1000000 - 4) {
            console.log("memory address is over 1000000 at line " + line + " which is not allowed");
            return undefined;
        }
        let value = bytes_to_int([memory[address], memory[address + 1], memory[address + 2], memory[address + 3]]);
        return value;
    }
}

emulate = function(instructions, function_definitions) {
    let registers_stack = [];
    let registers = {};
    let memory = new Array(1000000).fill(0);
    let stack_pointer = 100000;
    let return_value = 0;
    let callers = [];
    let current_line = function_definitions["MAIN"] / 4 + 1;
    let program_counter = current_line * 4;
    let current_function = "MAIN";
    let number_of_instructions_processed = 0;

    while (true) {
        if (number_of_instructions_processed > 100000) {
            console.log("limit of how many instructions can be processed is 100000 so the program must terminate.");
            break;
        }
        number_of_instructions_processed++;
        let instruction = instructions[current_line];
        if (instruction == undefined) {
            current_line++;
            program_counter += 4;
            continue;
        }
        if (instruction[0] === "RET") {
            if (callers.length == 0) {
                break;
            } else {
                registers = registers_stack.pop();
                let caller = callers.pop();
                current_function = caller.function_name;
                current_line = caller.line + 1;
                program_counter = current_line * 4;
                continue;
            }
        }
        if (instruction[0] === "CALL") {
            callers.push({ function_name : current_function, line : current_line });
            registers_stack.push(registers);
            if (is_number(instruction[2])) {
                current_function = instructions[parseInt(instruction[2]) / 4][2];
            } else {
                current_function = instruction[2];
            }
            registers = {};
            current_line = function_definitions[current_function] / 4 + 1;
            program_counter = current_line * 4;
            continue;
        }
        if (instruction[0] === "JUMP") {
            if (instruction.length == 2) {
                let value = evaluate_single(instruction[1], registers, memory, stack_pointer, program_counter, return_value, current_line + 1);
                if (value == undefined) {
                    break;
                }
                if (value < 0) {
                    console.log("value at jump call is negative at line " + (current_line + 1));
                    break;
                }
                if (value % 4 != 0) {
                    console.log("value at jump call is not divisible by 4 at line " + (current_line + 1));
                    break;
                }
                if (value / 4 >= instructions.length) {
                    console.log("jump call at line " + (current_line + 1) + " jumps to a line that's greater than last instruction");
                    break;
                }
                if (instructions[value / 4][0] === "DEFINE") {
                    console.log("jump call at line " + (current_line + 1) + " jumps to a function definition which is not allowed");
                    break;
                }
                program_counter = value;
                current_line = program_counter / 4;
                continue;
            } else {
                let value1 = evaluate_single(instruction[1], registers, memory, stack_pointer, program_counter, return_value, current_line + 1);
                let value2 = evaluate_single(instruction[3], registers, memory, stack_pointer, program_counter, return_value, current_line + 1);
                if (value1 == undefined || value2 == undefined) {
                    break;
                }
                let value = alu_functions[instruction[2]](value1, value2);
                if (value < 0) {
                    console.log("value at jump call is negative at line " + (current_line + 1));
                    break;
                }
                if (value % 4 != 0) {
                    console.log("value at jump call is not divisible by 4 at line " + (current_line + 1));
                    break;
                }
                if (value / 4 >= instructions.length) {
                    console.log("jump call at line " + (current_line + 1) + " jumps to a line that's greater than last instruction");
                    break;
                }
                if (instructions[value / 4][0] === "DEFINE") {
                    console.log("jump call at line " + (current_line + 1) + " jumps to a function definition which is not allowed");
                    break;
                }
                program_counter = value;
                current_line = program_counter / 4;
                continue;
            }
        }
        if (is_register(instruction[0])) {
            if (instruction.length == 3) {
                let value = evaluate_single(instruction[2], registers, memory, stack_pointer, program_counter, return_value, current_line + 1);
                if (value == undefined) {
                    break;
                }
                if (instruction[0] === "PC") {
                    if (value < 0) {
                        console.log("program counter becomes negative at line " + (current_line + 1));
                        break;
                    }
                    if (value % 4 != 0) {
                        console.log("program counter is not divisible by 4 at line " + (current_line + 1));
                        break;
                    }
                    if (value / 4 >= instructions.length) {
                        console.log("program counter at line " + (current_line + 1) + " is greater than last instruction");
                        break;
                    }
                    if (instructions[value / 4][0] === "DEFINE") {
                        console.log("program counter at line " + (current_line + 1) + " goes to a function definition");
                        break;
                    }
                    program_counter = value;
                    current_line = program_counter / 4;
                    continue;
                } else if (instruction[0] === "RV") {
                    return_value = value;
                } else if (instruction[0] === "SP") {
                    if (value < 0) {
                        console.log("stack pointer at line " + (current_line + 1) + " becomes negative, memory leak");
                        break;
                    }
                    if (value > 100000) {
                        console.log("stack pointer at line " + (current_line + 1) + " becomes bigger than maximum, memory leak");
                    }
                    stack_pointer = value;
                } else {
                    registers[instruction[0]] = value;
                }
                current_line++;
                program_counter += 4;
                continue;
            } else {
                let value1 = evaluate_single(instruction[2], registers, memory, stack_pointer, program_counter, return_value, current_line + 1);
                let value2 = evaluate_single(instruction[4], registers, memory, stack_pointer, program_counter, return_value, current_line + 1);
                if (value1 == undefined || value2 == undefined) {
                  break;
                }
                let value = alu_functions[instruction[3]](value1, value2);
                if (instruction[0] === "PC") {
                    if (value < 0) {
                        console.log("program counter becomes negative at line " + (current_line + 1));
                        break;
                    }
                    if (value % 4 != 0) {
                        console.log("program counter is not divisible by 4 at line " + (current_line + 1));
                        break;
                    }
                    if (value / 4 >= instructions.length) {
                        console.log("program counter at line " + (current_line + 1) + " is greater than last instruction");
                        break;
                    }
                    if (instructions[value / 4][0] === "DEFINE") {
                        console.log("program counter at line " + (current_line + 1) + " goes to a function definition");
                        break;
                    }
                    program_counter = value;
                    current_line = program_counter / 4;
                    continue;
                } else if (instruction[0] === "RV") {
                    return_value = value;
                } else if (instruction[0] === "SP") {
                    if (value < 0) {
                        console.log("stack pointer at line " + (current_line + 1) + " becomes negative, memory leak");
                        break;
                    }
                    if (value > 100000) {
                        console.log("stack pointer at line " + (current_line + 1) + " becomes bigger than maximum, memory leak");
                        break;
                    }
                    stack_pointer = value;
                } else {
                    registers[instruction[0]] = value;
                }
                current_line++;
                program_counter += 4;
                continue;
            }
        }
        if (is_memory(instruction[0])) {
            if (instruction.length == 3) {
                let value = evaluate_single(instruction[2], registers, memory, stack_pointer, program_counter);
                if (value == undefined) {
                    break;
                }
                let address = evaluate_single(parse_memory_address(instruction[0]), registers, memory, stack_pointer, program_counter, return_value, current_line + 1);
                if (address < 0) {
                    console.log("memory address becomes negative at line " + (current_line + 1) + " which is not allowed");
                    break;
                }
                if (address > 1000000 - 4) {
                    console.log("memory address is over 1000000 at line " + (current_line + 1) + " which is not allowed");
                    break;
                }
                let value_bytes = int_to_bytes(value);
                memory[address] = value_bytes[0];
                memory[address + 1] = value_bytes[1];
                memory[address + 2] = value_bytes[2];
                memory[address + 3] = value_bytes[3];
                current_line++;
                program_counter += 4;
                continue;
            } else {
                let value1 = evaluate_single(instruction[2], registers, memory, stack_pointer, program_counter, return_value, current_line + 1);
                let value2 = evaluate_single(instruction[4], registers, memory, stack_pointer, program_counter, return_value, current_line + 1);
                if (value1 == undefined || value2 == undefined) {
                  break;
                }
                let value = alu_functions[instruction[3]](value1, value2);
                let address = evaluate_single(parse_memory_address(instruction[0]), registers, memory, stack_pointer, program_counter, return_value, current_line + 1);
                if (address < 0) {
                    console.log("memory address becomes negative at line " + (current_line + 1) + " which is not allowed");
                    break;
                }
                if (address > 1000000 - 4) {
                    console.log("memory address is over 1000000 at line " + (current_line + 1) + " which is not allowed");
                    break;
                }
                let value_bytes = int_to_bytes(value);
                memory[address] = value_bytes[0];
                memory[address + 1] = value_bytes[1];
                memory[address + 2] = value_bytes[2];
                memory[address + 3] = value_bytes[3];
                current_line++;
                program_counter += 4;
                continue;
            }
        }
        if (is_comparison_instruction(instruction[0])) {
            let value1 = evaluate_single(instruction[1], registers, memory, stack_pointer, program_counter, return_value, (current_line + 1));
            let value2 = evaluate_single(instruction[2], registers, memory, stack_pointer, program_counter, return_value, (current_line + 1));
            let is_true = comparison_functions[instruction[0]](value1, value2);
            if (instruction.length == 4) {
                if (is_true == true) {
                    let jump_line = evaluate_single(instruction[3], registers, memory, stack_pointer, program_counter, return_value, (current_line + 1));
                    if (jump_line == undefined) {
                        break;
                    }
                    if (jump_line < 0) {
                        console.log("result value at comparison call is negative at line " + (current_line + 1));
                        break;
                    }
                    if (jump_line % 4 != 0) {
                        console.log("result value at comparison call is not divisible by 4 at line " + (current_line + 1));
                        break;
                    }
                    if (jump_line / 4 >= instructions.length) {
                        console.log("comparison call at line " + (current_line + 1) + " results to a line that's greater than last instruction");
                        break;
                    }
                    if (instructions[jump_line / 4][0] === "DEFINE") {
                        console.log("comparison call at line " + (current_line + 1) + " results to a function definition which is not allowed");
                        break;
                    }
                    program_counter = jump_line;
                    current_line = program_counter / 4;
                    continue;
                } else {
                    current_line++;
                    program_counter += 4;
                    continue;
                }
            } else {
                if (is_true == true) {
                    let jump_line_1 = evaluate_single(instruction[3], registers, memory, stack_pointer, program_counter, return_value, (current_line + 1));;
                    let jump_line_2 = evaluate_single(instruction[5], registers, memory, stack_pointer, program_counter, return_value, (current_line + 1));;
                    if (jump_line_1 == undefined || jump_line_2 == undefined) {
                        break;
                    }
                    let jump_line = alu_functions[instruction[4]](jump_line_1, jump_line_2);
                    if (jump_line < 0) {
                        console.log("result value at comparison call is negative at line " + (current_line + 1));
                        break;
                    }
                    if (jump_line % 4 != 0) {
                        console.log("result value at comparison call is not divisible by 4 at line " + (current_line + 1));
                        break;
                    }
                    if (jump_line / 4 >= instructions.length) {
                        console.log("comparison call at line " + (current_line + 1) + " results to a line that's greater than last instruction");
                        break;
                    }
                    if (instructions[jump_line / 4][0] === "DEFINE") {
                        console.log("comparison call at line " + (current_line + 1) + " results to a function definition which is not allowed");
                        break;
                    }
                    program_counter = jump_line;
                    current_line = program_counter / 4;
                    continue;
                } else {
                    current_line++;
                    program_counter += 4;
                    continue;
                }
            }
        }
    }
}
