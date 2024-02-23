const express = require("express"); // importing the express module
const postController = require("../Controllers/post_controller");
const authController = require("../Controllers/auth_controller");
const postRouter = express.Router(); // creater a postRouter

postRouter.post(
  "/addtweet",
  authController.protectRoute,
  postController.addTweet
); // router to add tweet
postRouter.get("/getalltweet", postController.getAllTweets); // router to get all tweets
postRouter.get(
  "/getmytweet",
  authController.protectRoute,
  postController.getMyTweets
); // router to get my tweets

postRouter.get("/profile/:authorId", postController.getUserdetails); // router to get  user profile

postRouter.get("/allcomments/:tweetId", postController.getallcomments); // router to get all comments

postRouter.delete(
  "/delete/:tweetId",
  authController.protectRoute,
  postController.deletetweet
); // router to delete my tweet

postRouter.put(
  "/addcomment",
  authController.protectRoute,
  postController.addcomment
); // router to add comment to a tweet

postRouter.put(
  "/liketweet",
  authController.protectRoute,
  postController.likeTweet
); // router to like a tweet
postRouter.put(
  "/unliketweet",
  authController.protectRoute,
  postController.unlikeTweet
); // router to unlike a tweet
postRouter.put(
  "/retweet/:tweetId",
  authController.protectRoute,
  postController.retweet
); // router to unlike a tweet

module.exports = postRouter;
