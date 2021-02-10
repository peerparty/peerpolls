# Peer Party

https://github.com/peerparty/peerpolls

/home/dev/.ethereum/keystore/

Hash: 0x159D8ea11f57d12b6Ea0627CF399a95D0FBBb0aB
Contract: 0x89800F520e152E397Dc08428137132cdFB965648

put contact address in `address.js`

git clone https://github.com/peerparty/polls-app

    docker run --name ppweb --rm --net=host \
        -v $PWD:/home -w /home \
        -v $PWD/Caddyfile:/etc/caddy/Caddyfile \
        caddy 

    open http://localhost:9999/

Edit creds.js
- put your COINBASE_HASH in `admin.addr`
- put your unlock password in `admin.password`

Run daemon:

    git clone https://github.com/peerparty/polls-api
    cd polls-api
    npm install
    node server.js

Login to API:

     curl --cookie-jar cookies.txt -d "name=admin&pwd=PASSWORD" "http://localhost:9999/api/login"

Create the test users:

     curl --cookie-jar cookies.txt -d "pwd=PASSWORD" "http://localhost:9999/api/users"


Default logins
- "admin" and password "PASSWORD"
- "userA" / "PASSWORD"

## Errors

Error: Transaction has been reverted by the EVM:
{
  "blockHash": "0x597a2780922adabb41c5dc1407e46481ed219b2aa55921d1f5ed73949b832b54",
  "blockNumber": 362,
  "contractAddress": null,
  "cumulativeGasUsed": 274282,
  "from": "0xb2eee134fa13fa289412184693ad935a969e0b1b",
  "gasUsed": 127000,
  "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "status": false,
  "to": "0x89800f520e152e397dc08428137132cdfb965648",
  "transactionHash": "0x7a4163638d1dd0e09ae026b457ee625f0a9599202e285f6d25519e41030c91d9",
  "transactionIndex": 1,
  "events": {}
}
    at Object.TransactionError (/home/dev/repo/services/eth/peerpolls/polls-api/node_modules/web3-core-helpers/lib/errors.js:87:21)
    at Object.TransactionRevertedWithoutReasonError (/home/dev/repo/services/eth/peerpolls/polls-api/node_modules/web3-core-helpers/lib/errors.js:98:21)
    at /home/dev/repo/services/eth/peerpolls/polls-api/node_modules/web3-core-method/lib/index.js:394:57
    at runMicrotasks (<anonymous>)
    at processTicksAndRejections (internal/process/task_queues.js:93:5)
[
  Result {
    '0': '12',
    '1': '0xb2eeE134fA13Fa289412184693aD935a969E0B1b',
    '2': true,
    '3': '1612973133',
    '4': false,
    id: '12',
    addr: '0xb2eeE134fA13Fa289412184693aD935a969E0B1b',
    up: true,
    date: '1612973133',
    changed: false
  },
  Result {
    '0': '13',
    '1': '0x159D8ea11f57d12b6Ea0627CF399a95D0FBBb0aB',
    '2': true,
    '3': '1612973133',
    '4': false,
    id: '13',
    addr: '0x159D8ea11f57d12b6Ea0627CF399a95D0FBBb0aB',
    up: true,
    date: '1612973133',
    changed: false
  }
]

Error: invalid BigNumber string (argument="value", value="null", code=INVALID_ARGUMENT, version=bignumber/5.0.14)
    at Logger.makeError (/home/dev/repo/services/eth/peerpolls/polls-api/node_modules/@ethersproject/logger/lib/index.js:179:21)
    at Logger.throwError (/home/dev/repo/services/eth/peerpolls/polls-api/node_modules/@ethersproject/logger/lib/index.js:188:20)
    at Logger.throwArgumentError (/home/dev/repo/services/eth/peerpolls/polls-api/node_modules/@ethersproject/logger/lib/index.js:191:21)
    at Function.BigNumber.from (/home/dev/repo/services/eth/peerpolls/polls-api/node_modules/@ethersproject/bignumber/lib/bignumber.js:191:27)
    at NumberCoder.encode (/home/dev/repo/services/eth/peerpolls/polls-api/node_modules/@ethersproject/abi/lib/coders/number.js:30:39)
    at /home/dev/repo/services/eth/peerpolls/polls-api/node_modules/@ethersproject/abi/lib/coders/array.js:71:19
    at Array.forEach (<anonymous>)
    at Object.pack (/home/dev/repo/services/eth/peerpolls/polls-api/node_modules/@ethersproject/abi/lib/coders/array.js:57:12)
    at TupleCoder.encode (/home/dev/repo/services/eth/peerpolls/polls-api/node_modules/@ethersproject/abi/lib/coders/tuple.js:36:24)
    at AbiCoder.encode (/home/dev/repo/services/eth/peerpolls/polls-api/node_modules/@ethersproject/abi/lib/abi-coder.js:86:15)
    at ABICoder.encodeParameters (/home/dev/repo/services/eth/peerpolls/polls-api/node_modules/web3-eth-abi/lib/index.js:121:27)
    at /home/dev/repo/services/eth/peerpolls/polls-api/node_modules/web3-eth-contract/lib/index.js:439:20
    at Array.map (<anonymous>)
    at Object._encodeMethodABI (/home/dev/repo/services/eth/peerpolls/polls-api/node_modules/web3-eth-contract/lib/index.js:438:8)
    at Object._processExecuteArguments (/home/dev/repo/services/eth/peerpolls/polls-api/node_modules/web3-eth-contract/lib/index.js:701:39)
    at Object._executeMethod (/home/dev/repo/services/eth/peerpolls/polls-api/node_modules/web3-eth-contract/lib/index.js:720:68)
