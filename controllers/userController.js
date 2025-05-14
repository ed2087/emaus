// controllers/userController.js
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Get user profile
const getProfile = async (req, res) => {
  try {
    res.render('profile', {
      title: 'Your Profile',
      userData: req.user,
      user: req.user,
        path: req.path
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading your profile.',
      user: req.user,
        path: req.path
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      church,
      isMember,
      emergencyName,
      emergencyPhone,
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;
    
    // Find user
    const user = await User.findById(req.user._id);
    
    // Update basic fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    user.church = church;
    user.isMember = isMember;
    user.emergencyName = emergencyName;
    user.emergencyPhone = emergencyPhone;
    
    // Update password if provided
    if (currentPassword && newPassword && confirmPassword) {
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).render('profile', {
          title: 'Your Profile',
          userData: { ...req.body, _id: req.user._id },
          error: 'Current password is incorrect.',
          user: req.user,
        path: req.path
        });
      }
      
      // Check if new passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).render('profile', {
          title: 'Your Profile',
          userData: { ...req.body, _id: req.user._id },
          error: 'New passwords do not match.',
          user: req.user,
        path: req.path
        });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    
    await user.save();
    
    res.render('profile', {
      title: 'Your Profile',
      userData: user,
      success: 'Your profile has been updated successfully.',
      user: user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).render('profile', {
      title: 'Your Profile',
      userData: { ...req.body, _id: req.user._id },
      error: 'An error occurred while updating your profile.',
      user: req.user,
        path: req.path
    });
  }
};

// Get user profile as JSON
const getProfileJson = async (req, res) => {
  try {
    // Exclude password and sensitive info
    const userData = {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role,
      isVerified: req.user.isVerified,
      isActive: req.user.isActive
    };
    
    res.json(userData);
  } catch (error) {
    console.error('Error getting profile JSON:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading your profile.'
    });
  }
};

export default {
  getProfile,
  updateProfile,
  getProfileJson
};