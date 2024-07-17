const express = require('express');
const router = express.Router();
const { getExperienceList, getExperience } = require('../controllers/experienceController');

router.get('/get_experience_list', getExperienceList);
router.get('/get_experience/:experience', getExperience);

module.exports = router;
