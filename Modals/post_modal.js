const mongoose = require("mongoose"); // importing mongoose

// creating a schema for the tweet
const tweet_Schema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, "tweet is a required field"],
    trim: true,
  },
  image: {
    type: String,
  },
  createdOn: {
    type: String,
    default: new Date().toLocaleDateString(),
  },
  author: {
    type: mongoose.Schema.Types.ObjectId, // creating the author field as a reference to the userCollection
    ref: "userCollection",
  },
  comment: [
    // making the comment field as a array of objects having two properties commentText and commentedBy
    {
      commentText: {
        type: String,
      },
      commentedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userCollection",
      },
      createdOn: {
        type: String,
        default: `${new Date().toLocaleDateString()}, ${new Date().toTimeString()}`,
      },
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userCollection",
    },
  ],

  retweet: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userCollection",
    },
  ],
});

// making a tweet modal based on the above schema

const TweetModal = mongoose.model("tweetCollection", tweet_Schema);

module.exports = TweetModal;
