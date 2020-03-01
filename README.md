# Peerpolls

Political polling billboard with voting and comment system built on a private Ethereum blockchain.

## Setup 

### Start Debian container

`$ docker run -p 80:80 -p 8545:8545 -p 30303:30303 -it --name peerpolls ubuntu:latest`

### Install dependencies

`$ apt-get update`

`$ apt-get --yes install build-essential software-properties-common git curl nginx`

`$ add-apt-repository -y ppa:ethereum/ethereum`

`$ apt-get update`

`$ apt-get --yes install ethereum solc`

`$ curl -sL https://deb.nodesource.com/setup_10.x | bash -`

`$ apt-get install -y nodejs`

### Create Geth account

`$ geth account new`

Save the id somewhere for later as COINBASE\_HASH, for example in `creds.js`, which will be used by the API later.

### Run puppeth wizard

`$ puppeth`

#### Example puppeth sesssion

```
Please specify a network name to administer (no spaces, hyphens or capital letters please)
> peerpolls

Sweet, you can set this via --network=peerpolls next time!

INFO [11-09|10:06:24.633] Administering Ethereum network           name=peerpolls
WARN [11-09|10:06:24.633] No previous configurations found         path=/root/.puppeth/peerpolls

What would you like to do? (default = stats)
 1. Show network stats
 2. Configure new genesis
 3. Track new remote server
 4. Deploy network components
> 2

What would you like to do? (default = create)
 1. Create new genesis from scratch
 2. Import already existing genesis
> 1

Which consensus engine to use? (default = clique)
 1. Ethash - proof-of-work
 2. Clique - proof-of-authority
> 2

How many seconds should blocks take? (default = 15)
>

Which accounts are allowed to seal? (mandatory at least one)
> 0x7b462596778e302F9829A12732a1F27D99B23a69
> 0x

Which accounts should be pre-funded? (advisable at least one)
> 0x7b462596778e302F9829A12732a1F27D99B23a69
> 0x

Should the precompile-addresses (0x1 .. 0xff) be pre-funded with 1 wei? (advisable yes)
>

Specify your chain/network ID if you want an explicit one (default = random)
> 1337
INFO [11-09|10:07:40.441] Configured new genesis block

What would you like to do? (default = stats)
 1. Show network stats
 2. Manage existing genesis
 3. Track new remote server
 4. Deploy network components
> 2

 1. Modify existing configurations
 2. Export genesis configurations
 3. Remove genesis configuration
> 2

Which folder to save the genesis specs into? (default = current)
  Will create peerpolls.json, peerpolls-aleth.json, peerpolls-harmony.json, peerpolls-parity.json
>
INFO [11-09|10:07:50.185] Saved native genesis chain spec          path=peerpolls.json
ERROR[11-09|10:07:50.185] Failed to create Aleth chain spec        err="unsupported consensus engine"
ERROR[11-09|10:07:50.185] Failed to create Parity chain spec       err="unsupported consensus engine"
INFO [11-09|10:07:50.189] Saved genesis chain spec                 client=harmony path=peerpolls-harmony.json

What would you like to do? (default = stats)
 1. Show network stats
 2. Manage existing genesis
 3. Track new remote server
 4. Deploy network components
> ^C

```

## Initialize Geth

`$ geth init peerpolls.json`

### Start geth

`$ geth --unlock <COINBASE_HASH> --password /root/gethpass --mine --rpc --rpcapi "eth,net,web3,admin,personal" --allow-insecure-unlock --nousb --rpcaddr "0.0.0.0" console`

## The contract

### Install web3

`$ npm install web3`

### Compile the contract

`$ solc consensus.sol --combined-json abi,bin > consensus.json`

### Deploy the contract

`$ node index.js <COINBASE_HASH> <COINBASE_PASSWORD>`

Will return the contract address, save it for later.

### Test the contract

`$ node index.js  <COINBASE_HASH> <COINBASE_PASSWORD> <CONTRACT_ADDRESS> <TEST_USER_HASH> <TEST_USER_PASSWORD>`

## API stuff

### Login

`$ curl --cookie-jar cookies.txt -d "name=admin&pwd=password" "https://api.peerparty.org//login"`

### Get posts

`$ curl --cookie cookies.txt "https://api.peerparty.org//posts"`

### Create a post/poll

`$ curl --cookie cookies.txt -d "title=foobar&description=baz" "https://api.peerparty.org//posts"`

### Up vote a post/poll

`$ curl --cookie cookies.txt -d "up=true" "https://api.peerparty.org/posts/1/votes"`

### Comment on a post/poll

`$ curl --cookie cookies.txt -d "comment=foo" "https://api.peerparty.org/posts/1/comments"`

### Down vote a comment

`$ curl --cookie cookies.txt -d "up=false" "https://api.peerparty.org/comments/1/votes"`

### Comment on a comment

`$ curl --cookie cookies.txt -d "comment=bar" "https://api.peerparty.org/comments/1/comments"`

## Helpful stuff

### Geth

Get account balance.

    > eth.getBalance(eth.coinbase)

Get accounts

    > eth.accounts


