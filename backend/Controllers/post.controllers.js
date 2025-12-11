import User from '../Models/user.model.js';
import { v2 as cloudinary } from "cloudinary";
import Post from '../Models/post.model.js';
import Notification from '../Models/notification.model.js';

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let mediaUrl = null;

    if (req.file) {
      const fileBuffer = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype; //  "image/png" or "video/mp4"

      const uploadedResponse = await cloudinary.uploader.upload(
        `data:${mimeType};base64,${fileBuffer}`,
        {
          resource_type: mimeType.startsWith("video") ? "video" : "image",
        }
      );

      mediaUrl = uploadedResponse.secure_url;
    }

    if (!text && !mediaUrl) {
      return res
        .status(400)
        .json({ error: "Post must have text, image, or video" });
    }

    const newPost = new Post({
      user: req.user._id,
      text,
      media: mediaUrl, 
    });

    await newPost.save();

    const populatedPost = await Post.findById(newPost._id).populate(
      "user",
      "username fullName profileImg"
    );

    res.status(200).json(populatedPost);
  } catch (error) {
    console.log(`Error creating post: ${error}`);
    res.status(500).json({ error: "Server Error" });
  }
};


export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "Unauthorized to delete this post" });
    }

    // support both old 'img' field and new 'media' field
    const mediaUrl = post.media || post.img;

    if (mediaUrl) {
      const publicId = mediaUrl.split("/").pop().split(".")[0];
      const isVideo =
        mediaUrl.includes("/video/") || mediaUrl.match(/\.(mp4|mov|avi|webm)$/);

      await cloudinary.uploader.destroy(publicId, {
        resource_type: isVideo ? "video" : "image",
      });
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: "Post deleted successfully", id });
  } catch (error) {
    console.log(`Error deleting post ${error}`);
    res.status(500).json({ error: "Server Error" });
  }
};

export const createComment = async (req ,res) =>{
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        if(!text){
            return res.status(400).json({ error: "Text is required" });
        }
        const post = await Post.findById({_id : postId});
        if(!post){
            return res.status(404).json({ error: "Post not found" });
        }
        const newComment =  {
            user : userId,
            text
        }
        post.comments.push(newComment);
        await post.save();
          const updatedPost = await Post.findById(postId).populate(
            "comments.user",
            "username fullName profileImg email"
          ); // adjust fields as needed

          // Send back just the newly added comment (last one)
          const populatedComment = updatedPost.comments[updatedPost.comments.length - 1];

          res.status(200).json({ comment: populatedComment });
    } catch (error) {
        console.log(`Error creating comment ${error}`);
        res.status(500).json({ error: "Server Error" });
    }
}
export const likeUnlikePost = async (req , res) =>{
    try {
        const userId = req.user._id;
        const {id : postId } = req.params;
         const post = await Post.findOne({ _id: postId});
        if(!post){
            return res.status(404).json({ error: "Post not found" });
        }
        const userLikePost = post.likes.includes(userId);
        if(userLikePost){
           //unlike
           await Post.updateOne({_id : postId},{$pull:{likes : userId}})
           await User.updateOne({_id : userId},{$pull:{likedPosts : postId}});
           const updatedLikes = post.likes.filter((id)=> id.toString() !== userId.toString());

            res.status(200).json(updatedLikes)
            
        }
        else{
            //like
           post.likes.push(userId);
           await User.updateOne({_id : userId},{$push:{likedPosts : postId}});
           await post.save();
           //send notification to post owner
           const notification = new Notification({
             from: userId,
             to: post.user,
             type: "like",
           });
           await notification.save();
           const updatedLikes = post.likes
            return res.status(200).json(updatedLikes);
        }
    } catch (error) {
        console.log(`Error is like and  unlike controller :${error}`)
        res.status(500).json({ error: "Server Error" });
    }
}

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: [
          "-password",
          "-email",
          "-following",
          "-followers",
          "-bio",
          "-link",
        ],
      });

    // If no posts, return an empty array
    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    // Return all fetched posts
    res.status(200).json(posts);
  } catch (error) {
    console.log(` Error in getAllPosts controller: ${error}`);
    res.status(500).json({ error: "Server Error" });
  }
};

export const getLikedPosts = async(req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({ error: "User not found" });
        }
        const likedPosts = await Post.find({_id: {$in: user.likedPosts}}).populate({
            path: 'user',
            select: '-password'
        })
        .populate({
            path: 'comments.user',
            select: ['-password',"-email","-following","-followers","-bio","-link"]
        })
        res.status(200).json(likedPosts)
    } catch (error) {
        console.log(`Error is like and unlike controller :${error}`);
        res.status(500).json({ error: "Server Error" });
    }
}
export const getFollowingPosts = async ( req, res) => {
    try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
export const getUserPosts = async (req, res) => {
    try {
      const { username } = req.params;

      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ error: "User not found" });

      const posts = await Post.find({ user: user._id })
        .sort({ createdAt: -1 })
        .populate({
          path: "user",
          select: "-password",
        })
        .populate({
          path: "comments.user",
          select: "-password",
        });

      res.status(200).json(posts);
    } catch (error) {
      console.log("Error in getUserPosts controller: ", error);
      res.status(500).json({ error: "Internal server error" });
    }
}
