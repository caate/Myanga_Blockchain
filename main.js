const { Blockchain, Transaction}= require('./blockchain');
const EC= require('elliptic').ec;
const ec=new EC('secp256k1');

const maclé= ec.keyFromPrivate('bb5757419598946346ff504c5e1f1414a7c51517536ad3e7a1279cf2d69327c1');
const monAdressePublique = maclé.getPublic('hex');


let myanga=new Blockchain;
const tx1= new Transaction(monAdressePublique,"Bonaberi","CENAM","Pharmacie de Bonambappe","Daflon","3286600",
"1809007","20 paquets","01/2018","01/2022","expédition","ce lot sort de la production");

tx1.signerTransaction(maclé);

console.log('Début du minage.....');
myanga.minageTransactionsEnAttente();
























