var alu_functions = {
    '+' : function (x, y) { return x + y; },
    '-' : function (x, y) { return x - y; },
    '*' : function (x, y) { return x * y; },
    '/' : function (x, y) { return Math.floor(x / y); }
};

var comparison_functions = {
    "BLT" : function (x, y) { return x < y; },
    "BGT" : function (x, y) { return x > y; },
    "BLE" : function (x, y) { return x <= y; },
    "BGE" : function (x, y) { return x >= y; },
    "BEQ" : function (x, y) { return x == y; },
    "BNE" : function (x, y) { return x != y; }
}

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
    return [integer & 0xFF, (integer >> 8) & 0xFF, (integer >> 16) & 0xFF, (integer >> 24) & 0xFF];
}

bytes_to_int = function(bytes) {
  return bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
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

parse_memory_address = function(obj) {
    return obj.substr(2).substr(0, obj.length - 3);
}

is_comparison_instruction = function(obj) {
    return ["BLT", "BLE", "BEQ", "BNE", "BGT", "BGE"].includes(obj);
}
