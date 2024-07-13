const express = require('express')
const post = require('./utilsPost.js')
var mysql = require('mysql2');
const cors = require('cors');


const app = express()
const port = 5000

app.use(cors()); 

app.get('/api/experiences/get_experience_list', async (req, res) => {
  console.log("[GET] GetExperienceList Endpoint R");

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
        await queryDatabase(`
          SELECT i.Src
          FROM Experience AS e
          INNER JOIN Experience_Images AS ei ON e.ExperienceId = ei.ExperienceId
          INNER JOIN Images AS i ON ei.ImageId = i.ImageId
          WHERE e.ExperienceId = ${experience.ExperienceId};
        `),
        await queryDatabase(`
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
    console.log("[GET] GetExperienceList Endpoint S");

  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).send("Database query error");
  }
});

app.get('/api/experiences/get_experience/:experience', async (req, res) => {
  console.log("[GET] GetExperience Endpoint R")
  let experience_id = req.params.experience;
  let result = null;

  if (experience_id) {
    var objExperience = await queryDatabase(`SELECT * FROM Experience WHERE ExperienceId = ${experience_id};`);
    
    var objExperienceImages = await queryDatabase(`
        SELECT i.Src, ei.ExperienceId FROM Experience_Images AS ei
        INNER JOIN Images AS i ON i.ImageId = ei.ImageId
        WHERE ei.ExperienceId = ` + experience_id + `;
    `);

    var objExperienceCategories = await queryDatabase(`
        SELECT c.Name AS name, ac.ExperienceId FROM Experience_Category AS ac
        INNER JOIN Category AS c ON c.CategoryId = ac.CategoryId
        WHERE ac.ExperienceId = ` + experience_id + `
    `);
    
    console.log(objExperienceImages);

    var experienceData = objExperience.map(experience => {
      var experienceImages = objExperienceImages.filter(image => image.id_experience === experience.experience_id);
      var experienceCategories = objExperienceCategories.filter(category => category.id_experience === experience.experience_id);
    
      return {
        ...experience,
        experience_images: experienceImages.map(image => ({ src: image.Src })),
        experience_category: experienceCategories.map(category => ({ name: category.name })),
      };
    });
    console.log(experienceData)
    result = experienceData[0] || {};
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
  console.log("[GET] GetExperience Endpoint S")
});



const httpServer = app.listen(port, appListen)
function appListen () {
  console.log(`Listening for HTTPS queries on: https://vrapi.ieti.cat/ on port ${port}`)
  console.log(`Listening for HTTPS queries on: localhost on port ${port}`)
}

function queryDatabase (query) {

  return new Promise((resolve, reject) => {
    var connectionDev = mysql.createConnection({
      host: process.env.MYSQLHOST || "localhost",
      port: process.env.MYSQLPORT || 3306,
      user: process.env.MYSQLUSER || "root", // vrapi
      password: process.env.MYSQLPASSWORD || "P@ssw0rd",
      database: process.env.MYSQLDATABASE || "vrapi_pro"
    });


    connectionDev.query(query, (error, results) => { 
      if (error) reject(error);
      resolve(results)
    });
     
    connectionDev.end();
  })
}