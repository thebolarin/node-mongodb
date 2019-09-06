const path = require('path');

const express = require('express');

const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const csrf = require('csurf');

const flash = require('connect-flash');

const multer = require('multer');

const errorController = require('./controllers/error');
const User = require('./models/user');


const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');


const MONGODB_URI = 'mongodb+srv://bolarinwa:46sCJxpYnrHajTfc@cluster0-25yze.mongodb.net/shop?retryWrites=true&w=majority'

//TODOStarting express framework
const app = express();

//TODOIntializing mongo database that receives connection to store sessions
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

//TODO csrf miidleware function
const csrfProtection = csrf();

// CONFIGURING FILE STORAGE
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null , 'images');
  },
  filename: (req,file,cb) => {
    cb(null , new Date().getTime() +'-' + file.originalname);
    //! cb(null , new Date().toISOString() +'-' + file.originalname);
  }
});


//*Filtering image extension
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};


//TODOView template engine
app.set('view engine', 'ejs');
app.set('views', 'views');



const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


//* MIDDLEWARES i.e app.use()

//todo a parser for single path data like words,number
app.use(bodyParser.urlencoded({ extended: false }));

//todo a parser for multi path data like words,number
app.use(
  multer({storage: fileStorage,fileFilter : fileFilter}).single('image')
  );


app.use(express.static(path.join(__dirname, 'public')));

//? This locate the right path to the images folder
app.use('/images',express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);



//Todo error display middleware
app.use(flash());

//Todo Set csrf token and Spreading session data globally
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

//todo User object that is controlled by session
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      //console.log(err);
     // throw new Error(err);
     next(new Error(err));
    });

});

//*This route is here inorder to escape csrf protection
app.post('/create-order', isAuth, shopController.postOrder);

//TODO Using the middleware function standalone that scans both POST and GET for CSRF
app.use(csrfProtection);

//Todo Set csrf token and Spreading session data globally
app.use((req, res, next) => {

  res.locals.csrfToken = req.csrfToken();
  next();
});

//Todo Basic routes that moves from app.js to other routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


//Todo Global error handling
app.use(errorController.get404);
app.get ('/500',errorController.get500);
app.use((error,req,res,next)=> {
  // res.status(error,httpStatusCode).render(...);
 // res.redirect('/500');

  res.status(500).render('500', {
    pageTitle: 'Technical Error',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});


//Todo Mongoose connection and sever listening
mongoose
.connect(MONGODB_URI ,{ useNewUrlParser: true })

  .then(result => {
    app.listen(3000);
    console.log('Connected!');
  })
  .catch(err => {
    console.log(err);


    //it will be also nice to console.log('Network is bad!'); in the .catch() block
  });
