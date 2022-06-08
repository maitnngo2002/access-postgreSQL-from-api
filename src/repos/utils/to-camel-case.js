module.exports = (rows) => {
    return rows.map((row) => {
        const replaced = {};
        for (let key in row) {
            // look at every single location where we see either a dash or an underscore followed by some single character
            // provide that dash/underscore and the following character as an argument called $1
            // turn them to uppercase and replace the _ with ''
            const camelCase = key.replace(/([-_][a-z])/gi, ($1) => $1.toUpperCase().replace("_", ""));

            replaced[camelCase] = row[key];
        }
        return replaced;
    });
};
