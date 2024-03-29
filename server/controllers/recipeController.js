require('../models/database');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');

const bcrypt = require("bcryptjs");
const User = require('../models/user') ;
const jwt = require('jsonwebtoken');
const Reviews = require('../models/Reviews');

/**
 * GET /
 * Homepage 
*/
exports.homepage = async(req, res) => {
  try {
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);
    const latest = await Recipe.find({}).sort({_id: -1}).limit(limitNumber);
    const thai = await Recipe.find({ 'category': 'Thai' }).limit(limitNumber);
    const american = await Recipe.find({ 'category': 'American' }).limit(limitNumber);
    const chinese = await Recipe.find({ 'category': 'Chinese' }).limit(limitNumber);

    const food = { latest, thai, american, chinese };
    const cookiedata= req.cookies;
    console.log(cookiedata);
    res.render('index', { title: 'Cooking Blog - Home', categories, food ,cookiedata} );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}

/**
 * GET /categories
 * Categories 
*/
exports.exploreCategories = async(req, res) => {
  try {
    const cookiedata= req.cookies;
    const limitNumber = 20;
    const categories = await Category.find({}).limit(limitNumber);
    res.render('categories', { title: 'Cooking Blog - Categoreis', categories,cookiedata } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 


/**
 * GET /categories/:id
 * Categories By Id
*/
exports.exploreCategoriesById = async(req, res) => { 
  try {
    const cookiedata= req.cookies;
    let categoryId = req.params.id;
    const limitNumber = 20;
    const categoryById = await Recipe.find({ 'category': categoryId }).limit(limitNumber);
    res.render('categories', { title: 'Cooking Blog - Categoreis', categoryById ,cookiedata} );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 
 
/**
 * GET /recipe/:id
 * Recipe 
*/
exports.exploreRecipe = async(req, res) => {
  try {
    const cookiedata= req.cookies;
    let recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    const reviews = await Reviews.find({ recipe: recipeId });

    res.render('recipe', { title: 'Cooking Blog - Recipe', recipe,cookiedata ,reviews} );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 


/**
 * POST /search
 * Search 
*/
exports.searchRecipe = async(req, res) => {
  try {
    const cookiedata= req.cookies;
    let searchTerm = req.body.searchTerm;
    let recipe = await Recipe.find( { $text: { $search: searchTerm, $diacriticSensitive: true } });
    res.render('search', { title: 'Cooking Blog - Search', recipe ,cookiedata} );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
  
}

/**
 * GET /explore-latest
 * Explplore Latest 
*/
exports.exploreLatest = async(req, res) => {
  try {
    const cookiedata= req.cookies;
    const limitNumber = 20;
    const recipe = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    res.render('explore-latest', { title: 'Cooking Blog - Explore Latest', recipe,cookiedata } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 



/**
 * GET /explore-random
 * Explore Random as JSON
*/
exports.exploreRandom = async(req, res) => {
  try {
    const cookiedata= req.cookies;
    let count = await Recipe.find().countDocuments();
    let random = Math.floor(Math.random() * count);
    let recipe = await Recipe.findOne().skip(random).exec();
    res.render('explore-random', { title: 'Cooking Blog - Explore Latest', recipe,cookiedata } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 


/**
 * GET /submit-recipe
 * Submit Recipe
*/
exports.submitRecipe = async(req, res) => {
  const cookiedata= req.cookies;
  if(cookiedata.token==="logout"){
    res.render('login',{cookiedata});
  }
else{  res.render('submit-recipe' ,{cookiedata});}
}


// Middleware function to verify JWT
const verifyToken = (req, res, next) => {

  // const bearerHeader = req.headers.authorization;
  // console.log( bearerHeader);
    // const bearer = bearerHeader.split(' ');

  if (typeof   req.cookie    !== 'undefined') {
    const bearerToken =   req.cookie.token;
    jwt.verify(bearerToken, "mysecret", (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: 'Token verification failed1' });
      }
      req.user = decoded.user;
      next();
    });
  } else {
    return res.status(401).send({ message: 'Token not provided' });
  }
};
/**
 * POST /submit-recipe
 * Submit Recipe
*/
exports.submitRecipeOnPost = async(req, res) => {
  try {

    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if(!req.files || Object.keys(req.files).length === 0){
      console.log('No Files where uploaded.');
    } else {
      console.log(' Files where uploaded.');
      imageUploadFile = req.files.image;
       newImageName={  
        data: imageUploadFile.data,
        contentType: imageUploadFile.mimetype,}
        console.log(newImageName);

    
    }
  // const token = req.cookie.token ;
  // console.log(req.cookie);
  //   jwt.verify(token, "mysecret", (err, authData) => {
  //     if (err) {
  //       return res.status(403).send({ message: 'Forbidden' });
      // }
      const newRecipe = new Recipe({
        name: req.body.name,
        description: req.body.description,
        email: req.body.email,
        ingredients: req.body.ingredients,
        category: req.body.category,
        image: newImageName
      });

      await newRecipe.save();
    res.redirect('/submit-recipe');
  } catch (error) {
    res.redirect('/submit-recipe')}
}


/**
 * GET /login
 * login_page
*/
exports.loginpage = async(req, res) => {
  const cookiedata= req.cookies;
  res.render('login',{cookiedata} );
}
/**
 * GET /register
 * registerpage
*/
exports.registerpage = async(req, res) => {
  const cookiedata= req.cookies;
  res.render('register' ,{cookiedata});
}
/**
 * GET /logout
 * logoutPage
*/
exports.logout = async(req, res) => {
  if (typeof window !== 'undefined') {
  localStorage.clear();}
  res.cookie('token', "logout", {expire: new Date() + 9999});
res.status(200);
  res.redirect('/');
}
/**
 * post /Login
 * LoginFeature
*/
exports.login = async(req, res) => {
  // console.log(req.body);
   await User.findOne({
        username: req.body.username
    })
      .then(user => {
          console.log(user);
        if (!user) {
          return res.status(404).send({ message: "User Not found." });
        }
    
        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    
    
        if (!passwordIsValid) {
          return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!"
          });
        }
    
        var token = jwt.sign({ username: user.username }, "mysecret", {
          expiresIn: 86400
        });
    
        // Put token in cookie
        res.cookie('token', token, {expire: new Date() + 9999});
      res.redirect('/submit-recipe');
     

      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
    };
 /**
 * POST/register
 * registerfeature
*/
exports.register = async(req, res) => {
  // console.log(req.body);
   User.findOne({ username: req.body.username }, (err, user) => {
    if (user) {
      return res.status(401).send({ message: 'username already exists' });
    }})
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  user.save(function(err,result){
    if (err){
        console.log(err);
    }
    else{
        console.log(result);
        res.redirect('/login');
    }
})
}