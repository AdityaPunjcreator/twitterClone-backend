const TweetModal = require("../Modals/post_modal"); // importing the tweetModal which we created in the post_modal.js file
const { response } = require("../app");

// creating a new tweet
const addTweet = async (request, response) => {
  try {
    const { description, image } = request.body; // destructuring description and image from the requestbody
    // checking if description is present in the body or not
    if (!description || !image) {
      return response.status(400).json({ error: "missing fields" });
    }
    // now we will get the author from the request object where we had the logged in user (appended in the protected route)
    const author = request.user;

    const tweetdata = await TweetModal.create({
      description,
      image,
      author,
    }); // creating a new tweet
    return response
      .status(201)
      .json({ message: "successfully created", tweetdata });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

// creating a route handler middleware function to get all the tweets

const getAllTweets = async (request, response) => {
  try {
    // fetching all the tweets also populating the author, comments
    const allTweets = await TweetModal.find()
      .populate("author", "fullname _id email image")
      .populate("comment.commentedBy", "fullname");
    if (allTweets) {
      return response.status(200).json({
        message: "fetched all tweets",
        tweetcount: allTweets.length,
        allTweets,
      });
    }
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

// now we will create a route handler middleware function for getting all the tweets of a logged in user

const getMyTweets = async (request, response) => {
  try {
    const { _id } = request.user; // destructuring the _id from the request user
    const myTweets = await TweetModal.find({ author: _id })
      .populate("author", "fullname email image followers following")
      .populate("comment.commentedBy", "fullname email image"); // querying the  collection to find the author which matches the _id

    if (myTweets) {
      return response.status(200).json({
        message: "tweets fetched successfully",
        tweetCount: myTweets.length,
        myTweets,
      });
    }
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

// creating a route handler middleware function for deleting a tweet of the user

const deletetweet = async (request, response) => {
  try {
    const { tweetId } = request.params; // destructuring the tweetId, from the request.params object
    // now we will check whether the tweet with that Id  exists or not
    const tweetExist = await TweetModal.findById(tweetId); // finding document with the objectId
    if (!tweetExist) {
      return response.status(400).json({ error: "tweet not found" });
    }
    // we need to check if the logged in user owns that tweet

    const { _id: userId } = request.user; // extracting the id as userId from the logged in user
    const authorId = tweetExist.author._id; // extracting the authorId from the tweet
    // now we will compare and if the tweet exists we will  go ahead and delete it
    if (userId.toString() === authorId.toString()) {
      const deleteTweet = await TweetModal.findByIdAndDelete(tweetId);
      return response
        .status(200)
        .json({ message: "deleted tweet successfully" });
    } else {
      return response
        .status(400)
        .json({ error: "Unauthorized: You cannot delete this post" });
    }
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

// creating a routehandler middleware function to get the user profile

const getUserdetails = async (request, response) => {
  try {
    const { authorId } = request.params; // destructuring the userId from the request.params object
    const userDetails = await TweetModal.find({ author: authorId }).populate(
      "author",
      "fullname email createdOn image followers following"
    );
    if (userDetails) {
      return response.status(200).json({
        message: "user profile found",
        tweetCount: userDetails.length,
        userDetails,
      });
    } else {
      return response.status(400).json({ error: "details not found" });
    }
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

// creating a route handler middleware function for replying on a tweet

const addcomment = async (request, response) => {
  try {
    // we want the id of the post on which reply has to be sent
    const { tweetId, commentText } = request.body; // extracting the tweet id and comment text from the request body
    const commentedBy = request.user._id; // extracting the id of the user who will comment
    const commentObject = {
      commentText,
      commentedBy,
    }; // this is the part which we want to update in the tweet

    // since adding a comment will be a put request, so we are using the below method which takes three arguments
    const addreply = await TweetModal.findByIdAndUpdate(
      tweetId, // this is the id which we want to add comment to
      {
        $push: { comment: commentObject }, // this is the part which we want to update it with
      },
      { new: true, runValidators: true } // this will give us the updated tweet in the response and also the validators work
    );
    return response
      .status(201)
      .json({ message: "Comment added successfully", addreply });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

// creating a route handler middleware function to get all the comments on a specific post

const getallcomments = async (request, response) => {
  try {
    // first we would need the tweetid whose comments we want to fetch
    const { tweetId } = request.params;
    const allComments = await TweetModal.findById(tweetId).populate(
      "comment.commentedBy",
      "fullname image"
    );
    if (!allComments) {
      return response.status(400).json({ error: "no comments found" });
    }
    return response
      .status(200)
      .json({ message: "all comments fetched successfully", allComments });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};
// creating a route handler middleware function to like a tweet

const likeTweet = async (request, response) => {
  try {
    // we would need the tweetid which we want to like
    const { tweetId } = request.body;
    // we will check whether the tweetId exists or not
    const tweet = await TweetModal.findById(tweetId);
    if (!tweet) {
      return response.status(400).json({ error: "tweet not found" });
    }
    // we will now check if the tweet has been already liked or not, since tweet is an array so we will use includes() method to check if that user has already liked or not
    const userWhoLiked = request.user._id;
    if (tweet.likes.includes(userWhoLiked)) {
      return response
        .status(400)
        .json({ error: "the tweet has already been liked" });
    }
    // since linking the tweet is also going to be a put request, so we will use findbyIdandupdate method which would take 3 arguments

    const likedTweet = await TweetModal.findByIdAndUpdate(
      tweetId,
      {
        $push: { likes: userWhoLiked },
      },
      { new: true, runValidators: true }
    ).populate("author", "fullname email _id");

    return response
      .status(201)
      .json({ message: "tweet liked successfully", likedTweet });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

// creating a route handler middleware function to unlike a tweet

const unlikeTweet = async (request, response) => {
  try {
    // first of all we will check whether the tweet exists or not
    const { tweetId } = request.body;
    const tweet = await TweetModal.findById(tweetId);
    if (!tweet) {
      return response.status(400).json({ error: "tweet not found" });
    }
    // now we will check if the userId is there in the likes array or not
    const user = request.user._id;
    if (!tweet.likes.includes(user)) {
      return response.status(400).json({ error: "user not found" });
    }
    // now we will go ahead and remove the userId if found in the likes array
    const dislikeTweet = await TweetModal.findByIdAndUpdate(
      tweetId,
      { $pull: { likes: user } },
      { new: true, runValidators: true }
    ).populate("author", "fullname email _id");
    return response
      .status(201)
      .json({ message: "disliked successfully", dislikeTweet });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

// creating a route handler middleware function for retweet
const retweet = async (request, response) => {
  try {
    // first we will find the tweet id  which we want to retweet
    const { tweetId } = request.params; // extracting the tweet id from the request.params object
    const userId = request.user._id;
    // we will check if the logged in user has already retwitted the tweet
    const tweet = await TweetModal.findById(tweetId);

    if (tweet.retweet.includes(userId)) {
      return response.status(400).json({ error: "you have already retwitted" });
    }
    // now we will add the userId to the retweet array

    const retweet = await TweetModal.findByIdAndUpdate(
      tweetId,
      { $push: { retweet: userId } },
      { new: true, runValidators: true }
    ).populate("retweet", "fullname email");
    return response
      .status(201)
      .json({ message: "retweeted successfully", retweet });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

module.exports = {
  addTweet,
  getAllTweets,
  getMyTweets,
  deletetweet,
  getUserdetails,
  addcomment,
  getallcomments,
  likeTweet,
  unlikeTweet,
  retweet,
};
