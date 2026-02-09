const express = require('express');
const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Painel administrativo e gestão de dados
 */

router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Dashboard admin OK'
  });
});

module.exports = router;
