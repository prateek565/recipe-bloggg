
const Recipe = require('../models/Recipe');
const Review = require('../models/Reviews');
/**
 * POST /:recipeId/reviews
 * newreviewcreate
*/
exports.newreview = async (req, res) => {
  const { recipeId } = req.params;
  const { rating, comment } = req.body;

  try {
    const review = new Review({ recipe: recipeId, user: req.user, rating, comment });
    await review.save();

    const recipe = await Recipe.findById(recipeId);
    const reviews = await Review.find({ recipe: recipeId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    recipe.rating = totalRating / reviews.length;
    await recipe.save();

    res.redirect(`/recipe/${recipeId}`);
  } catch (error) {
    console.error(error);
    res.redirect('/error');
  }
};

