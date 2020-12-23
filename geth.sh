#!/bin/bash

#geth --unlock "0x01aaafd0762F7233399ded6C49b06bbCa8Fc4A0E" --password /root/gethpass --mine --rpc --rpcapi "eth,net,web3,admin,personal" --allow-insecure-unlock --nousb --rpcaddr "0.0.0.0"  --verbosity 5 console
#geth --unlock "0x01aaafd0762F7233399ded6C49b06bbCa8Fc4A0E" --password /root/gethpass --mine --rpc --rpcapi "eth,net,web3,admin,personal" --allow-insecure-unlock --nousb --rpcaddr "0.0.0.0" console

../go-ethereum/build/bin/geth --unlock "0x01aaafd0762F7233399ded6C49b06bbCa8Fc4A0E" --password /root/gethpass --mine --http --http.api "eth,net,web3,admin,personal" --allow-insecure-unlock --nousb --verbosity 3 --debug --nodiscover --maxpeers 0 --networkid 1337 console
