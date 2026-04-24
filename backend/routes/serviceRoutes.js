const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');

// Debugging check (will print to console during server start)
if (!serviceController.getUserServices) console.error('MISSING: serviceController.getUserServices');
if (!serviceController.buyService) console.error('MISSING: serviceController.buyService');
if (!serviceController.getAllServices) console.error('MISSING: serviceController.getAllServices');
if (!serviceController.createService) console.error('MISSING: serviceController.createService');
if (!serviceController.updateServiceStatus) console.error('MISSING: serviceController.updateServiceStatus');

// User routes
router.get('/my-services', auth, serviceController.getUserServices);
router.post('/buy', auth, serviceController.buyService);

// Admin routes
router.get('/all', auth, serviceController.getAllServices);
router.post('/', auth, serviceController.createService);
router.put('/:id/status', auth, serviceController.updateServiceStatus);

module.exports = router;
