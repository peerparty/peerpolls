// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//pragma experimental ABIEncoderV2;

contract Posts {

  //event VoteEvent(address indexed from, bool value);

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
  }

  struct Post {
    uint id;
    address addr;
    string title;
    string description;
    uint date;
  }
  
  Post[] public posts;
  Vote[] public votes;
  Comment[] public comments;

  mapping (uint => uint[]) public postVotes;  
  mapping (uint => uint[]) public postComments;  
  mapping (uint => uint[]) public commentVotes;  
  mapping (uint => uint[]) public commentComments;

  function addPost(string memory title, string memory description) public {
    posts.push(Post({
      id: posts.length,
      addr: msg.sender,
      title: title,
      description: description,
      date: block.timestamp 
    }));
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

    /* Change vote if already voted - JBG */
    for(uint i = 0; i < postVotes[postIndex].length; i++) {
      uint voteId = postVotes[postIndex][i];
      if(votes[voteId].addr == msg.sender) {
        votes[voteId].changed = true;
      }
    }

    /* Otherwise create new vote - JBG */
    postVotes[postIndex].push(votes.length);
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

  function addComment(uint postIndex, string memory comment) public {
    //require(!postConsensus(postIndex) && postVotes[postIndex].length > 1);
    postComments[postIndex].push(comments.length);
    comments.push(Comment({
      id: comments.length,
      addr: msg.sender,
      comment: comment,
      date: block.timestamp 
    }));
  }

  function addCommentVote(uint commentIndex, bool up) public {

    /* Change vote if already voted - JBG */
    for(uint i = 0; i < commentVotes[commentIndex].length; i++) {
      uint voteId = commentVotes[commentIndex][i];
      if(votes[voteId].addr == msg.sender) {
        votes[voteId].changed = true;
      }
    }

    /* Otherwise create new vote - JBG */
    commentVotes[commentIndex].push(votes.length);
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

  function addCommentComment(uint commentIndex, string memory comment) public {
    //require(!commentConsensus(commentIndex));
    commentComments[commentIndex].push(comments.length);
    comments.push(Comment({
      id: comments.length,
      addr: msg.sender,
      comment: comment,
      date: block.timestamp 
    }));
  }

}

