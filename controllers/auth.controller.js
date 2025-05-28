const authService = require('../services/auth.service');

module.exports = {
  register: async (req, res) => {
    try {
      const user = await authService.register(req.body);
      res.status(201).json(user);
    } catch (err) {
      console.dir(err, { depth: null });
      res.status(500).json({
        message: 'Registration failed',
        error: err.message || err.details || 'Unknown error'
      });
    }
  },

  login: async (req, res) => {
    const token = await authService.login(req.body);
    res.json({ token });
  },

  refreshToken: async (req, res) => {
    try {
      const result = await authService.refreshToken({ refreshToken: req.body.refreshToken });
      res.json(result);
    } catch (err) {
      console.dir(err, { depth: null });
      res.status(401).json({
        message: 'Token refresh failed',
        error: err.message || 'Invalid or expired refresh token'
      });
    }
  },

  logout: async (req, res) => {
    try {
      await authService.logout({ refreshToken: req.body.refreshToken });
      res.json({ success: true });
    } catch (err) {
      console.dir(err, { depth: null });
      res.status(500).json({
        message: 'Logout failed',
        error: err.message || 'Unknown error'
      });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      await authService.forgotPassword({ email: req.body.email });
      res.json({ message: 'Password reset link sent if email exists' });
    } catch (err) {
      console.dir(err, { depth: null });
      res.status(500).json({
        message: 'Request failed',
        error: err.message || 'Unknown error'
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      await authService.resetPassword({
        resetToken: req.body.resetToken,
        newPassword: req.body.newPassword
      });
      res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
      console.dir(err, { depth: null });
      res.status(400).json({
        message: 'Reset failed',
        error: err.message || 'Invalid or expired reset token'
      });
    }
  }

  
};