function run() {
    let registers = {};
    let memory = new Array(100000000).fill(0);
    let stack_pointer = 1000000;
    let return_value = 0;
    let program_counter = 0;
    let code = document.getElementById("code").value;
    let instructions = code.split("\n");
    let parsed_instructions = [];
    for (let instruction of instructions) {
        let parse_result = parse_instruction(instruction);
        if (parse_result.error_code > 0) {
            console.log(parse_result.error);
            return;
        }
        if (parse_result.parsed_instruction != undefined) {
            parsed_instructions.push(parse_result.parsed_instruction);
        }
    }


}

window.onload = function() {
    document.getElementById("run-button").addEventListener("click", run);
}
