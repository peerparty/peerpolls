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

RUN chmod +x /root/run.sh

WORKDIR /root

# Compile contract - JBG
RUN solc posts.sol --combined-json abi,bin > posts.json

# Create geth account and update necessary files, deploy the contract - JBG
RUN export HASH=$(geth --password /root/gethpass account new | awk -vRS='}' -vFS='{' '{print $2}'); \ 
  sed -i -e "s/<COINBASE_HASH>/$HASH/g" /root/genesis.json; \
  sed -i -e "s/<COINBASE_HASH>/$HASH/g" /root/run.sh; \
  geth init /root/genesis.json

CMD /root/run.sh

