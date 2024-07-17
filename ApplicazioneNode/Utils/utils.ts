import { User } from "../Model/user"

export function updateToken(type: string, user: User, numElem: number){
    let tokenUsed = 0

    if (type == "uploadImage"){
        tokenUsed = 0.65*numElem
    }else if (type == "uploadZip"){
        tokenUsed = 0.7*numElem
    }else if (type == "inference") {
        tokenUsed = 1.5*numElem
    }

    const tokenRemaining = user.numToken - tokenUsed

    return tokenRemaining
}

export function arraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1 === arr2) return true; // Same reference
    if (arr1 == null || arr2 == null) return false; // One is null/undefined
    if (arr1.length !== arr2.length) return false; // Different length
  
    for (let i = 0; i < arr1.length; ++i) {
      if (arr1[i] !== arr2[i]) return false; // Different elements
    }
    return true;
  }