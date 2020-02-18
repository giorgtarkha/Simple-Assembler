init = function(instructions, function_definitions) {
    result = {
        start_line : -1,
        errors : []
    };
    for (let [name, line] of Object.entries(function_definitions)) {
        if (name.toUpperCase() === "MAIN") {
            result.start_line = line + 1;
            break;
        }
    }
    return result;
}

emulate = function(instructions, function_definitions) {
    let registers = {};
    let memory = new Array(1000000).fill(0);
    let stack_pointer = 100000;
    let return_value = 0;
    let program_counter = 0;
    let callers = [];
    init_result = init(instructions, function_definitions);
    if (result.start_line === -1) {
        console.log("function named 'MAIN' needs to be defined for the program to run");
        return;
    }
    if (result.errors.length > 0) {
        console.log(result);
        return;
    }

    let current_line = result.start_line;
    while (true) {
        if (current_line >= instructions.length) {
            break;
        }
        let instruction = instructions[current_line];


        current_line++;
    }

}
