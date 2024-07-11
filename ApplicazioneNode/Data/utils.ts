import fs from 'fs/promises';


export async function getBufferData(datapath: string){
    let bufferData = await fs.readFile(datapath);

    return bufferData
}