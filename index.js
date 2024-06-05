var CoinKey = require('coinkey');
const axios = require('axios');
const bitcore = require('bitcore-explorers');
const bitcoin = require('bitcoinjs-lib');
const QRCode = require('qrcode');
const express = require('express');
const app = express();
const port = 3000;

const createWallet = async () => {

    try {
        var wallet = new CoinKey.createRandom();  //this code automatically creates a new wallet address and returns a private key and public address
        var publicAddress = wallet.publicAddress;
        var privateKey = wallet.privateKey;
        console.log("SAVE BUT DO NOT SHARE THIS:", wallet.privateKey.toString('hex'));
        console.log("Address:", wallet.publicAddress);
        //public addresss is the BTC wallet address that will receive funds
        //private key is the key that will be used to sign transactions - more like a password, please store securely

        return {"privateKey":wallet.privateKey.toString('hex'),"publicAddress":wallet.publicAddress};
    } catch (e) {
                //handle errors
                //please handle errors in this location 
                console.log(e);
                return "error occured";
    }

}
// createWallet();
// the createWallet function will return a private key and public address, please store the private key securely and do not share it with anyone
//please store up the address you generated in the createWallet in a secure database, retrieve the address and pass it to the getWalletBalance function


async function getWalletBalance(address) {
    try {
        const response = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${address}`);
        const balance = response.data.final_balance / 1e8; // Convert satoshis to BTC
        console.log(`Balance: ${balance} BTC`);
        return balance;
      } catch (error) {
        console.error('Error fetching balance:', error.message);
        return 'error occured';
      }
}


// getWalletBalance('1KWBoPVCpVYDACyCiWwF5WZ9ZiqAsWg7VV').then((data)=>{
//     console.log(data);
// }).catch((error)=>{ 
//     console.log(error);
// });

//uncomment the getWalletBalance function and pass the public address generated in the createWallet function to get the balance of the wallet



async function sendBTC(fromAddress, toAddress, amountInBTC) {
  // Fetch UTXOs for the fromAddress
  const utxosResponse = await axios.get(`https://api.sochain.com/v2/get_tx_unspent/BTC/${fromAddress}`);
  const utxos = utxosResponse.data.data.txs;

  // Create a transaction
  const txb = new bitcoin.TransactionBuilder(bitcoin.networks.bitcoin);

  // Add inputs and outputs
  utxos.forEach(utxo => {
    txb.addInput(utxo.txid, utxo.output_no);
    txb.addOutput(toAddress, amountInBTC * 100000000); // Convert BTC to satoshis
  });

  // Sign the transaction
  const privateKey = bitcoin.ECPair.fromWIF('yourPrivateKeyHere');
  txb.sign(0, privateKey);
  txb.validateSignatures();

  // Serialize and broadcast the transaction
  const rawTx = txb.build().toHex();
  console.log(`Raw Transaction: ${rawTx}`);

  // Broadcast the transaction (you'll need to replace this with your preferred method)
  // Example: axios.post('https://api.blockcypher.com/v1/btc/main/txs/push', { tx: rawTx });
}

// sendBTC('fromAddressHere', 'toAddressHere', 0.01);
app.get('/', (req, res) => {
  res.send({'status':'success','message' : 'Welcome to the BTC Wallet API'});
});

app.get('/generateqr', (req, res) => {
  const body = req.query;
  const btcAddress = body.wallet;
  console.log(body)
  async function generateQRCodeImage() {
    try {
      const qrCodeUrl = await QRCode.toDataURL(btcAddress);
      console.log(`QR Code URL: ${qrCodeUrl}`);
      return qrCodeUrl;
      // Optionally, save the QR code image to a file
      // fs.writeFileSync('btcAddress.qrcode.png', qrCodeUrl);
    } catch (err) {
      console.error(err);
      return 'erroroccured'
    }
  }
  generateQRCodeImage().then((data)=>{
      if(data == 'erroroccured'){
        res.send({'status':'failed','message' : 'An error occured'});
      }else{
        res.send({'status':'success','message' : {'wallet':btcAddress,'imageurl':data}});
      }
  }).catch((e)=>{
    console.log(e);
    res.send({'status':'failed','message' : 'An error occured','error':e});
  });

  
});

app.get('/createwallet', async (req, res) => {
  createWallet().then((data)=>{
    if(data == "error occured"){
      res.send({'status':'error','message' : 'An error occured'});
    }else{
      res.send({'status':'success','message' : 'Wallet Created Successfully','data':data});
    }
  }).catch((error)=>{ 

    console.log(error);
  res.send({'status':'error','message' : 'An error occured'});
  });


});

app.get('/checkbalance', async(req, res) => {
  const body = req.query;
  console.log(body);
  try {
  const address = body.address;
    getWalletBalance(address).then((data)=>{
      if (data == 'error occured') {
        res.send({'status':'error','message' : 'An error occured'});
      } else {
        res.send({'status':'success','message':'Balance retrieved sucessfully','data':{"balance":data,"address":address}});
      }
    }).catch((error)=>{ 
      console.log(error);
      res.send({'status':'error','message' : 'An error occured'});
    });
  } catch (error) {
    res.send({'status':'error','message' : 'An error occured'});
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});