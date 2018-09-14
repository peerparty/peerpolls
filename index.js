let fs = require("fs")
let Web3 = require('web3') // https://www.npmjs.com/package/web3

// Create a web3 connection to a running geth node over JSON-RPC running at
// http://localhost:8545
// For geth VPS server + SSH tunneling see
// https://gist.github.com/miohtama/ce612b35415e74268ff243af645048f4
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

// geth --rpcapi "db,eth,net,web3,personal" --ws --wsaddr "localhost" --wsport "8545" --wsorigins "*" --identity "MyTestNode" --datadir "./data" --testnet --fast
//const web3 = new Web3(new Web3.providers.WebsocketProvider('http://127.0.0.1:8545'));

// Unlock the coinbase account to make transactions out of it
function unlock(addr, password) {
  console.log("Unlocking coinbase account");
  try {
    web3.eth.personal.unlockAccount(addr, password)
  } catch(e) {
    console.log(e)
    return
  }
}

async function deploy(abi, code, addr) {
  try {
    const contract = new web3.eth.Contract(abi, null, { data: code })
    const contractDeploy = contract.deploy()
    const gasPrice = await web3.eth.getGasPrice()
    const gas = await contractDeploy.estimateGas()
    const instance = await contractDeploy.send({
      from: addr,
      gasPrice: gasPrice, 
      gas: gas
    })
    return instance.options.address
  } catch(e) {
    console.error(e)
  }
}

async function test(abi, addr, contractAddr) {
  try { 

    const contract = new web3.eth.Contract(abi, contractAddr)

    // Event example, doesn't work with HTTP provider - JBG
    /*
    threadContract.events.VoteEvent((error, addr, up) => {
      console.log("EVENT")
      console.log(error, addr, up)
    })
    */

    // Add Post - JBG    
    const addPost = contract.methods.addPost("foo", "bar")
    let gas = await addPost.estimateGas()
    console.log("addPost gas: " + gas)
    
    let tx = await addPost.send({from: addr, gas: gas})
    console.log(tx.status ? "SUCCESS: Post added." : "Tx FAILED.")

    let c = await contract.methods.postCount().call()
    console.log("# Posts: " + c)

    // Get the Post - JBG
    const postIndex = c - 1;
    const post = await contract.methods.posts(postIndex).call()
    console.log("Got post: " + post.id)

    // Vote for the Post - JBG
    let up = Math.random() >= 0.5
    const addVote = contract.methods.addVote(postIndex, up)
    gas = await addVote.estimateGas()
    console.log("addVote gas: " + gas)
    tx = await addVote.send({from: addr, gas: gas})
    console.log(tx.status ? "SUCCESS: Vote added." : "Tx FAILED.")

    // Comment on Post - JBG
    const comment = "baz"
    const addComment = contract.methods.addComment(postIndex, comment)
    gas = await addComment.estimateGas()
    console.log("addComment gas: " + gas)
    tx = await addComment.send({from: addr, gas: gas})
    console.log(tx.status ? "SUCCESS: Comment added." : "Tx FAILED.")

    // Get total comment count - JBG
    c = await contract.methods.commentCount().call()
    console.log("# Comments: " + c)

    // Vote on Comment - JBG
    const commentIndex = c - 1
    up = Math.random() >= 0.5
    const addCommentVote = contract.methods.addCommentVote(commentIndex, up)
    gas = await addCommentVote.estimateGas()
    console.log("addCommentVote gas: " + gas)
    tx = await addCommentVote.send({from: addr, gas: gas})
    console.log(tx.status ? "SUCCESS: Voted on comment." : "Tx FAILED.")

    // Comment on comment - JBG
    const addCommentComment = contract.methods.addCommentComment(commentIndex, comment)
    gas = await addCommentComment.estimateGas()
    console.log("addCommentComment gas: " + gas)
    tx = await addCommentComment.send({from: addr, gas: gas})
    console.log(tx.status ? "SUCCESS: Commented on comment." : "Tx FAILED.")


    // Get the threads - JBG
    posts(abi, addr, contractAddr)
   
    /*
    const title = await threadContract.methods.title().call()
    console.log(title)

    const gas = await threadContract.methods.addVote(true).estimateGas()
    console.log("addVote gas: " + gas)
    const tx = await threadContract.methods.addVote(Math.random() >= 0.5)
      .send({from: addr, gas: gas})
    console.log(tx.status ? "SUCCESS: Vote added." : "Tx FAILED.")

    const c = await threadContract.methods.voteCount().call()
    console.log(c)

    const vote = await threadContract.methods.votes(0).call()
    console.log(vote)
    */

  } catch(e) {
    console.error(e)
  }
}

async function comments(contract, tabs, commentIndex) {
  const comment = await contract.methods.comments(commentIndex).call()
  console.log(tabs + comment.id + " " + comment.comment)

  const commentVotes = await contract.methods.getCommentVotes(commentIndex).call()
  for(let k = 0; k < commentVotes.length; k++) {
    const voteIndex = commentVotes[k]
    const vote = await contract.methods.votes(voteIndex).call()
    console.log(tabs + vote.id + " " + vote.up)
  }

  const commentComments = await contract.methods.getCommentComments(commentIndex)
    .call()
  for(let k = 0; k < commentComments.length; k++) {
    const commentIndex = commentComments[k]
    await comments(contract, tabs + "\t", commentComments[k])
  }
}

async function posts(abi, addr, contractAddr) {
  try {
    const contract = new web3.eth.Contract(abi, contractAddr)

    let postCount = await contract.methods.postCount().call()
    for(let i = 0; i < postCount; i++) {
      const post = await contract.methods.posts(i).call()
      console.log(post.id + " " + post.title + " - " + post.description)

      const postVotes = await contract.methods.getPostVotes(i).call()
      for(let j = 0; j < postVotes.length; j++) {
        const voteIndex = postVotes[j]
        const vote = await contract.methods.votes(voteIndex).call()
        console.log(vote.id + " " + vote.up)
      }

      const postComments = await contract.methods.getPostComments(i).call()
      for(let j = 0; j < postComments.length; j++) {
        await comments(contract, "\t", postComments[j])
      }
    }
  } catch(e) {
    console.error(e)
  }
}

async function run() {
  // Read the compiled contract code
  // Compile with
  // solc SampleContract.sol --combined-json abi,asm,ast,bin,bin-runtime,clone-bin,devdoc,interface,opcodes,srcmap,srcmap-runtime,userdoc > contracts.json
  const source = fs.readFileSync("posts.json")
  const contracts = JSON.parse(source)["contracts"]

  // ABI description as JSON structure
  const abi = JSON.parse(contracts["posts.sol:Posts"].abi)

  // Smart contract EVM bytecode as hex
  const code = '0x' + contracts["posts.sol:Posts"].bin 

  if(process.argv.length < 4) {
    console.log("Usage: ")
    console.log("\tnode index.js 0xACCOUNT password 0xCONTRACT")
    console.log("\tnode index.js 0xACCOUNT password")
  } else if(process.argv.length > 4) {
    unlock(process.argv[2], process.argv[3])
    console.log("Testing...")
    //test(abi, process.argv[2], process.argv[4])
    posts(abi, process.argv[2], process.argv[4])
  } else {
    unlock(process.argv[2], process.argv[3])
    console.log("Deploying...")
    const contractAddr = await deploy(abi, code, process.argv[2])
    console.log(contractAddr)
    console.log("Testing...")
    test(abi, process.argv[2], contractAddr)
  }
}

run()

