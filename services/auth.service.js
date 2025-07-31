// services/authService.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { nanoid } = require('nanoid');
const { createClient } = require('@supabase/supabase-js');

// Use your Supabase URL + SERVICE_ROLE key here
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const JWT_SECRET = process.env.JWT_SECRET;

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(30).required(),
  lastName: Joi.string().min(2).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('student', 'recruiter').required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  /**
   * Registers a new user in both auth.users and your users table.
   */
  register: async ({ firstName, lastName, email, password, role }) => {
    // 1) Validate input
    await registerSchema.validateAsync({ firstName, lastName, email, password, role });

    // 2) Create user in auth.users via Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,              // will trigger verification email
      user_metadata: { firstName, lastName, role },
    });
    if (authError) throw authError;
    const { user } = authData;

    // 3) Insert into your own `users` table
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: user.id,
        firstName,
        lastName,
        email,
        role,
        emailVerified: false    // will flip on your DB trigger or later on login
      }])
      .select()
      .single();
    if (error) throw error;

    // 4) (Optional) Kick off your email verify workflow here
    // sendVerificationEmail(user.email, ...)

    return { id: data.id, email: data.email, role: data.role };
  },

  /**
   * Logs in a user by email/password, returns JWT + refresh token.
   */
  login: async ({ email, password }) => {
    await loginSchema.validateAsync({ email, password });

    // fetch user row + hashed password
    const { data: user, error } = await supabase
      .from('users')
      .select('id, password, role, emailVerified')
      .eq('email', email)
      .single();
    if (error || !user) throw new Error('Invalid credentials');
    if (!user.emailVerified) throw new Error('Please verify your email first');

    // compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid credentials');

    // issue JWT
    const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = nanoid();

    // store refresh token
    const { error: rError } = await supabase
      .from('refresh_tokens')
      .insert([{
        token: refreshToken,
        user_id: user.id,
        host_id: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }]);
    if (rError) throw new Error(rError.message || 'Failed to store refresh token');

    return { accessToken, refreshToken };
  },

  /**
   * Exchange a valid refresh token for a new JWT.
   */
  refreshToken: async ({ refreshToken }) => {
    const { data: row, error } = await supabase
      .from('refresh_tokens')
      .select('user_id, expires_at')
      .eq('token', refreshToken)
      .single();
    if (error || new Date(row.expires_at) < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    // fetch user role
    const { data: user, error: uErr } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', row.user_id)
      .single();
    if (uErr) throw uErr;

    const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    return { accessToken };
  },

  /**
   * Logs out by deleting the refresh token.
   */
  logout: async ({ refreshToken }) => {
    const { error } = await supabase
      .from('refresh_tokens')
      .delete()
      .eq('token', refreshToken);
    if (error) throw error;
    return { success: true };
  },

  /**
    * Sends a password reset link via email.
    */
  forgotPassword: async ({ email }) => {
    // TODO: lookup user, generate one-time token, send email
    throw new Error('Not implemented');
  },

  /**
   * Resets user password using a valid reset token.
   */
  resetPassword: async ({ resetToken, newPassword }) => {
    // TODO: verify resetToken, hash newPassword, update user record
    throw new Error('Not implemented');
  },

};
