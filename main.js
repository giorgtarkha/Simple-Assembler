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
        let parse_result = parse_instruction(instruction, function_definitions, line, false);
        if (parse_result.error.length > 0) {
            errors.push(create_error(parse_result.error, line + 1))
        }
        else if (parse_result.parsed_instruction != undefined) {
            parsed_instructions.push(parse_result.parsed_instruction);
        }
        line++;
    }
    line = 0;
    for (let instruction of parsed_instructions) {
        let call_parse_result = parse_instruction(instruction, function_definitions, line, true);
        if (call_parse_result.error.length > 0) {
            errors.push(create_error(call_parse_result.error, line + 1))
        }
        line++;
    }
    if (errors.length > 0) {
        for (let error of errors) {
            console.log(error.error);
        }
    } else {
        emulate(parsed_instructions, function_definitions);
    }
}

window.onload = function() {
    document.getElementById("run-button").addEventListener("click", run);
}
