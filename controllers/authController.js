// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

// Get login page
const getLoginPage = (req, res) => {
  const { redirectTo } = req.query;
  res.render('auth/login', {
    title: 'Login',
    redirectTo: redirectTo || '',
    user: null,
        path: req.path
  });
};

// Process login
const postLogin = async (req, res) => {
  try {
    const { email, password, redirectTo } = req.body;

    console.log("postLogin",req.body)
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).render('auth/login', {
        title: 'Login',
        error: 'Invalid email or password',
        redirectTo: redirectTo || '',
        user: null,
        path: req.path
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(400).render('auth/login', {
        title: 'Login',
        error: 'Your account is inactive. Please contact an administrator.',
        redirectTo: redirectTo || '',
        user: null,
        path: req.path
      });
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).render('auth/login', {
        title: 'Login',
        error: 'Your account has not been verified yet. Please wait for admin approval.',
        redirectTo: redirectTo || '',
        user: null,
        path: req.path
      });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render('auth/login', {
        title: 'Login',
        error: 'Invalid email or password',
        redirectTo: redirectTo || '',
        user: null,
        path: req.path
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV === 'production'
    });

    console.log("--------------------------------------------",{
      isMatch: isMatch,
      token : token,
      cookie : res.cookie,
      user: user
    },"------------------------------------------------------")
    
    // Redirect to requested page or home
    res.redirect(redirectTo || '/');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('auth/login', {
      title: 'Login',
      error: 'An error occurred. Please try again.',
      redirectTo: req.body.redirectTo || '',
      user: null,
        path: req.path
    });
  }
};

// Get register page
const getRegisterPage = (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    user: null,
        path: req.path
  });
};

// Process registration
const postRegister = async (req, res) => {
  try {
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      birthday,
      gender,
      maritalStatus,
      church,
      isMember,
      phone,
      emergencyName,
      emergencyPhone,
      referral
    } = req.body;
    
    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).render('auth/register', {
        title: 'Register',
        error: 'Passwords do not match',
        formData: req.body,
        user: null,
        path: req.path
      });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render('auth/register', {
        title: 'Register',
        error: 'Email already registered',
        formData: req.body,
        user: null,
        path: req.path
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      birthday,
      gender,
      maritalStatus,
      church,
      isMember,
      phone,
      emergencyName,
      emergencyPhone,
      referral: referral || '',
      isVerified: false,
      isActive: true,
      role: 'user'
    });
    
    await newUser.save();
    
    // Redirect to success message
    res.redirect('/message?title=Registration+Successful&message=Thank+you+for+registering.+Your+account+will+be+verified+by+an+administrator+soon.');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).render('auth/register', {
      title: 'Register',
      error: 'An error occurred. Please try again.',
      formData: req.body,
      user: null,
        path: req.path
    });
  }
};

// Get forgot password page
const getForgotPasswordPage = (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Forgot Password',
    user: null,
        path: req.path
  });
};

// Process forgot password
const postForgotPassword = async (req, res) => {
  try {
    const { email, phone, church } = req.body;
    
    // Find user by email, phone and church
    const user = await User.findOne({ email, phone, church });
    if (!user) {
      return res.status(400).render('auth/forgot-password', {
        title: 'Forgot Password',
        error: 'No account found with these details',
        user: null,
        path: req.path
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour
    
    // Save token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();
    
    // In a real app, you would send an email here
    // For this implementation, redirect to reset page directly
    res.redirect(`/auth/reset-password/${resetToken}`);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).render('auth/forgot-password', {
      title: 'Forgot Password',
      error: 'An error occurred. Please try again.',
      user: null,
        path: req.path
    });
  }
};

// Get reset password page
const getResetPasswordPage = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find user by reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).redirect('/message?title=Invalid+Token&message=The+password+reset+token+is+invalid+or+has+expired.');
    }
    
    res.render('auth/reset-password', {
      title: 'Reset Password',
      token,
      user: null,
        path: req.path
    });
  } catch (error) {
    console.error('Reset password page error:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred. Please try again.',
      user: null,
        path: req.path
    });
  }
};

// Process reset password
const postResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    
    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).render('auth/reset-password', {
        title: 'Reset Password',
        token,
        error: 'Passwords do not match',
        user: null,
        path: req.path
      });
    }
    
    // Find user by reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).redirect('/message?title=Invalid+Token&message=The+password+reset+token+is+invalid+or+has+expired.');
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    
    // Redirect to success message
    res.redirect('/message?title=Password+Reset&message=Your+password+has+been+reset+successfully.&actionText=Login&actionUrl=/auth/login');
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).render('auth/reset-password', {
      title: 'Reset Password',
      token: req.params.token,
      error: 'An error occurred. Please try again.',
      user: null,
        path: req.path
    });
  }
};

// Logout
const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};

export default {
  getLoginPage,
  postLogin,
  getRegisterPage,
  postRegister,
  getForgotPasswordPage,
  postForgotPassword,
  getResetPasswordPage,
  postResetPassword,
  logout
};