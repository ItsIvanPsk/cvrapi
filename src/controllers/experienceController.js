const express = require('express')
const post = require('../utils/utilsPost');
const queryDatabase = require('../utils/utils');

exports.getExperienceList = async (req, res) => {
  try {
    const experiences = await queryDatabase(`
      SELECT
        e.ExperienceId,
        e.Name,
        e.Rating
      FROM Experience AS e;
    `);

    if (!experiences.length) {
      return res.status(500).json(["Error!"]); 
    }

    const experienceData = await Promise.all(experiences.map(async (experience) => {
      const [images, categories] = await Promise.all([
        queryDatabase(`
          SELECT i.Src
          FROM Experience AS e
          INNER JOIN Experience_Images AS ei ON e.ExperienceId = ei.ExperienceId
          INNER JOIN Images AS i ON ei.ImageId = i.ImageId
          WHERE e.ExperienceId = ${experience.ExperienceId};
        `),
        queryDatabase(`
          SELECT c.Name
          FROM Category AS c
          INNER JOIN Experience_Category AS ec ON c.CategoryId = ec.CategoryId
          WHERE ec.ExperienceId = ${experience.ExperienceId};
        `)
      ]);
      
      return {
        experience_id: experience.ExperienceId,
        name: experience.Name,
        rating: experience.Rating,
        experience_categories: categories,
        experience_images: images
      };
    }));

    res.status(200).json(experienceData);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).send("Database query error");
  }
};

exports.getExperience = async (req, res) => {
  let experience_id = req.params.experience;
  let result = null;

  if (experience_id) {
    var objExperience = await queryDatabase(`SELECT * FROM Experience WHERE ExperienceId = ${experience_id};`);
    
    var objExperienceImages = await queryDatabase(`
        SELECT i.Src, ei.ExperienceId FROM Experience_Images AS ei
        INNER JOIN Images AS i ON i.ImageId = ei.ImageId
        WHERE ei.ExperienceId = ${experience_id};
    `);

    var objExperienceCategories = await queryDatabase(`
        SELECT c.Name AS name, ac.ExperienceId FROM Experience_Category AS ac
        INNER JOIN Category AS c ON c.CategoryId = ac.CategoryId
        WHERE ac.ExperienceId = ${experience_id}
    `);
    
    var experienceData = objExperience.map(experience => {
      var experienceImages = objExperienceImages.filter(image => image.ExperienceId === experience.ExperienceId);
      var experienceCategories = objExperienceCategories.filter(category => category.ExperienceId === experience.ExperienceId);
    
      return {
        ...experience,
        experience_images: experienceImages.map(image => ({ src: image.Src })),
        experience_category: experienceCategories.map(category => ({ name: category.name })),
      };
    });
    result = experienceData[0] || {};
  }

  res.status(200).json(result);
};
