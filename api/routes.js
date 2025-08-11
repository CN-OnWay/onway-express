const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');
const dataController = require('./controllers/dataController');
const appUsersController = require('./controllers/appUsersController');
const autoparkController = require('./controllers/autoparkController');
const notesController = require('./controllers/notesController');
const requestsController = require('./controllers/requestsController');
const routesController = require('./controllers/routesController');
const companyStaffController = require('./controllers/companyStaffController');
const companyDataController = require('./controllers/companyDataController');
const { authMiddleware } = require('./middleware/authMiddleware');

// Auth routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Public data routes
router.post('/submits', dataController.handleSubmits);
router.post('/rates', dataController.handleRates);
router.get('/data', authMiddleware, dataController.getData);

// Protected routes - App Users
router.get('/app-users', authMiddleware, appUsersController.getAppUsers);
router.post('/app-users', authMiddleware, appUsersController.createAppUser);
router.put('/app-users/:id', authMiddleware, appUsersController.updateAppUser);
router.delete('/app-users/:id', authMiddleware, appUsersController.deleteAppUser);

// Protected routes - Autopark
router.get('/autopark', authMiddleware, autoparkController.getAutopark);
router.post('/autopark', authMiddleware, autoparkController.createVehicle);
router.put('/autopark/:id', authMiddleware, autoparkController.updateVehicle);
router.delete('/autopark/:id', authMiddleware, autoparkController.deleteVehicle);

// Protected routes - Notes
router.get('/notes', authMiddleware, notesController.getNotes);
router.post('/notes', authMiddleware, notesController.createNote);
router.put('/notes/:id', authMiddleware, notesController.updateNote);
router.delete('/notes/:id', authMiddleware, notesController.deleteNote);

// Protected routes - Requests
router.get('/requests', authMiddleware, requestsController.getRequests);
router.post('/requests', authMiddleware, requestsController.createRequest);
router.put('/requests/:id', authMiddleware, requestsController.updateRequest);
router.delete('/requests/:id', authMiddleware, requestsController.deleteRequest);

// Protected routes - Routes and Transfers
router.get('/routes', authMiddleware, routesController.getRoutes);
router.post('/routes', authMiddleware, routesController.createRoute);
router.get('/routes/:routeId/transfers', authMiddleware, routesController.getTransfers);
router.post('/routes/:routeId/transfers', authMiddleware, routesController.createTransfer);

// Protected routes - Staff
router.get('/staff', authMiddleware, companyStaffController.getStaff);
router.post('/staff', authMiddleware, companyStaffController.createStaffMember);
router.put('/staff/:id', authMiddleware, companyStaffController.updateStaffMember);
router.delete('/staff/:id', authMiddleware, companyStaffController.deleteStaffMember);

// Protected routes - Company Data
router.get('/company', authMiddleware, companyDataController.getCompanyData);
router.put('/company', authMiddleware, companyDataController.updateCompanyData);

module.exports = router;