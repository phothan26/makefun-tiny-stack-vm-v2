// tiny-stack-vm v2: a JIT, not an interpreter. Each program is compiled once
// to JavaScript (basic blocks become JS functions, driven by a trampoline)
// and then run. Designed from generator/subject/ISA.md in the kit.
// Node 22, stdlib only. Run: node main.ts (reads /input, writes /output);
// MAKEFUN_INPUT_DIR / MAKEFUN_OUTPUT_DIR override the directories.
import{readdirSync,readFileSync,mkdirSync,writeFileSync,chmodSync}from'node:fs';
import{join}from'node:path';
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
function run(P,D){
 const L=P.length,C=new Map(),S=new Set([0]),W=[0];
 const im=o=>o===1?1:o===2?4:o>47&&o<52?2:0;
 const ok=o=>o<8||o>15&&o<35&&o!==31||o>47&&o<53||o>63&&o<66||o>79&&o<84;
 const J=t=>t>=0&&t<L?(S.add(t),W.push(t),'B'+t):'OU';
 while(W.length){
  const pc=W.pop();
  if(C.has(pc)||pc<0||pc>=L)continue;
  let i=pc,s='',n=0;
  for(;;){
   if(i>=L){s+='return OU;';break;}
   if(i!==pc&&S.has(i)){s+='return B'+i+';';break;}
   const o=P[i],k=im(o);
   if(!ok(o)){s+='return U5;';break;}
   if(i+1+k>L){s+='return OU;';break;}
   s+='if(++n>1e6)return T(10);';
   if(o===0){s+='return T(0);';break;}
   else if(o===1){s+='if(p>255)return T(3);s[p++]='+((P[i+1]<<24)>>24)+';';i+=2;}
   else if(o===2){s+='if(p>255)return T(3);s[p++]= '+(P[i+1]|P[i+2]<<8|P[i+3]<<16|P[i+4]<<24)+';';i+=5;}
   else if(o===3){s+='if(p<1)return T(2);p--;';i++;}
   else if(o===4){s+='if(p<1)return T(2);if(p>255)return T(3);s[p]=s[p-1];p++;';i++;}
   else if(o===5){s+='if(p<2)return T(2);a=s[p-1];s[p-1]=s[p-2];s[p-2]=a;';i++;}
   else if(o===6){s+='if(p<2)return T(2);if(p>255)return T(3);s[p]=s[p-2];p++;';i++;}
   else if(o===7){s+='if(p<3)return T(2);a=s[p-3];s[p-3]=s[p-2];s[p-2]=s[p-1];s[p-1]=a;';i++;}
   else if(o===16){s+='if(p<2)return T(2);s[p-2]=(s[p-2]+s[p-1])|0;p--;';i++;}
   else if(o===17){s+='if(p<2)return T(2);s[p-2]=(s[p-2]-s[p-1])|0;p--;';i++;}
   else if(o===18){s+='if(p<2)return T(2);s[p-2]=Math.imul(s[p-2],s[p-1]);p--;';i++;}
   else if(o===19){s+='if(p<2)return T(2);b=s[p-1];a=s[p-2];if(!b)return T(4);s[p-2]=(a/b)|0;p--;';i++;}
   else if(o===20){s+='if(p<2)return T(2);b=s[p-1];a=s[p-2];if(!b)return T(4);s[p-2]=(a%b)|0;p--;';i++;}
   else if(o===21){s+='if(p<2)return T(2);b=s[p-1];a=s[p-2];if(!b)return T(4);s[p-2]=((a>>>0)/(b>>>0))|0;p--;';i++;}
   else if(o===22){s+='if(p<2)return T(2);b=s[p-1];a=s[p-2];if(!b)return T(4);s[p-2]=((a>>>0)%(b>>>0))|0;p--;';i++;}
   else if(o===23){s+='if(p<1)return T(2);s[p-1]=(-s[p-1])|0;';i++;}
   else if(o===24){s+='if(p<2)return T(2);s[p-2]&=s[p-1];p--;';i++;}
   else if(o===25){s+='if(p<2)return T(2);s[p-2]|=s[p-1];p--;';i++;}
   else if(o===26){s+='if(p<2)return T(2);s[p-2]^=s[p-1];p--;';i++;}
   else if(o===27){s+='if(p<1)return T(2);s[p-1]=~s[p-1];';i++;}
   else if(o===28){s+='if(p<2)return T(2);s[p-2]<<=s[p-1];p--;';i++;}
   else if(o===29){s+='if(p<2)return T(2);s[p-2]>>=s[p-1];p--;';i++;}
   else if(o===30){s+='if(p<2)return T(2);s[p-2]=(s[p-2]>>>s[p-1])|0;p--;';i++;}
   else if(o===32){s+='if(p<2)return T(2);s[p-2]=s[p-2]===s[p-1]?1:0;p--;';i++;}
   else if(o===33){s+='if(p<2)return T(2);s[p-2]=s[p-2]<s[p-1]?1:0;p--;';i++;}
   else if(o===34){s+='if(p<2)return T(2);s[p-2]=(s[p-2]>>>0)<(s[p-1]>>>0)?1:0;p--;';i++;}
   else if(o===48){const t=i+3+((P[i+1]|P[i+2]<<8)<<16>>16);s+='return '+J(t)+';';break;}
   else if(o===49||o===50){const t=i+3+((P[i+1]|P[i+2]<<8)<<16>>16),f=i+3;s+='if(p<1)return T(2);a=s[--p];return a?'+(o===50?J(t):J(f))+':'+(o===50?J(f):J(t))+';';break;}
   else if(o===51){const t=P[i+1]|P[i+2]<<8;S.add(i+3);W.push(i+3);s+='if(q>63)return T(7);c[q++]= '+(i+3)+';return '+J(t)+';';break;}
   else if(o===52){s+='if(!q)return T(8);a=c[--q];return a<P.length&&A[a]?A[a]:OU;';break;}
   else if(o===64){s+='if(p<1)return T(2);a=s[p-1];if(a<0||a>255)return T(6);s[p-1]=m[a];';i++;}
   else if(o===65){s+='if(p<2)return T(2);a=s[--p];if(a<0||a>255)return T(6);m[a]=s[--p];';i++;}
   else if(o===80){s+='if(p<1)return T(2);if(PR(s[--p])===null)return null;';i++;}
   else if(o===81){s+='if(p<1)return T(2);if(PU(s[--p])===null)return null;';i++;}
   else if(o===82){s+='if(p>255)return T(3);s[p++]=g<D.length?D[g++]:-1;';i++;}
   else if(o===83){s+='if(p<1)return T(2);return T(s[--p]&255);';break;}
   if(++n===64){s+='return '+J(i)+';';break;}
  }
  C.set(pc,s);
 }
 let g='let s=[],p=0,m=new Int32Array(256),c=[],q=0,g=0,o=[],n=0,e=0,a,b;';
 g+='const T=x=>{e=x;return null;};';
 g+='const OU=()=>{if(++n>1e6)return T(10);return T(9);};';
 g+='const U5=()=>{if(++n>1e6)return T(10);return T(5);};';
 g+='const PR=v=>{const t=String(v);if(o.length+t.length>65536)return T(11);for(let k=0;k<t.length;k++)o.push(t.charCodeAt(k));};';
 g+='const PU=v=>{if(o.length>65535)return T(11);o.push(v&255);};';
 for(const[pc,body]of C)g+='function B'+pc+'(){'+body+'}';
 g+='const A=[];';
 for(const pc of C.keys())g+='A['+pc+']=B'+pc+';';
 g+='let w=B0;while(w)w=w();return[Buffer.from(o),e];';
 return new Function('P','D',g)(P,D);
}
// __DRIVER__
try{mkdirSync(O);}catch(e){}
for(const id of readdirSync(I,{withFileTypes:true}).filter(f=>f.isDirectory()).map(f=>f.name).sort()){
 const dir=join(I,id);
 const P=readFileSync(join(dir,'program.bin')),D=readFileSync(join(dir,'input.bin'));
 let r;
 try{r=run(P,D);}catch(e){r=[Buffer.alloc(0),0];}
 const od=join(O,id);
 let mk=false;
 try{mkdirSync(od);mk=true;}catch(e){if(e.code!=='EEXIST')throw e;}
 if(mk)chmodSync(od,0o755);
 writeFileSync(join(od,'stdout.bin'),r[0]);chmodSync(join(od,'stdout.bin'),0o644);
 writeFileSync(join(od,'exit.txt'),r[1]+'\n');chmodSync(join(od,'exit.txt'),0o644);
}
