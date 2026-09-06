import { mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const source=new URL('../extensions/threads-reader/',import.meta.url);
const target=new URL('../work/threads-reader/',import.meta.url);
await mkdir(target,{recursive:true});
for(const file of ['manifest.json','extract.mjs','popup.html','popup.mjs','popup.css']) await copyFile(new URL(file,source),new URL(file,target));
await copyFile(new URL('../lib/threads.mjs',import.meta.url),new URL('threads.mjs',target));
console.log(fileURLToPath(target));
