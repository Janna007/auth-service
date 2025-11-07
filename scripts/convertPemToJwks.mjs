import fs from 'fs'
import rsaPemToJwk from 'rsa-pem-to-jwk'
 
var pem = fs.readFileSync('./certs/private.pem');
 
var jwk = rsaPemToJwk(pem, {use: 'sig'}, 'public');


console.log(JSON.stringify(jwk));