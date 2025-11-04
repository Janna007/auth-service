import { generateKeyPairSync } from "crypto";
import fs from 'fs'

  
  const {
    publicKey,
    privateKey,
  } = generateKeyPairSync('rsa', {
    modulusLength: 2048,

    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',

    },
  });


  console.log("privateKey",privateKey)
  console.log("publicKey",publicKey)

  fs.writeFileSync('certs/private.pem',privateKey)
  fs.writeFileSync('certs/public.pem',publicKey)