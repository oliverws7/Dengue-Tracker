const express = require('express');
const router = express.Router();
const { dengueFocusController } = require('../../controllers');
const { authController } = require('../../controllers');
const {
  validateDengueFocusCreation,
  validateDengueFocusUpdate,
  validateRiskLevelUpdate
} = require('../../middlewares/validator');

router.use(authController.protect);

router.post('/',
  dengueFocusController.uploadPhoto,
  validateDengueFocusCreation,
  dengueFocusController.createDengueFocus
);

router.patch('/:id',
  dengueFocusController.uploadPhoto,
  validateDengueFocusUpdate,
  dengueFocusController.updateDengueFocus
);

router.get('/', dengueFocusController.getAllDengueFocuses);
router.get('/statistics', dengueFocusController.getStatistics);
router.get('/nearby', dengueFocusController.getNearbyFocuses);
router.get('/my-focuses', dengueFocusController.getMyDengueFocuses);
router.get('/:id', dengueFocusController.getDengueFocus);
router.patch('/:id/resolve', dengueFocusController.markAsResolved);
router.patch('/:id/risk-level', validateRiskLevelUpdate, dengueFocusController.updateRiskLevel);
router.delete('/:id', dengueFocusController.deleteDengueFocus);

module.exports = router;