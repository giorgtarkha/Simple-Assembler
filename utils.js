var alu_functions = {
    '+' : function (x, y) { return x + y; },
    '-' : function (x, y) { return x - y; },
    '*' : function (x, y) { return x * y; },
    '/' : function (x, y) { return Math.floor(x / y); }
};

split_keep_separator = function(arr, regex) {
    let result = [];
    for (let str of arr) {
        spl = str.split(regex);
        for (let s of spl) {
            if (s.length > 0) {
                result.push(s);
            }
        }
    }
    return result;
}

int_to_bytes = function(integer) {
    return [(integer >> 24) & 0xFF, (integer >> 16) & 0xFF, (integer >> 8) & 0xFF, integer & 0xFF];
}

is_operator = function(obj) {
    return obj.length == 1 && obj.match(/^[*+-=]+$/)
}

is_number = function(obj) {
    return obj.match(/^[0-9]+$/);
}

is_register = function(obj) {
    if (obj === "PC" || obj === "SP" || obj === "RV") {
        return true;
    }
    if (obj.charAt(0) === 'R') {
        let register_number = obj.substr(1);
        if (register_number.length > 0 && is_number(register_number)) {
            return true;
        }
    }
    return false;
}

is_memory = function(obj) {
    if (obj.charAt(0) != 'M' && obj.charAt(1) != '[' && obj.charAt(obj.length - 1) != ']') {
        return false;
    }
    let middle = obj.substr(2, obj.length - 3);
    if (!is_number(middle) && !is_register(middle)) {
        return false;
    }
    return true;
}

is_branch_instruction = function(obj) {
    return ["BLT", "BLE", "BEQ", "BNE", "BGT", "BGE"].includes(obj);
}
