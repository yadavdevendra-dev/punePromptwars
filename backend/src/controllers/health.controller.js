export const checkHealth = (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Learning Companion API is healthy and ready to serve.' });
};
