// Rota de Logout
router.post('/logout', (req, res) => {
  // Se estiveres a usar Cookies, limpa o cookie
  res.clearCookie('token'); 
  return res.status(200).json({ message: 'Logout efetuado com sucesso' });
});