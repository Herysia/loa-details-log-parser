"use strict";var t=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var d=Object.getOwnPropertyNames;var D=Object.prototype.hasOwnProperty;var p=(m,n)=>{for(var i in n)t(m,i,{get:n[i],enumerable:!0})},l=(m,n,i,r)=>{if(n&&typeof n=="object"||typeof n=="function")for(let a of d(n))!D.call(m,a)&&a!==i&&t(m,a,{get:()=>n[a],enumerable:!(r=u(n,a))||r.enumerable});return m};var s=m=>l(t({},"__esModule",{value:!0}),m);var c={};p(c,{StatusEffectBuffTypeFlags:()=>o,StatusEffectTarget:()=>b});module.exports=s(c);var b=(r=>(r[r.OTHER=0]="OTHER",r[r.PARTY=1]="PARTY",r[r.SELF=2]="SELF",r))(b||{}),o=(e=>(e[e.NONE=0]="NONE",e[e.DMG=1]="DMG",e[e.CRIT=2]="CRIT",e[e.ATKSPEED=4]="ATKSPEED",e[e.MOVESPEED=8]="MOVESPEED",e[e.HP=16]="HP",e[e.DEFENSE=32]="DEFENSE",e[e.RESOURCE=64]="RESOURCE",e[e.COOLDOWN=128]="COOLDOWN",e[e.STAGGER=256]="STAGGER",e[e.SHIELD=512]="SHIELD",e[e.ANY=262144]="ANY",e))(o||{});0&&(module.exports={StatusEffectBuffTypeFlags,StatusEffectTarget});
