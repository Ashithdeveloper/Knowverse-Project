import User from "../Models/user.model.js";
import Notification from "../Models/notification.model.js";
import bcrypt from "bcryptjs";
import cloudinay from "cloudinary"

export const getProfile = async (req, res)=>{
    try {
        const { username} = req.params
        const user = await User.findOne({username})

        if(!user){
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(`Error in get user profile: ${error}`)
        res.status(500).json({ error: "Server Error" });
    }
}
export const followUnFollowUser = async (req, res) => {
    try {
        const {id} = req.params;
        const userToModify = await User.findById({_id: id})
        const currentUser = await User.findById({_id : req.user._id})
        if( id === req.user._id){
            return res.status(400).json({ error: "You can't follow yourself" });
        }
        if(!userToModify || !currentUser){
            return res.status(404).json({ error: "User not found" });
        }
        const isFollowing  = currentUser.following.includes(id);
        if(isFollowing){
            //unfollow
            await User.findByIdAndUpdate({_id : id},{$pull:{followers : req.user._id}})
            await User.findByIdAndUpdate({_id: req.user._id}, {$pull:{following:id}})
            res.status(200).json({ message: 'unfollowing'})
        }
        else{
            await User.findByIdAndUpdate({_id: id}, {$push:{followers:req.user._id}})
            await User.findByIdAndUpdate({_id: req.user._id}, {$push:{following:id}})
            //send notification
            const newNotification = new Notification({
                type : "follow",
                from : req.user._id,
                to : userToModify._id
            })
            await newNotification.save();
            res.status(200).json({message:"following successfully"})
            

        }
    } catch (error) {
        console.log(`Error in follow user: ${error}`)
        res.status(500).json({ error: "Server Error" });
    }
}
export const getSuggestedUsers = async (req , res) =>{
    try {
        const userId = req.user._id;
        const userFollowedByMe = await User.findById({_id : userId}).select("-password")

        const  users = await User.aggregate([
            {
                $match : {
                    _id : { $ne : userId}
                }
            },{
                $sample : {
                    size : 10
                }
            }
        ])
        const fillteredUsers = users.filter((user)=> !userFollowedByMe.following.includes(user._id))
        const suggestedUsers = fillteredUsers.slice(0,4);
        
        suggestedUsers.forEach((user)=> (user.password = null))
        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.log(`Error in getSuggestedUsers: ${error}`);
        res.status(500).json({ error: "Server Error" });
    }
}

export const updateUser = async (req,res) =>{
    try {
        const userId = req.user._id;
        const { username , fullName, email , currentPassword , newPassword, bio, link} = req.body;
        let { profileImg , coverImg } = req.body;
        
        let user = await User.findById({_id : userId});
        if(!user){
            return res.status(404).json({ error: "User not found" });
        }
        if((!newPassword && currentPassword)||(!currentPassword && newPassword)){
            return res.status(400).json({ error: "Please provide current or new password" });
        }
        if(newPassword && currentPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if(!isMatch){
                return res.status(401).json({ error: "Incorrect current password" });
            }
            if(newPassword.length < 8){
                return res.status(400).json({ error: "Password must be at least 8 characters long" });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }
        if(profileImg){
            if(user.profileImg){
                await cloudinay.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinay.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url;
        }
        if(coverImg){
            if(user.coverImg){
                await cloudinay.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinay.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url;
        }
        user.fullName = fullName || user.fullName;
        user.username = username || user.username;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.links = link || user.links;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;
        await user.save();
        // password is null in res
        user.password = null;
        return res.status(200).json(user);
    } catch (error) {
        console.log(`Error in updateUser: ${error}`);
        res.status(500).json({ error: "Server Error" });
    }
}
//For searching the users

export const searchUser = async( req,res) =>{
    const query = req.query.q;
    try {
        const user = await User.find({
            $or: [
                { username : { $regex: query, $options : 'i' }},
                { fullname:  { $regex : query , $options: "i"}},
            ]
        }).select( "_id username fullName email profileImg ")
        res.json(user)

    } catch (error) {
        res.status(400).json({message:"server error on search"})
    }
}