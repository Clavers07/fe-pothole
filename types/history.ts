export interface history {
    datetime: string, // then what about this? We'll use it as key instead
    str: string,
    base: number,
    radix: number,
    result: string,
    steps: string[], // Is this neccessary?
}