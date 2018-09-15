FROM ubuntu:latest
MAINTAINER datafatmunger <info@peerparty.org>

RUN apt-get update; \
  apt-get --yes install build-essential software-properties-common git curl nginx; \
  add-apt-repository -y ppa:ethereum/ethereum; \
  apt-get update; \
  apt-get --yes install ethereum solc; \
  curl -sL https://deb.nodesource.com/setup_8.x | bash -; \
  apt-get install -y nodejs

ADD gethpass /root
ADD genesis.json /root
ADD run.sh /root
ADD posts.sol /root
ADD index.js /root
ADD creds.js /root
ADD address.js /root
ADD nginx.default /etc/nginx/sites-available/default

WORKDIR /root

# Compile contract - JBG
RUN solc posts.sol --combined-json abi,bin > posts.json

# Setup API - JBG
RUN git clone https://github.com/peerparty/polls-api.git
WORKDIR /root/polls-api
RUN npm install

WORKDIR /root

# Create geth account and update necessary files, deploy the contract - JBG
RUN export HASH=$(geth --password /root/gethpass account new | awk -vRS='}' -vFS='{' '{print $2}'); \ 
  sed -i -e "s/<COINBASE_HASH>/$HASH/g" /root/genesis.json; \
  sed -i -e "s/<COINBASE_HASH>/$HASH/g" /root/run.sh; \
  sed -i -e "s/<COINBASE_HASH>/$HASH/g" /root/creds.js; \
  sed -i -e "s/<GETH_PASS>/`cat gethpass`/g" /root/creds.js; \
  geth init /root/genesis.json; \
  geth --unlock $HASH --password /root/gethpass --mine --rpc --rpcapi "eth,net,web3,admin,personal" &>> /root/geth.log & \
  npm install web3; \
  export ADDR=$(node index.js 0x$HASH `cat gethpass`); \
  sed -i -e "s/<CONTRACT_ADDR>/$ADDR/g" /root/address.js

RUN chmod +x /root/run.sh

CMD /root/run.sh

