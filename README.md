<h1>This is a BTC wallet handler using JavaScript</h1>
<p>This creates a btc wallet and returns a publicAddress and a private key</p><br/>
<br/>
<h2>API REFERENCE </h2>

<caption> 
This is a start of the api reference
</caption>

```sh
curl -H "Custom-Header: Value" https://btcwallet-js.onrender.com
```


<p>1. Create Wallet</p>
<i>make a GET REQUEST TO https://btcwallet-js.onrender.com/createwallet</i>

```sh
curl -H "Custom-Header: Value" https://btcwallet-js.onrender.com/createwallet
```

<p>2. See Balance</p>
<i>make a GET REQUEST to https://btcwallet-js.onrender.com/checkbalance?address=1JbtPxAS6UNwZnNE7ww1KuXCcUQDG3gHVU</i>

```sh
curl -X GET "https://btcwallet-js.onrender.com/checkbalance?address=1JbtPxAS6UNwZnNE7ww1KuXCcUQDG3gHVU"
```


<h2>USE LOCALLY </h2>
<p>Packages to install</p>

```bash

npm install coinkey axios bitcore-lib

```
<br/>
<p>How to run the script</p>

```bash

node index.js

```

<p>1. Create a wallet </p>

```js
const createWallet = () => {

    try {
        var wallet = new CoinKey.createRandom();  //this code automatically creates a new wallet address and returns a private key and public address
        var publicAddress = wallet.publicAddress;
        var privateKey = wallet.privateKey;
        console.log("SAVE BUT DO NOT SHARE THIS:", wallet.privateKey.toString('hex'));
        console.log("Address:", wallet.publicAddress);
        //public addresss is the BTC wallet address that will receive funds
        //private key is the key that will be used to sign transactions - more like a password, please store securely

        //return wallet;
    } catch (e) {
                //handle errors
                //please handle errors in this location 
                console.log(e);
    }

}
createWallet();
```
<p>2. See Balance</p>

```js
async function getWalletBalance(address) {
    try {
        const response = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${address}`);
        const balance = response.data.final_balance / 1e8; // Convert satoshis to BTC
        console.log(`Balance: ${balance} BTC`);
        return balance;
      } catch (error) {
        console.error('Error fetching balance:', error.message);
        return null;
      }
}
//replace 1KWBoPVCpVYDACyCiWwF5WZ9ZiqAsWg7VV with the actual wallet address
getWalletBalance('1KWBoPVCpVYDACyCiWwF5WZ9ZiqAsWg7VV').then((data)=>{
    console.log(data);
}).catch((error)=>{ 
    console.log(error);
});
```

<p>3. Send BTC </p>
