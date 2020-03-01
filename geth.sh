#!/bin/bash

geth --unlock "0x68201F7fB69492652b95ac9d0E60f2C9e8071276" --password /root/gethpass --mine --rpc --rpcapi "eth,net,web3,admin,personal" --allow-insecure-unlock --nousb --rpcaddr "0.0.0.0" console
