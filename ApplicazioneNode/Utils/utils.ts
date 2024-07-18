import { User } from "../Model/user";

/**
 * Calculates the remaining tokens after deducting the tokens used based on the operation type.
 * @param type - Type of operation ("uploadImage", "uploadZip", or "inference").
 * @param user - User object containing the current token count.
 * @param numElem - Number of elements (images, files, etc.) involved in the operation.
 * @returns Remaining tokens after deducting the tokens used.
 */
export function updateToken(type: string, user: User, numElem: number): number {
    let tokenUsed = 0;

    if (type === "uploadImage") {
        tokenUsed = 0.65 * numElem;
    } else if (type === "uploadZip") {
        tokenUsed = 0.7 * numElem;
    } else if (type === "inference") {
        tokenUsed = 1.5 * numElem;
    }

    const tokenRemaining = user.numToken - tokenUsed;

    return tokenRemaining;
}

/**
 * Checks if two arrays have equal elements in the same order.
 * @param arr1 - First array to compare.
 * @param arr2 - Second array to compare.
 * @returns True if arrays have identical elements in the same order, false otherwise.
 */
export function arraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1 === arr2) return true; // Same reference

    if (arr2 === undefined) return true;

    if (arr1.length !== arr2.length) return false; // Different length

    for (let i = 0; i < arr1.length; ++i) {
        if (arr1[i] !== arr2[i]) return false; // Different elements
    }

    return true; // Arrays are equal
}
