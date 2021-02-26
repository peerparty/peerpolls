// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//pragma experimental ABIEncoderV2;

contract Posts {

  //event VoteEvent(address indexed from, bool value);

  event NewPost(uint id);
  event NewComment(uint id);

  struct Vote {
    uint id;
    address addr;
    bool up;
    uint date;
    bool changed;
  }

  struct Comment {
    uint id;
    address addr;
    string comment;
    uint date; 
    mapping(address => uint) votesByUser;
  }

  struct Post {
    uint id;
    address addr;
    string title;
    string description;
    uint date;
    mapping(address => uint) votesByUser;
  }
  
  Post[] public posts;
  Vote[] public votes;
  Comment[] public comments;

  mapping (uint => uint[]) public postVotes;  
  mapping (uint => uint[]) public postComments;  
  mapping (uint => uint[]) public commentVotes;  
  mapping (uint => uint[]) public commentComments;

  function addPost(string memory title, string memory description) public {
    Post storage post = posts.push();
    
    post.id = posts.length - 1;
    post.addr = msg.sender;
    post.title = title;
    post.description = description;
    post.date = block.timestamp;

    emit NewPost(post.id);
  }

  function postCount() public view returns (uint) {
    return posts.length;
  }

  function voteCount() public view returns (uint) {
    return votes.length;
  }

  function commentCount() public view returns (uint) {
    return comments.length;
  }

  function getPostVotes(uint postIndex) public view returns (uint[] memory) {
    return postVotes[postIndex];
  }

  function getPostComments(uint postIndex) public view returns (uint[] memory) {
    return postComments[postIndex];
  }

  function getCommentVotes(uint commentIndex) public view returns (uint[] memory) {
    return commentVotes[commentIndex];
  }

  function getCommentComments(uint commentIndex) public view returns (uint[] memory) {
    return commentComments[commentIndex];
  }

  //Experimental feature, returning arrays like this... - JBG
  /* 
  function getVotes() public view returns (Vote[] memory) {
    return votes;
  }
  */

  function addVote(uint postIndex, bool up) public  {
    
    // Mark the old vote as changed (meaning obsolete)
    uint oldVote = posts[postIndex].votesByUser[msg.sender];
    if(oldVote != 0) {
        votes[oldVote].changed = true;
    }

    // record vote for this post
    posts[postIndex].votesByUser[msg.sender] = votes.length;
    postVotes[postIndex].push(votes.length);

    // save vote
    votes.push(Vote({
      id: votes.length,
      addr: msg.sender,
      up: up,
      date: block.timestamp,
      changed: false 
    }));
  }

  function postConsensus(uint postIndex) public view returns (bool) {

    bool consensus = true;

    /* Find the first unchanged vote - JBG */
    uint first = 0;
    while(votes[postVotes[postIndex][first]].changed) ++first;
    bool up = votes[postVotes[postIndex][first]].up;

    /* Check the reminding votes - JBG */
    for(uint i = first + 1; consensus && i < postVotes[postIndex].length; i++) {
      uint voteId = postVotes[postIndex][i];
      if(!votes[voteId].changed)
        consensus = up == votes[voteId].up;
    }

    return consensus;

  }

  function addComment(uint postIndex, string memory body) public {
    //require(!postConsensus(postIndex) && postVotes[postIndex].length > 1);
    
    Comment storage comment = comments.push();
    
    comment.id = comments.length - 1;
    comment.addr = msg.sender;
    comment.date = block.timestamp;
    comment.comment = body;

    postComments[postIndex].push(comment.id);
    emit NewComment(comment.id);
  }

  function addCommentVote(uint commentIndex, bool up) public {
    
    // Mark the old vote as changed (meaning obsolete)
    uint oldVote = comments[commentIndex].votesByUser[msg.sender];
    if(oldVote != 0) {
        votes[oldVote].changed = true;
    }

    // record vote for this post
    comments[commentIndex].votesByUser[msg.sender] = votes.length;
    commentVotes[commentIndex].push(votes.length);

    // save vote
    votes.push(Vote({
      id: votes.length,
      addr: msg.sender,
      up: up,
      date: block.timestamp,
      changed: false 
    }));
 }

  function commentConsensus(uint commentIndex) public view returns (bool) {

    bool consensus = true;

    /* Find the first unchanged vote - JBG */
    uint first = 0;
    while(votes[commentVotes[commentIndex][first]].changed) ++first;
    bool up = votes[commentVotes[commentIndex][first]].up;

    /* Check the reminding votes - JBG */
    for(uint i = first + 1; consensus && i < commentVotes[commentIndex].length; i++) {
      uint voteId = commentVotes[commentIndex][i];
      if(!votes[voteId].changed)
        consensus = up == votes[voteId].up;
    }

    return consensus;

  }

  function addCommentComment(uint commentIndex, string memory body) public {
    //require(!commentConsensus(commentIndex));
    
    Comment storage comment = comments.push();
    
    comment.id = comments.length - 1;
    comment.addr = msg.sender;
    comment.date = block.timestamp;
    comment.comment = body;

    commentComments[commentIndex].push(comment.id);
    emit NewComment(comment.id);
  }

}

