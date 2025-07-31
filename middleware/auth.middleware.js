const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports.verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token provided' });

  const token = header.split(' ')[1];

  const { data: user, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ message: 'Invalid token', error });
  }

  req.user = user;
  next();
};
