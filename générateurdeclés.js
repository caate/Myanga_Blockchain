

const clé= ec.genKeyPair();
const cléPublique= clé.getPublic('hex');
const cléPrivée= clé.getPrivate('hex');

console.log();
console.log('Clé privée:', cléPrivée );

console.log();
console.log('Clé publique:', cléPublique);