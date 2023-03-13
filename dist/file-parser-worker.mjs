import{a as P}from"./chunk-P7CUFKPF.mjs";import"./chunk-3HWDMON2.mjs";import"./chunk-2I7XES37.mjs";import"./chunk-LNTMWDPX.mjs";import"./chunk-WSJANNVG.mjs";import"./chunk-6KMKD42J.mjs";import D from"dayjs";import{v4 as E}from"uuid";import c from"fs";import u from"path";import O from"dayjs/plugin/customParseFormat";D.extend(O);function v(m,S,j,l,k,r){try{let t=m.slice(0,-4),e=t+".json",f=c.readFileSync(u.join(j,m),"utf-8");if(!f)return r(null,"empty log");let o=new P(k,!1);S===!0&&(o.splitOnPhaseTransition=!0);let F=f.split(`
`).filter(n=>n!=null&&n!="");for(let n of F)o.parseLogLine(n);o.splitEncounter();let g=o.encounters;if(g.length>0){let n={encounters:[]};for(let a of g){let p=a.lastCombatPacket-a.fightStartedOn;if(p<=1e3)continue;let i={name:"",damageTaken:0,isPlayer:!1};for(let s of Object.values(a.entities))s.damageTaken>i.damageTaken&&(i={name:s.name,damageTaken:s.damageTaken,isPlayer:s.isPlayer});let y={duration:p,mostDamageTakenEntity:i},d=E(),T=`${t}_${d}_encounter.json`;n.encounters.push({encounterId:d,encounterFile:T,...y}),c.writeFileSync(u.join(l,T),JSON.stringify({...a,...y},h))}return c.writeFileSync(u.join(l,e),JSON.stringify(n)),r(null,"log parsed")}return r(null,"no encounters found")}catch(t){return r(t,"log parser error")}function h(t,e){return e instanceof Map?{dataType:"Map",value:Array.from(e.entries())}:e instanceof Set?{dataType:"Set",value:Array.from(e.values())}:e}}export{v as fileParserWorker};
