const express = require("express");
const authController = require("../Controllers/auth_controller");
const authrouter = express.Router(); // using the Router method on express to create the routes

authrouter.post("/signup", authController.signup); // using the signup function as a property on export object(here authController)
authrouter.post("/login", authController.login); // using the signup function as a property on export object(here authController)
authrouter.put(
  "/editprofile",
  authController.protectRoute,
  authController.editProfile
); // router to edit the profile of the user
authrouter.put(
  "/follow/:authorId",
  authController.protectRoute,
  authController.followUser
); // router to follow a user

authrouter.put(
  "/unfollow/:authorId",
  authController.protectRoute,
  authController.unfollowUser
); // router to unfollow a user

// Route to check if the logged-in user is following a particular author
authrouter.get(
  "/checkfollowing/:authorId",
  authController.protectRoute,
  authController.getFollowingStatus
);
module.exports = authrouter;
