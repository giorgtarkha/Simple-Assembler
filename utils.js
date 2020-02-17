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
