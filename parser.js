create_result = function(parsed_instruction_v, error_v) {
    result = {
        parsed_instruction : parsed_instruction_v,
        error : error_v
    };
    return result;
}

wrong_instruction = function(line) {
    return create_result(undefined, "wrong instruction at line " + line);
}

parse_instruction = function(instruction, function_definitions, line, definitions_filled) {
    if (definitions_filled) {
        if (instruction[0] === "CALL") {
            if (is_number(instruction[2])) {
                let found = false;
                for (let [name, line] of Object.entries(function_definitions)) {
                    if (line === parseInt(instruction[2])) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return create_result(undefined, "call function at line " + line + " points to an non-existing function");
                }
            } else {
                if (function_definitions[instruction[2]] == undefined) {
                    return create_result(undefined, "call function at line " + line + " calls an non-existing function");
                }
            }
        }
        return create_result(undefined, "");
    }
    instruction = instruction.trim();
    if (instruction.length === 0) {
        return create_result(undefined, "");
    }

    if (!instruction.match(/^[0-9a-zA-Z <>\[\]//*+-=]+$/)) {
        return create_result(undefined, "instruction contains unwanted character at line " + line);
    }
    instruction = instruction.split(/[ ]+/);

    instruction = split_keep_separator(instruction, /(=)/g);
    instruction = split_keep_separator(instruction, /(\+)/g);
    instruction = split_keep_separator(instruction, /(-)/g);
    instruction = split_keep_separator(instruction, /(\*)/g);
    instruction = split_keep_separator(instruction, /(\/)/g);
    instruction = split_keep_separator(instruction, /(\[)/g);
    instruction = split_keep_separator(instruction, /(\])/g);
    instruction = split_keep_separator(instruction, /(<)/g);
    instruction = split_keep_separator(instruction, /(\>)/g);
    for (let i = 0; i < instruction.length; i++) {
        instruction[i] = instruction[i].toUpperCase();
    }

    for (let i = 0; i < instruction.length; i++) {
        if (instruction[i] == 'M' && i < instruction.length - 3) {
            if (instruction[i + 1] == '[' && instruction[i + 3] == ']') {
                instruction[i] = instruction[i] + instruction[i + 1] + instruction[i + 2] + instruction[i + 3];
                instruction[i + 1] = "";
                instruction[i + 2] = "";
                instruction[i + 3] = "";
            }
        }
    }

    instruction = instruction.filter(function (el) {
        return el != undefined && el.length > 0;
    });

    if (instruction.length <= 1) {
        if (instruction.length === 1 && instruction[0] === "RET") {
            return create_result(instruction, "");
        }
        return wrong_instruction(line);
    }

    if (instruction[0] === "DEFINE") {
        if (instruction.length != 4 || instruction[1] != '<' || instruction[3] != '>') {
            return create_result(undefined, "instruction must have syntax 'DEFINE <function_name>' at line " + line);
        }
        if (instruction[2].charAt(0) >= '0' && instruction[2].charAt(0) <= '9') {
            return create_result(undefined, "function name can't start with a number at line " + line);
        }
        if (!instruction[2].match(/^[0-9a-zA-Z]+$/)) {
            return create_result(undefined, "function name can only contain letters and numbers at line " + line);
        }
        if (function_definitions[instruction[2]] != undefined) {
            return create_result(undefined, "function definition with name " + instruction[2] + " at line " + line + " already exists");
        }
        function_definitions[instruction[2]] = (line - 1) * 4;
    } else if (instruction[0] === "CALL") {
        if (instruction.length != 4 || instruction[1] != '<' || instruction[3] != '>') {
            return create_result(undefined, "instruction must have syntax 'CALL <function_name>' at line " + line);
        }
        if (instruction[2].charAt(0) >= '0' && instruction[2].charAt(0) <= '9' && !instruction[2].match(/^[0-9]+$/)) {
            return create_result(undefined, "function name can't start with a number at line " + line);
        }
        if (!instruction[2].match(/^[0-9a-zA-Z]+$/)) {
            return create_result(undefined, "function name can only contain letters and numbers at line " + line);
        }
    } else if (is_register(instruction[0]) || is_memory(instruction[0])) {
        if (instruction[1] != "=") {
            return wrong_instruction(line);
        }
        if (instruction.length != 3 && instruction.length != 5) {
            return wrong_instruction(line);
        }
        if (instruction.length == 3) {
            if (!(is_register(instruction[2]) || is_memory(instruction[2]) || is_number(instruction[2]))) {
                return create_result(undefined, "a register/memory is assigned an unknown value at line " + line);
            }
            if (instruction[0] === "PC" && is_number(instruction[2]) && parseInt(instruction[2]) % 4 != 0) {
                return create_result(undefined, "PC register can't be assigned to an integer that is not divisible by 4 at line " + line);
            }
        } else  {
            if (!(is_register(instruction[2]) || is_memory(instruction[2]) || is_number(instruction[2])) ||
                !(is_register(instruction[4]) || is_memory(instruction[4]) || is_number(instruction[4]))) {
                return create_result(undefined, "a register/memory is assigned an unknown value at line " + line)
            }
            if (!is_operator(instruction[3])) {
                return create_result(undefined, "there must be an ALU operator in the instruction at line " + line);
            }
            if (instruction[0] === "PC" && is_number(instruction[2]) && is_number(instruction[4])) {
                let val = alu_functions[instruction[3]](parseInt(instruction[2]), parseInt(instruction[4]));
                if (val % 4 != 0) {
                    return create_result(undefined, "PC register can't be assigned to an integer that is not divisible by 4 at line " + line);
                }
            }
        }
    } else if (is_comparison_instruction(instruction[0])) {
        if (instruction.length != 4 && instruction.length != 6) {
            return wrong_instruction(line);
        }
        if (!(is_number(instruction[1]) || is_memory(instruction[1]) || is_register(instruction[1])) ||
            !(is_number(instruction[2]) || is_memory(instruction[2]) || is_register(instruction[2]))) {
            return create_result(undefined, "registers or constants must be in comparison instructions at line " + line);
        }

        if (instruction.length == 4) {
            if (is_number(instruction[3]) && instruction[3] % 4 != 0) {
                return create_result(undefined, "address where the branch goes to must be divisible by 4 at line " + line);
            }
            if (!(is_number(instruction[3]) || is_register(instruction[3]) || is_memory(instruction[3]))) {
                return create_result(undefined, "branch address must be represented as registers or constants at line " + line);
            }
        } else {
            if (!is_operator(instruction[4])) {
                return create_result(undefined, "there must be ALU operator between two registers/constants at line " + line);
            }
            if (is_number(instruction[3]) && is_number(instruction[5])) {
                let val = alu_functions[instruction[4]](parseInt(instruction[3]), parseInt(instruction[5]));
                if (val % 4 != 0) {
                    return create_result(undefined, "address where the branch goes to must be divisible by 4 at line " + line);
                }
            }
            if (!(is_number(instruction[3]) || is_memory(instruction[3]) || is_register(instruction[3])) ||
                !(is_number(instruction[5]) || is_memory(instruction[5]) || is_register(instruction[5]))) {
                    return create_result(undefined, "branch address must be represented as registers or constants at line " + line);
            }
        }
    } else if (instruction[0] === "JUMP") {
        if (instruction.length != 2 && instruction.length != 4) {
            return wrong_instruction(line);
        }
        if (instruction.length == 2) {
            if (!(is_number(instruction[1]) || is_register(instruction[1]) || is_memory(instruction[1]))) {
                return create_result(undefined, "there must be register/constant as JUMP parameter at line " + line);
            }
            if (is_number(instruction[1]) && parseInt(instruction[1]) % 4 != 0) {
                return create_result(undefined, "JUMP instruction address must be divisible by 4 at line " + line);
            }
        } else {
            if (!(is_number(instruction[1]) || is_register(instruction[1]) || is_memory(instruction[1])) ||
                !(is_number(instruction[3]) || is_register(instruction[3]) || is_memory(instruction[3]))) {
                return create_result(undefined, "there must be register/constant as JUMP parameter at line " + line);
            }
            if (!is_operator(instruction[2])) {
                return create_result(undefined, "there must be ALU operator between two registers/constants at line " + line);
            }
            if (is_number(instruction[1]) && is_number(instruction[3])) {
                let val = alu_functions[instruction[2]](parseInt(instruction[1]), parseInt(instruction[3]));
                if (val % 4 != 0) {
                    return create_result(undefined, "address where the JUMP goes to must be divisible by 4 at line " + line);
                }
            }
        }
    } else if (is_number(instruction[0])) {
        return create_result(undefined, "number can't be an instruction at line " + line);
    } else{
        return create_result(undefined, "unknown instruction " + instruction[0] + " at line " + line);
    }

    return create_result(instruction, "");
}
