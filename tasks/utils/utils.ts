export function arrayToCsv(columns, data) {
    return columns
        .join(',')
        .concat('\n')
        .concat(
            data
                .map(
                    (row) =>
                        row
                            .map(String) // convert every value to String
                            .map((v) => (v === 'undefined' ? '' : v))
                            .map((v) => v.replace(/\"/g, '""')) // escape double colons
                            .map((v) => `"${v}"`) // quote it
                            .join(',') // comma-separated
                )
                .join('\r\n') // rows starting on new lines)
        )
}