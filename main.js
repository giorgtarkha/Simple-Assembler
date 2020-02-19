create_error = function(error_v, line_v) {
    error = {
        error : error_v,
        line : line_v
    };
    return error;
}

run = function() {
    console.clear();
    let code = document.getElementById("code").value;
    let instructions = code.split("\n");
    let parsed_instructions = [];
    let function_definitions = {};
    let errors = [];
    let line = 0;
    for (let instruction of instructions) {
        let parse_result = parse_instruction(instruction, function_definitions, line + 1, false);
        if (parse_result.error.length > 0) {
            errors.push(create_error(parse_result.error, line + 1))
        } else {
            parsed_instructions.push(parse_result.parsed_instruction);
        }
        line++;
    }
    line = 0;
    for (let instruction of parsed_instructions) {
        if (instruction != undefined) {
            let call_parse_result = parse_instruction(instruction, function_definitions, line + 1, true);
            if (call_parse_result.error.length > 0) {
                errors.push(create_error(call_parse_result.error, line + 1))
            }
        }
        line++;
    }
    if (function_definitions["MAIN"] == undefined) {
        errors.push(create_error("function named 'MAIN' needs to be defined for the program to run", -1));
    }

    if (errors.length > 0) {
        for (let error of errors) {
            console.log(error.error);
        }
    } else {
        let current_name = undefined;
        for (let i = 0; i < parsed_instructions.length; i++) {
            if (parsed_instructions[i] == undefined) {
                continue;
            }
            if (parsed_instructions[i][0] === "DEFINE") {
                if (current_name != undefined) {
                    errors.push(create_error("function '" + current_name + "' at line " + (i + 1) + " must return before new definition", i + 1));
                } else {
                    current_name = parsed_instructions[i][2];
                }
            } else if (parsed_instructions[i][0] === "RET") {
                current_name = undefined;
            }
        }
        if (current_name != undefined) {
            errors.push(create_error("last function doesn't have a return", -1));
        }
        if (errors.length > 0) {
            for (let error of errors) {
                console.log(error.error);
            }
        } else {
            emulate(parsed_instructions, function_definitions);
        }
    }

}

window.onload = function() {
    document.getElementById("run-button").addEventListener("click", run);
}
