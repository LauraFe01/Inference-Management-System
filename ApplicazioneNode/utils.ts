import { User } from "./Model/user"

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