function a(r,s=0,t=10,N=!1){if(typeof r=="number")return isNaN(r)?s:r;let e;try{e=N?parseFloat(r):parseInt(r,t),isNaN(e)&&(e=s)}catch{e=s}return e}export{a as tryParseInt};
module.exports = module.exports.default;
