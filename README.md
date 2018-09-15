# Peerpolls

Political polling billboard with voting and comment system built on a private Ethereum blockchain.

## Docker stuff

### Create Docker image

`$ docker build -t peerpolls .`

### Create Docker container

`$ docker run -it --name peerpolls -p 8545:8545 -p 80:80 peerpolls`

TODO: This hangs at the end, Ctrl-C will stop it and the container is still created.

### Start container

`$ docker start peerpolls`

### Connect to container

`$ docker exec -it peerpolls bash`

## API stuff

### Login

`$ curl --cookie-jar cookies.txt -d "name=admin&pwd=password" "http://localhost/api/login"`

### Create a post/poll

`$ curl --cookie cookies.txt -d "title=foobar&description=baz" "http://localhost/api/posts"`

### Up vote a post/poll

`$ curl --cookie cookies.txt -d "up=true" "http://localhost/api/posts/1/votes"`

### Comment on a post/poll

`$ curl --cookie cookies.txt -d "comment=foo" "http://localhost/api/posts/1/comments"`

### Down vote a comment

`$ curl --cookie cookies.txt -d "up=false" "http://localhost/api/comments/1/votes"`

### Comment on a comment

`$ curl --cookie cookies.txt -d "comment=bar" "http://localhost/api/comments/1/comments"`


