let fs = require("fs")
let Web3 = require('web3') // https://www.npmjs.com/package/web3
let {config} = require('./config')

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

async function exec(addr, call) {
    let gas = await call.estimateGas({from: addr})
    
    console.log('sending', addr.substr(0,10),
        call._method.name, call.arguments, 'gas', gas)

    // wrap an unresolved promise
    let atx = call.send({from: addr, gas: gas})
    return [ atx ]
}

async function check(...atxs) {
    let results = []

    for(let atx of atxs) {
        let receipt = await atx[0]
        let extra = []
        for(let e in receipt.events) {
            let r = receipt.events[e].returnValues
            extra.push(...[e, r])
        }
        
        console.log(receipt.status ? `SUCCESS` : "FAILED.", `gas ${receipt.gasUsed}`, ...extra)
        results.push(receipt)
    }
    return results
}

// exec and check
async function execWait(addr, call) {
    let atx = await exec(addr, call)
    return check(atx)
}

function sect(name) {
    console.log(`\n### ${name}\n`)
}

async function test(abi, addr, contractAddr, addr2) {
  try { 
    sect('BEGIN')
    const contract = new web3.eth.Contract(abi, contractAddr)
    let gas, tx, c
    let up = false 

    // Event example, doesn't work with HTTP provider - JBG
    /*
    threadContract.events.VoteEvent((error, addr, up) => {
      console.log("EVENT")
      console.log(error, addr, up)
    })
    */
    
    console.log(`Balance addr1: ${await web3.eth.getBalance(addr)}`)
    console.log(`Balance addr2: ${await web3.eth.getBalance(addr2)}`)

// Test.sol
/*
    const set = contract.methods.set()
    let gas = await set.estimateGas({from: addr})
    console.log("set gas: " + gas)

    tx = await set.send({from: addr, gas: gas})
    console.log(tx.status ? "SUCCESS: Addr set." : "Tx FAILED.")

    c = await contract.methods.get().call({from: addr})
    console.log("addr: " + c)
*/

    sect('Add Post - JBG')
    let results = await execWait(addr, contract.methods.addPost(
        "The Netherlands government does not represent me.",
        "Elected officials require large donors and rather follow those interests, over my own."))
    const postIndex = results[0].events.NewPost.returnValues.id;

    sect('Get post count')
    c = await contract.methods.postCount().call({from: addr})
    console.log("# Posts: " + c)

    const post = await contract.methods.posts(postIndex).call({from: addr})
    console.log("Got post: " + post.id)

    sect('Vote for the Post - JBG')
    let addVote = contract.methods.addVote(postIndex, up)
    gas = await addVote.estimateGas({from: addr})
    console.log("addVote gas: " + gas)
    tx = await addVote.send({from: addr, gas: gas})
    console.log(tx.status ? `SUCCESS: Vote added, ${up}` : "Tx FAILED.")

    sect('Simulvote Post - DJB')
    let tx1 = await exec(addr, contract.methods.addVote(postIndex, up))
    let tx2 = await exec(addr2, contract.methods.addVote(postIndex, up))

    await check(tx1, tx2)

    sect('Change vote for the Post - JBG')
    up = true 
    addVote = contract.methods.addVote(postIndex, up)
    gas = await addVote.estimateGas({from: addr})
    console.log("addVote gas: " + gas)
    tx = await addVote.send({from: addr, gas: gas})
    console.log(tx.status ? `SUCCESS: Changed vote, ${up}` : "Tx FAILED.")

    sect('Add second conflicting vote for the Post - JBG')
    console.log("Add second conflicting vote for the Post...")
    up = false 
    addVote = contract.methods.addVote(postIndex, up)
    gas = await addVote.estimateGas({from: addr2})
    console.log("addVote gas: " + gas)
    tx = await addVote.send({from: addr2, gas: gas})
    console.log(tx.status ? `SUCCESS: Vote added, ${up}` : "Tx FAILED.")

    sect('Check vote count - JBG')
    let votes = await contract.methods.getPostVotes(postIndex).call({from: addr})
    console.log("# Votes: " + votes.length)

    sect('Check post consensus - JBG')
    console.log("Check post consensus...")
    const postConsensus = contract.methods.postConsensus(postIndex)
    gas = await postConsensus.estimateGas({from: addr})
    console.log(`postConsensus gas ${gas}`)
    let con = await contract.methods.postConsensus(postIndex).call({from: addr, gas: gas})
    console.log(`Consensus?: ${con}`)

    sect('Comment on Post - JBG')
    let comment = "Officials are selected via voting, so they do represent the ideas of the people."
    const addComment = contract.methods.addComment(postIndex, comment)
    gas = await addComment.estimateGas({from: addr})
    console.log("addComment gas: " + gas)
    tx = await addComment.send({from: addr, gas: gas})
    console.log(tx.status ? "SUCCESS: Comment added." : "Tx FAILED.")

    sect('Get total comment count')
    c = await contract.methods.commentCount().call({from: addr})
    console.log("# Comments: " + c)
   
    await check(
        await exec(addr, contract.methods.addComment(postIndex, 'c2')),
        await exec(addr, contract.methods.addComment(postIndex, 'c3')),
        await exec(addr, contract.methods.addComment(postIndex, 'c4')),
        await exec(addr, contract.methods.addComment(postIndex, 'c5')),
        await exec(addr, contract.methods.addComment(postIndex, 'c6')),
    )
    
    c = await contract.methods.commentCount().call({from: addr})
    console.log("# Comments: " + c)

    sect('Vote on Comment - JBG')
    let commentIndex = c - 1
    up = false 
    let addCommentVote = contract.methods.addCommentVote(commentIndex, up)
    gas = await addCommentVote.estimateGas({from: addr})
    console.log("addCommentVote gas: " + gas)
    tx = await addCommentVote.send({from: addr, gas: gas})
    console.log(tx.status ? `SUCCESS: Voted on comment, ${up}.` : "Tx FAILED.")
    
    sect('Simulvote - DJB')
    await check(
        await exec(addr, contract.methods.addCommentVote(commentIndex, up)),
        await exec(addr2, contract.methods.addCommentVote(commentIndex, up)),
    )

    sect('Change vote on Comment - JBG')
    up = true 
    addCommentVote = contract.methods.addCommentVote(commentIndex, up)
    gas = await addCommentVote.estimateGas({from: addr})
    console.log("addCommentVote gas: " + gas)
    tx = await addCommentVote.send({from: addr, gas: gas})
    console.log(tx.status ? `SUCCESS: Change vote on comment, ${up}.` : "Tx FAILED.")

    sect('Add second conflicting vote on Comment - JBG')
    up = false 
    addCommentVote = contract.methods.addCommentVote(commentIndex, up)
    gas = await addCommentVote.estimateGas({from: addr2})
    console.log("addCommentVote gas: " + gas)
    tx = await addCommentVote.send({from: addr2, gas: gas})
    console.log(tx.status ? `SUCCESS: Voted on comment, ${up}.` : "Tx FAILED.")

    sect('Check vote count - JBG')
    votes = await contract.methods.getCommentVotes(commentIndex).call({from: addr})
    console.log("# Votes: " + votes.length)

    sect('Check comment consensus - JBG')
    console.log("Check comment consensus...")
    const commentConsensus = contract.methods.commentConsensus(commentIndex)
    gas = await commentConsensus.estimateGas({from: addr})
    console.log(`commentConsensus gas ${gas}`)
    con = await contract.methods.commentConsensus(commentIndex).call({from: addr, gas: gas})
    console.log(`Consensus?: ${con}`)

    sect('Comment on comment - JBG')
    comment = "Campaigns, however, are financed by corporations."
    const addCommentComment = contract.methods.addCommentComment(commentIndex, comment)
    gas = await addCommentComment.estimateGas({from: addr})
    console.log("addCommentComment gas: " + gas)
    tx = await addCommentComment.send({from: addr, gas: gas})
    console.log(tx.status ? "SUCCESS: Commented on comment." : "Tx FAILED.")

    sect('Get total comment count - JBG')
    c = await contract.methods.commentCount().call({from: addr})
    console.log("# Comments: " + c)

    sect('Vote on Comment - JBG')
    commentIndex = c - 1
    up = false 
    addCommentVote = contract.methods.addCommentVote(commentIndex, up)
    gas = await addCommentVote.estimateGas({from: addr})
    console.log("addCommentVote gas: " + gas)
    tx = await addCommentVote.send({from: addr, gas: gas})
    console.log(tx.status ? `SUCCESS: Voted on comment, ${up}.` : "Tx FAILED.")

    sect('Add second consensus vote on Comment - JBG')
    up = false 
    addCommentVote = contract.methods.addCommentVote(commentIndex, up)
    gas = await addCommentVote.estimateGas({from: addr2})
    console.log("addCommentVote gas: " + gas)
    tx = await addCommentVote.send({from: addr2, gas: gas})
    console.log(tx.status ? `SUCCESS: Voted on comment, ${up}.` : "Tx FAILED.")

    sect('Get the threads - JBG')
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

async function createAccount(password) {
  const acct = await web3.eth.personal.newAccount(password)
  console.log('new user', acct)

  const coinbase = await web3.eth.getCoinbase()
  return web3.eth.sendTransaction({
    from: coinbase,
    to: acct,
    value: web3.utils.toWei("1.0", "ether")
  })
}

async function run() {
  // Read the compiled contract code
  // Compile with
  // solc SampleContract.sol --combined-json abi,asm,ast,bin,bin-runtime,clone-bin,devdoc,interface,opcodes,srcmap,srcmap-runtime,userdoc > contracts.json
  const source = fs.readFileSync("consensus.json")
  const contracts = JSON.parse(source)["contracts"]

  // ABI description as JSON structure
  const abi = contracts["consensus.sol:Posts"].abi

  // Smart contract EVM bytecode as hex
  const code = '0x' + contracts["consensus.sol:Posts"].bin 

    console.log('argv', process.argv)
  if(process.argv.length < 3) {
    console.log("Usage: ")
    console.log("\tnode index.js 0xCOINBASE_ACCOUNT")
    console.log("\tnode index.js 0xCOINBASE_ACCOUNT password")
    console.log("\tnode index.js 0xCOINBASE_ACCOUNT password test 0xTEST_ACCOUNT password")
    console.log("\tnode index.js 0xCOINBASE_ACCOUNT password adduser password")
  } else if(process.argv.length === 3) {
    console.log('posts')
    posts(abi, process.argv[2])
  } else if(process.argv.length === 4) {
    console.log('deploy', `from = ${process.argv[2]}`, `pass = ${process.argv[3]}`)
    await unlock(process.argv[2], process.argv[3])
    const contractAddr = await deploy(abi, code, process.argv[2])
    console.log(contractAddr)
  } else if(process.argv[4] === 'adduser') {
    console.log('adduser', process.argv[5])
    await createAccount(process.argv[3])
  } else if(process.argv[4] === 'test') {
    console.log("Testing...")
    await unlock(process.argv[2], process.argv[3])
    await unlock(process.argv[5], process.argv[6], 15000)
    test(abi, process.argv[2], config.contract, process.argv[5])
    //posts(abi, process.argv[2], process.argv[4])
  } else {
      console.log('error')
  }
}

run()
