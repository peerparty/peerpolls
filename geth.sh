#!/bin/bash

#geth --unlock "0xd57aCA26d533AA564c39348BF5E5c106C2155F49" --password /root/gethpass --mine --rpc --rpcapi "eth,net,web3,admin,personal" --allow-insecure-unlock --nousb --rpcaddr "0.0.0.0" console

geth --unlock "0xd57aCA26d533AA564c39348BF5E5c106C2155F49" --password /root/gethpass --mine --http --http.api "eth,net,web3,admin,personal" --allow-insecure-unlock --nousb --verbosity 3 --debug --nodiscover --maxpeers 0 --networkid 1337 console

