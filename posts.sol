pragma solidity ^0.4.24;
//pragma experimental ABIEncoderV2;

contract owned {
  address public owner;

  constructor() public {
    owner = msg.sender;
  }

  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  function transferOwnership(address newOwner) onlyOwner public {
    owner = newOwner;
  }
}

contract Posts is owned {

  //event VoteEvent(address indexed from, bool value);

  struct Vote {
    uint id;
    address addr;
    bool up;
    uint date;
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

  function addPost(string title, string description) public {
    posts.push(Post({
      id: posts.length,
      addr: msg.sender,
      title: title,
      description: description,
      date: now
    }));
  }

  function postCount() public view returns (uint) {
    return posts.length;
  }

  function voteCount() public view returns (uint) {
    return votes.length;
  }

  function commentCount() public view returns (uint) {
    return votes.length;
  }

  function getPostVotes(uint postIndex) public view returns (uint[]) {
    return postVotes[postIndex];
  }

  function getPostComments(uint postIndex) public view returns (uint[]) {
    return postComments[postIndex];
  }

  function getCommentVotes(uint commentIndex) public view returns (uint[]) {
    return commentVotes[commentIndex];
  }

  function getCommentComments(uint commentIndex) public view returns (uint[]) {
    return commentComments[commentIndex];
  }

  //Experimental feature, returning arrays like this... - JBG
  /* 
  function getVotes() public view returns (Vote[]) {
    return votes;
  }
  */

  function addVote(uint postIndex, bool up) public {
    // TODO : require post exists - JBG
    // TODO : Vote once - JBG
    postVotes[postIndex].push(votes.length);
    votes.push(Vote({
      id: votes.length,
      addr: msg.sender,
      up: up,
      date: now
    }));
  }

  function addComment(uint postIndex, string comment) public {
    postComments[postIndex].push(comments.length);
    comments.push(Comment({
      id: comments.length,
      addr: msg.sender,
      comment: comment,
      date: now
    }));
  }

  function addCommentVote(uint commentIndex, bool up) public {
    commentVotes[commentIndex].push(votes.length);
    votes.push(Vote({
      id: votes.length,
      addr: msg.sender,
      up: up,
      date: now
    }));
  }

  function addCommentComment(uint commentIndex, string comment) public {
    commentComments[commentIndex].push(comments.length);
    comments.push(Comment({
      id: comments.length,
      addr: msg.sender,
      comment: comment,
      date: now
    }));
  }

}

