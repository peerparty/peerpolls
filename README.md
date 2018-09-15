# Peerpolls

Political polling billboard with voting and comment system built on a private Ethereum blockchain.

## Create Docker image

`$ docker build -t peerpolls .`

## Create Docker container

`$ docker run -it --name peerpolls -p 8545:8545 -p 80:80 peerpolls`

TODO: This hangs at the end, Ctrl-C will stop it and the container is still created.

## Connect to container

`$ docker exec -it peerpolls bash`



