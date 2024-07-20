import fs from 'fs/promises';


export async function getBufferData(datapath: string){
    const bufferData = await fs.readFile(datapath);

    return bufferData
}