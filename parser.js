create_result = function(parsed_instruction_v, error_code_v, error_v) {
    result = {
        parsed_instruction : parsed_instruction_v,
        error_code : error_code_v,
        error : error_v
    };
    return result;
}

parse_instruction = function(instruction) {
    instruction = instruction.trim();
    if (instruction.length === 0) {
        return create_result(undefined, 0, "");
    }

    if (!instruction.match(/^[0-9a-zA-Z <>\[\]//*+-=]+$/)) {
        return create_result(undefined, 1, "instruction contains unwanted character");
    }
    splitted_instruction = instruction.split(/[ ]+/);

    splitted_instruction = split_keep_separator(splitted_instruction, /(=)/g);
    splitted_instruction = split_keep_separator(splitted_instruction, /(\+)/g);
    splitted_instruction = split_keep_separator(splitted_instruction, /(-)/g);
    splitted_instruction = split_keep_separator(splitted_instruction, /(\*)/g);
    splitted_instruction = split_keep_separator(splitted_instruction, /(\/)/g);
    splitted_instruction = split_keep_separator(splitted_instruction, /(\[)/g);
    splitted_instruction = split_keep_separator(splitted_instruction, /(\])/g);
    splitted_instruction = split_keep_separator(splitted_instruction, /(<)/g);
    splitted_instruction = split_keep_separator(splitted_instruction, /(>)/g);

    if (splitted_instruction.length <= 1) {
        if (splitted_instruction.length === 1 && splitted_instruction[0] === "RET") {
            return create_result(splitted_instruction, 0, "");
        }
        return create_result(undefined, 2, "wrong instruction");
    }

    return create_result(splitted_instruction, 0, "");
}
