import express from "express";
import session from "express-session";
import config from "config";
import mysql from "mysql2";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import path from "path";

const app = express();

// keys for apis
let stripeapi = 'sk_test_51LSShTBvNMaGWnC3nFIbfbL3wQUbXbuWPMczdApKhwLQwj6JQVb7AJ2TwfAVwZ4Jg5PleZvvd5z7tf6cNjKqRlft00eQsXtp1F'

// info for usernames etc
let username = "";
let password = "";
const saltRounds = 10;
let awnser = null;
let vals = 0;

let reqs = "";
let ress = "";

import stripe from 'stripe';

const client = stripe(stripeapi);


app.use(bodyParser.urlencoded({ extended: false }))

app.set('view-engine', 'ejs')

app.use(express.static('public'))

app.use(session({
    secret: 'sdfskofjxcv45dsfsjefcv',
    resave: false,
    saveUninitialized: true
  }));



// get methods

app.get('/', (req, res) => {
    res.render("index.ejs")
})

app.get('/login', (req, res) => {
    res.render("login.ejs")
})

app.get('/success', (req, res) => {
  res.render('success.ejs')
})

app.get('/register', (req, res) => {
    res.render("register.ejs")
})

app.get('/logout', (req, res) => {
    req.session.loggedIn = false;
    res.send("logged out!")
})

// post methods

app.post('/register', (req, res) => {
})

// ------------------------------------------------
  const conn = mysql.createConnection({
      host: '162.244.92.2',
      user: 'herosmcf_aiimagess',
      password: 'Aidens time',
      database: 'herosmcf_aiimages'
    });

  app.use(bodyParser.json())

  app.post('/login', (req, res) => {
    username = req.body.username;
    password = req.body.password;

    req.session.user = username;

    let isstaff = 2;

    conn.query(`SELECT * FROM usernpass WHERE username = ?`, 
    [username],

    function (err, results, fields) {
      if (err) {
          console.log(err);
      }else{
          if(results.length > 0){
              const hashedPassword = results[0].password;
              bcrypt.compare(password, hashedPassword, function(err, result) {
                  if(result) {
                    conn.query('SELECT * FROM usernpass WHERE username = ?',
                    [username],

                    function(err, results, fields) {
                      if(results[0].isstaff == 1) {
                        req.session.user = username
                        console.log("user is not staff")
                        req.session.loggedIn = true;
                        res.redirect("/protect")
                      } else {
                        req.session.user = username
                        console.log("user is staff");
                        req.session.loggedIn = true;
                        req.session.isstaff = true;
                        res.redirect('/staffpanel')
                      }
                    }

                    )
                      console.log("Record Exist");
                  } else {
                      console.log("Record does not Exist");
                      res.send("this isnt an account please make an account and if you are confused to why this isnt letting you in please open a live chat ticket!")
                  }
              });
          }else{
              console.log("Record does not Exist");
              res.send("this isnt an account please make an account and if you are confused to why this isnt letting you in please open a live chat ticket! " + "<a href='/login'>Login</a>")
          }
      }
  });
  })

  app.post('/regi', (req, res) => {
    console.log("here!")
    console.log("here!")
    username = req.body.username;
    password = req.body.password;
    console.log(username)
    console.log(password)
  
      conn.query(
        `SELECT password FROM usernpass WHERE username = ?`,
        [username],
    
        function(err, results) {
          if (err) throw err;
  
            if (results.length>0) {
                // when they already have an account
                res.send("you already have an account go sign in!")
                console.log("bad")
              console.log("denied")
            } else {
                // when they do not have an account
              bcrypt.hash(password, 10, function(err, hash) {
                let hashed = hash
                  conn.query(
                    `INSERT INTO usernpass (username, password) VALUES (?, ?)`,
                    [username, hashed],
                
                    function(err, results) {
                      if (err) throw err;
                      req.session.loggedIn = true;
                      console.log("authanticated")
                      req.session.user = username
                      res.redirect("/protect")
                    }
                  )
            })
          }
        }
      )
  })

  app.post("/credit", (req, res) => {
    conn.query(`SELECT credit FROM usernpass WHERE username = '${req.session.user}'`,
    
    function(err, results, fields) {
      if (err) {
        console.error(err)
      } else {
        if (results[0].credit != null && results[0].credit >= 1) {
          awnser = results[0].credit - 1;
          conn.query(`UPDATE usernpass SET credit = ${awnser} WHERE username = '${req.session.user}'`,
    
          function(err, results, fields) {
          }
          )
          console.log("hey")
          res.json({ result: "allowed" })
        } else {
          res.json({ result: "out" })
        }
      } 
      
    }
    )
  })

  app.post('/register', (req, res) => {

    })

    app.post('/addImage', (req, res) => {
      console.log(req.body.imageUrl)
      conn.query('SELECT imagearray FROM images WHERE 1',
      
      function(err, results, fields) {
        let result = JSON.parse(results[0].imagearray)
        result.push({
          button: `${req.body.imageName}`,
          url: `${req.body.imageUrl}`
        })
        conn.query('DELETE FROM `images` WHERE 1',
        
          function(err, results, fields) {
            console.log("deleted")
          }
        )
        let end = JSON.stringify(result)
        console.log(end)
        conn.query(`INSERT INTO images (imagearray) VALUES (?)`,
        [end],
        
        function(err, results, fields) {
          console.log(end)
          console.log("done!")
          console.log(results)
        }
        )
      }
      )
    })

    // ----------------------------------------------------------

    app.use((req, res, next) => {
      if (!req.session.loggedIn) {
          return res.status(401).send('Unauthorized');
      }
      next();
  });
  
  // protected pages client
  
  app.post("/configGrabs", (req, res) => {
    if (req.body.grab == "vjhjkhjkrgdfgb") {
      console
      res.json({ key: config.get('OPEN_AI_API') })
    }
  })

  app.get("/protect", (req, res) => {
    conn.query('SELECT * FROM images',
     
     function(err, results, fields) {
      let final = JSON.parse(results[0].imagearray)
      console.log(final)
      res.render("index.ejs", {value: final})
     }
    )
  })

  app.get('/generate', (req, res) => {
    conn.query(`SELECT credit FROM usernpass WHERE username = "${req.session.user}"`,
    
    function(err, results, fields) {
      res.render("gen.ejs", {vals: results[0].credit});
    }
    )
  })

// staff pages

app.use((req, res, next) => {
  if (!req.session.isstaff) {
    console.log(req.session.isstaff)
    return res.status(401).send('Unauthorized');
  }
  next();
});

app.post("/addCredits", (req, res) => {
  conn.query(`SELECT credit FROM usernpass WHERE username = '${req.body.username}'`,
      
  function(err, results, fields) {
    vals = 0;
    if (results[0].credit == null) {
      vals = req.body.num;
    } else {
      vals = Number(results[0].credit) + Number(req.body.num);

    }
    conn.query(`UPDATE usernpass SET credit = ${vals} WHERE username = '${req.body.username}'`,
  
    function(err, results, fields) {
      if (err) {
        vals = 0;
        console.error(err);
      } else {
        vals = 0;
        console.log("Credits Added! ")
      }
    }
    )
  }
  )
})

app.get("/staffpanel", (req, res) => {
  conn.query('SELECT * FROM images',
     
     function(err, results, fields) {
      let final = JSON.parse(results[0].imagearray)
      console.log(final)
      res.render("staff.ejs", {value: final, usernames: req.session.user})
     }
    )
})

app.listen(80, () => {
    console.log("Ai Image Gallory is ready to go!")
})
