const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const reviewController = require('../controllers/reviewController');

/**
 * App Routes 
*/
router.get('/', recipeController.homepage);
router.get('/recipe/:id', recipeController.exploreRecipe );
router.get('/categories', recipeController.exploreCategories);
router.get('/categories/:id', recipeController.exploreCategoriesById);
router.post('/search', recipeController.searchRecipe);
router.get('/explore-latest', recipeController.exploreLatest);
router.get('/explore-random', recipeController.exploreRandom);
router.get('/submit-recipe', recipeController.submitRecipe);
router.post('/submit-recipe', recipeController.submitRecipeOnPost);

router.get('/login', recipeController.loginpage);
router.get('/register', recipeController.registerpage);
router.get('/logout', recipeController.logout);
router.post('/login', recipeController.login);
router.post('/register', recipeController.register);

router.post('/recipe/:recipeId/reviews', reviewController.newreview);


 
module.exports = router;