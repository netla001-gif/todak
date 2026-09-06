import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {normalizeQuery,rankThreads} from '../lib/threads.mjs';
import {extractThreadsPage} from '../extensions/threads-reader/extract.mjs';
const source=(await readFile(new URL('../extensions/threads-reader/popup.mjs',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
class Element {
 constructor(){this.children=[];this.listeners={};this.value='';this.textContent='';}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=children;}
 addEventListener(name,callback){this.listeners[name]=callback;}
}
async function popup(url,snapshot) {
 const elements=Object.fromEntries(['results','status','source','read','query','sort','search'].map(id=>[id,new Element()]));
 elements.sort.value='relevant';
 const calls=[];
 const context={normalizeQuery,rankThreads,extractThreadsPage,URL,URLSearchParams,Date,Error,document:{getElementById:id=>elements[id],createElement:()=>new Element()},window:{close(){}},chrome:{tabs:{query:async()=>[{id:123,url}],create:async args=>calls.push(args)},scripting:{executeScript:async args=>{calls.push(args);return [{result:snapshot}];}}}};
 vm.runInNewContext(source,context);
 await new Promise(resolve=>setImmediate(resolve));
 return {elements,calls};
}
test('reader only requests temporary active-tab access and cannot connect to external servers',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../extensions/threads-reader/manifest.json',import.meta.url)));
 assert.deepEqual(manifest.permissions,['activeTab','scripting']);assert.equal(manifest.host_permissions,undefined);
 assert.match(manifest.content_security_policy.extension_pages,/connect-src 'none'/);
});
test('popup refuses other sites and Threads message pages before executing script',async()=>{
 for(const url of ['https://example.com/search','https://www.threads.com/messages/','https://www.threads.com.evil.test/search?q=하남']){
  const {elements,calls}=await popup(url,{});assert.equal(calls.length,0);assert.match(elements.status.textContent,/검색 화면에서/);
 }
});
test('popup ranks captured posts and renders untrusted text without HTML execution',async()=>{
 const snapshot={query:'하남',fetchedAt:new Date().toISOString(),posts:[
  {id:'a',username:'writer',text:'하남 아이랑 유모차 무료 <img src=x onerror=alert(1)>',permalink:'https://www.threads.com/@writer/post/a',timestamp:new Date().toISOString()},
  {id:'b',username:'other',text:'하남 부동산 매수',permalink:'https://www.threads.com/@other/post/b',timestamp:new Date().toISOString()}
 ]};
 const {elements,calls}=await popup('https://www.threads.com/search?q=하남',snapshot);
 assert.equal(calls.length,1);assert.equal(calls[0].target.tabId,123);assert.equal(calls[0].func,extractThreadsPage);
 assert.equal(elements.results.children.length,2);assert.equal(elements.results.children[0].children[0].textContent,'@writer');
 assert.match(elements.results.children[0].children[3].textContent,/<img/);
 assert.equal(elements.results.children[0].children[3].innerHTML,undefined);
 assert.match(elements.status.textContent,/2건 표시/);
});
test('popup reports loading or empty DOM without claiming a successful search',async()=>{
 for(const error of ['loading','no_visible_posts']){
  const {elements}=await popup('https://www.threads.com/search?q=하남',{error,posts:[]});
  assert.equal(elements.results.children.length,0);assert.doesNotMatch(elements.status.textContent,/건 표시/);assert.equal(elements.read.disabled,false);
 }
});
