/**
 * Return true if `types` includes `type`.
 * It compares with `===` like `types.some(t => t === type)`, without creating a closure.
 */
export const includesType = (types: readonly string[], type: string): boolean => {
    for (let i = 0; i < types.length; i++) {
        if (types[i] === type) {
            return true;
        }
    }
    return false;
};
