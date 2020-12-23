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
async function unlock(addr, password) {
  console.log("Unlocking coinbase account", addr, password);
  try {
    await web3.eth.personal.unlockAccount(addr, password)
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

async function test(abi, addr, contractAddr, addr2) {
  try { 

    const contract = new web3.eth.Contract(abi, contractAddr)

    // Event example, doesn't work with HTTP provider - JBG
    /*
    threadContract.events.VoteEvent((error, addr, up) => {
      console.log("EVENT")
      console.log(error, addr, up)
    })
    */

    const balanceAddr2 = await web3.eth.getBalance(addr2)
    console.log(`Balance addr2: ${balanceAddr2}`)

// Test.sol
/*
    const set = contract.methods.set()
    let gas = await set.estimateGas({from: addr})
    console.log("set gas: " + gas)

    let tx = await set.send({from: addr, gas: gas})
    console.log(tx.status ? "SUCCESS: Addr set." : "Tx FAILED.")

    let c = await contract.methods.get().call({from: addr})
    console.log("addr: " + c)
*/

    // Add Post - JBG    
    const addPost = contract.methods.addPost("The Netherlands government does not represent me.", "Elected officials require large donors and rather follow those interests, over my own.")
    let gas = await addPost.estimateGas({from: addr})
    console.log("addPost gas: " + gas)

    let tx = await addPost.send({from: addr, gas: gas})
    console.log(tx.status ? "SUCCESS: Post added." : "Tx FAILED.")

    let c = await contract.methods.postCount().call({from: addr})
    console.log("# Posts: " + c)

    // Get the Post - JBG
    const postIndex = c - 1;
    const post = await contract.methods.posts(postIndex).call({from: addr})
    console.log("Got post: " + post.id)

    // Vote for the Post - JBG
    let up = false 
    let addVote = contract.methods.addVote(postIndex, up)
    gas = await addVote.estimateGas({from: addr})
    console.log("addVote gas: " + gas)
    tx = await addVote.send({from: addr, gas: gas})
    console.log(tx.status ? `SUCCESS: Vote added, ${up}` : "Tx FAILED.")

    // Chage vote for the Post - JBG
    up = true 
    addVote = contract.methods.addVote(postIndex, up)
    gas = await addVote.estimateGas({from: addr})
    console.log("addVote gas: " + gas)
    tx = await addVote.send({from: addr, gas: gas})
    console.log(tx.status ? `SUCCESS: Changed vote, ${up}` : "Tx FAILED.")

    // Add second conflicting vote for the Post - JBG
    console.log("Add second conflicting vote for the Post...")
    up = false 
    addVote = contract.methods.addVote(postIndex, up)
    gas = await addVote.estimateGas({from: addr2})
    console.log("addVote gas: " + gas)
    tx = await addVote.send({from: addr2, gas: gas})
    console.log(tx.status ? `SUCCESS: Vote added, ${up}` : "Tx FAILED.")

    // Check vote count - JBG
    let votes = await contract.methods.getPostVotes(postIndex).call({from: addr})
    console.log("# Votes: " + votes.length)

    // Check post consensus - JBG
    console.log("Check post consensus...")
    const postConsensus = contract.methods.postConsensus(postIndex)
    gas = await postConsensus.estimateGas({from: addr})
    console.log(`postConsensus gas ${gas}`)
    let con = await contract.methods.postConsensus(postIndex).call({from: addr, gas: gas})
    console.log(`Consensus?: ${con}`)

    // Comment on Post - JBG
    let comment = "Officials are selected via voting, so they do represent the ideas of the people."
    const addComment = contract.methods.addComment(postIndex, comment)
    gas = await addComment.estimateGas({from: addr})
    console.log("addComment gas: " + gas)
    tx = await addComment.send({from: addr, gas: gas})
    console.log(tx.status ? "SUCCESS: Comment added." : "Tx FAILED.")

    // Get total comment count - JBG
    c = await contract.methods.commentCount().call({from: addr})
    console.log("# Comments: " + c)

    // Vote on Comment - JBG
    let commentIndex = c - 1
    up = false 
    let addCommentVote = contract.methods.addCommentVote(commentIndex, up)
    gas = await addCommentVote.estimateGas({from: addr})
    console.log("addCommentVote gas: " + gas)
    tx = await addCommentVote.send({from: addr, gas: gas})
    console.log(tx.status ? `SUCCESS: Voted on comment, ${up}.` : "Tx FAILED.")

    // Change vote on Comment - JBG
    up = true 
    addCommentVote = contract.methods.addCommentVote(commentIndex, up)
    gas = await addCommentVote.estimateGas({from: addr})
    console.log("addCommentVote gas: " + gas)
    tx = await addCommentVote.send({from: addr, gas: gas})
    console.log(tx.status ? `SUCCESS: Change vote on comment, ${up}.` : "Tx FAILED.")

    // Add second conflicting vote on Comment - JBG
    up = false 
    addCommentVote = contract.methods.addCommentVote(commentIndex, up)
    gas = await addCommentVote.estimateGas({from: addr2})
    console.log("addCommentVote gas: " + gas)
    tx = await addCommentVote.send({from: addr2, gas: gas})
    console.log(tx.status ? `SUCCESS: Voted on comment, ${up}.` : "Tx FAILED.")

    // Check vote count - JBG
    votes = await contract.methods.getCommentVotes(commentIndex).call({from: addr})
    console.log("# Votes: " + votes.length)

    // Check comment consensus - JBG
    console.log("Check comment consensus...")
    const commentConsensus = contract.methods.commentConsensus(commentIndex)
    gas = await commentConsensus.estimateGas({from: addr})
    console.log(`commentConsensus gas ${gas}`)
    con = await contract.methods.commentConsensus(commentIndex).call({from: addr, gas: gas})
    console.log(`Consensus?: ${con}`)

    // Comment on comment - JBG
    comment = "Campaigns, however, are financed by corporations."
    const addCommentComment = contract.methods.addCommentComment(commentIndex, comment)
    gas = await addCommentComment.estimateGas({from: addr})
    console.log("addCommentComment gas: " + gas)
    tx = await addCommentComment.send({from: addr, gas: gas})
    console.log(tx.status ? "SUCCESS: Commented on comment." : "Tx FAILED.")

    // Get total comment count - JBG
    c = await contract.methods.commentCount().call({from: addr})
    console.log("# Comments: " + c)

    // Vote on Comment - JBG
    commentIndex = c - 1
    up = false 
    addCommentVote = contract.methods.addCommentVote(commentIndex, up)
    gas = await addCommentVote.estimateGas({from: addr})
    console.log("addCommentVote gas: " + gas)
    tx = await addCommentVote.send({from: addr, gas: gas})
    console.log(tx.status ? `SUCCESS: Voted on comment, ${up}.` : "Tx FAILED.")

    // Add second consensus vote on Comment - JBG
    up = false 
    addCommentVote = contract.methods.addCommentVote(commentIndex, up)
    gas = await addCommentVote.estimateGas({from: addr2})
    console.log("addCommentVote gas: " + gas)
    tx = await addCommentVote.send({from: addr2, gas: gas})
    console.log(tx.status ? `SUCCESS: Voted on comment, ${up}.` : "Tx FAILED.")

    // Get the threads - JBG
    posts(abi, contractAddr)

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

async function posts(abi, contractAddr) {
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
  const source = fs.readFileSync("consensus.json")
  const contracts = JSON.parse(source)["contracts"]

  // ABI description as JSON structure
  const abi = JSON.parse(contracts["consensus.sol:Posts"].abi)

  // Smart contract EVM bytecode as hex
  const code = '0x' + contracts["consensus.sol:Posts"].bin 

  if(process.argv.length < 3) {
    console.log("Usage: ")
    console.log("\tnode index.js 0xCOINBASE_ACCOUNT password 0xCONTRACT 0xTEST_ACCOUNT password")
    console.log("\tnode index.js 0xCOINBASE_ACCOUNT password")
  } else if(process.argv.length === 3) {
    posts(abi, process.argv[2])
  } else if(process.argv.length > 4) {

    //await unlock(process.argv[2], process.argv[3])
    //await unlock(process.argv[5], process.argv[6], 15000)

    console.log("Testing...")
    await unlock(process.argv[2], process.argv[3])
    await unlock(process.argv[5], process.argv[6], 15000)
    test(abi, process.argv[2], process.argv[4], process.argv[5])
    //posts(abi, process.argv[2], process.argv[4])
  } else {
    //await unlock(process.argv[2], process.argv[3])
    const contractAddr = await deploy(abi, code, process.argv[2])
    console.log(contractAddr)
    //console.log("Testing...")
    //test(abi, process.argv[2], contractAddr)
  }
}

run()

