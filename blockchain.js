const SHA256= require('crypto-js/sha256');
const { v4: uuidv4 } = require('uuid');
const { errorMonitor } = require('stream');
uuidv4();
const EC= require('elliptic').ec;
const ec=new EC('secp256k1');

class Transaction{
    constructor(adresseF,adresseR,labelEntrepriseE,labelEntrepriseR, nomMédicament,
        idMédicament,numLot,quantité,dateFabrication, dateExpi,statut,message){
            this.adresseF=adresseF;
            this.adresseR=adresseR;
            this.labelEntrepriseE=labelEntrepriseE;
            this.labelEntrepriseR=labelEntrepriseR;
            this.nomMédicament=nomMédicament;
            this.idMédicament=idMédicament;
            this.numLot=numLot;
            this.quantité=quantité;
            this.dateFabrication=dateFabrication;
            this.dateExpi=dateExpi;
            this.statut=statut;
            this.message=message; 

        }

    calculHashT(){
        return SHA256(this.adresseF + this.adresseR + this.labelEntrepriseE+ this.labelEntrepriseR+
            this.nomMédicament+ this.idMédicament+ this.numLot+ this.quantité+ this.dateFabrication+ this.dateFabrication
            + this.statut + this.message).toString();
    }

    signerTransaction(clésSignature){
        if(clésSignature.getPublic('hex') !== this.adresseF){
            throw new error ("Désolé mais vous ne pouvez pas signer cette transaction!!");
        }

        const hashTx= this.calculHashT();
        const sig= clésSignature.sign(hashTx,'base64');
        this.signature=sig.toDER('hex');
    }

    transactionValide(){
        if(!this.adresseR == null) return true;

        if(!this.signature || this.signature.length == 0) {
            throw new error ('Cette transaction est dépourvue de signature');
        }

        const cléPublique= ec.KeyFromPublic(this.adresseF,'hex');
        return cléPublique.verify(this.calculHashT(), this.signature);
    }

}

class Bloc{
    constructor(horodatage, transactions, hashBlocPreced=''){
        this.horodatage= horodatage;
        this.transactions= transactions;
        this.hashBlocPreced= hashBlocPreced;
        this.hash= this.calculHash();
        this.nonce= 0;
    }
    calculHash(){
        return SHA256(this.hashBlocPreced + this.horodatage + JSON.stringify(this.transactions)+ this.nonce).toString();
    }
    
    minage(difficulté){
        while(this.hash.substring(0,difficulté)!== Array(difficulté + 1).join("0")){
            this.nonce++
            this.hash=this.calculHash();
        }

        console.log("Ce bloc a été miné avec succès: " + this.hash, "nonce:"  + this.nonce);
    }

    contientTransactionsValides(){
        for(const tx of this.transactions){
            if(!tx.transactionValide()){
                return false;
            }
        }
        return true;
    }
}


class Blockchain{
    constructor(){
        this.chaine= [this.creerGenesisBloc()];
        this.difficulté=4;
        this.transactionsEnAttente= [];
    }

    creerGenesisBloc(){
        return new Bloc('24/08/2020','Genesis Bloc', '0');
    }

    getDernierBloc(){
        return this.chaine[this.chaine.length -1];
    }

    minageTransactionsEnAttente(){
        let bloc= new Bloc(Date.now(), this.transactionsEnAttente);
        bloc.minage(this.difficulté);

        console.log('Bloc miné avec succès!!!');
        this.chaine.push(bloc);
        this.transactionsEnAttente= [];
    }

    ajouterTransaction(transaction){

        if(!transaction.adresseF || transaction.adresseR){
            throw new Error ("Veuillez renseigner l'adresse de l'émetteur et/ou celle du récepeteur");
        }

        if (!transaction.transactionValide()){
            throw new error("Impossible d'insérer dans notre chaine un transaction inval");

        }
        this.transactionsEnAttente.push(transaction);
    }


    chaineValide(){
        for (let i=1; i<this.chaine.length; i++){
            const instanceBloc=this.chaine[i];
            const blocPreced=this.chaine[i-1];

            if(!instanceBloc.contientTransactionsValides()){
                return false;
            }
            
            if(instanceBloc.hash !== instanceBloc.calculHash()){
                return false;
            }

            if (instanceBloc.hashBlocPreced !== blocPreced.hash){
                return false;
            }
        }
        return true;
    }

}

module.exports.Blockchain= Blockchain;
module.exports.Transaction= Transaction;