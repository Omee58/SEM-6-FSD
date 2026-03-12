const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { register, login, getMe, updateProfile, updatePassword, uploadProfilePhoto, uploadCoverImage } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.put('/password', authMiddleware, updatePassword);
router.put('/profile-photo', authMiddleware, upload.single('profile_photo'), uploadProfilePhoto);
router.put('/cover-image', authMiddleware, upload.single('cover_image'), uploadCoverImage);

module.exports = router;
