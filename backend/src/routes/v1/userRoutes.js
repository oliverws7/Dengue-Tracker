const express = require('express');
const router = express.Router();
const { userController } = require('../../controllers');
const { authController } = require('../../controllers');
const { 
  validateUserCreation, 
  validateUserUpdate, 
  validatePasswordUpdate 
} = require('../../middlewares/validator');

router.post('/', validateUserCreation, userController.createUser);

router.use(authController.protect);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.patch('/:id', validateUserUpdate, userController.updateUser);
router.patch('/:id/password', validatePasswordUpdate, userController.updatePassword);
router.delete('/:id', userController.deleteUser);

module.exports = router;