var request = require('request');
var moment = require('moment');
var jwt = require('jwt-simple');
var colors = require('colors');
//var ladp=require('ldapjs');

 module.exports = function(app) {
var mono = require('mongodb');
var config = require('../config');
//var User = require('./models/user')(mongoose);
//var Logs = require('./models/reports')(mongoose);
var mongoclient = new mono.Server("localhost", 27017,  {safe:false}, {native_parser: true},{auto_reconnect: true});
var db = new mono.Db('test',mongoclient);
db.open(function(){});
var username;
//var mongoclient = new mono.Server("localhost", 27017,  {safe:false}, {native_parser: true},{auto_reconnect: true});
//var db = new mono.Db('hydlogs',mongoclient);
//db.open(function(){});

 /*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }
  var token = req.headers.authorization.split(' ')[1];

  var payload = null;
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET);
    console.log("payload");
  }
  catch (err){
    return res.status(401).send({message: err.message});
  }

  if (payload.exp <= moment().unix()) {
    console.log("expired");
    return res.status(401).send({ message: 'Token has expired' });
    //return true;
  }
  /*else {
  return false;
  }*/
  req.user = payload.sub;
  next();
}

/*app.post('/auth/logincheck', function(req, resp) {
/*if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }
  var token = req.headers.authorization.split(' ')[1];
  var token = req.token;

  var payload = null;
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET);
    console.log("payload");
  }
  catch (err){
    return res.status(401).send({message: err.message});
  }

  if (payload.exp <= moment().unix()) {
    console.log("expired");
    //return res.status(401).send({ message: 'Token has expired' });
        return true;
          }
            else {
              return false;
                }

});*/
/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, 'd').unix()
  };
 //i return jwt.encode(payload, config.TOKEN_SECRET);
  var token = jwt.encode(payload, config.TOKEN_SECRET);
  var testing = token + "tgimtoken" + username;
  return testing;
}

/*
 |--------------------------------------------------------------------------
 | GET /api/me
 |--------------------------------------------------------------------------
 */
app.get('/api/me', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    console.log(user);
    console.log(err);
    res.send(user);
  });
});

/*
 |--------------------------------------------------------------------------
 | PUT /api/me
 |--------------------------------------------------------------------------
 */
app.put('/api/me', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user.displayName = req.body.displayName || user.displayName;
    user.email = req.body.email || user.email;
    user.save(function(err) {
      res.status(200).end();
    });
  });
});


/*
 |--------------------------------------------------------------------------
 | Log in with Email
 |--------------------------------------------------------------------------
 */
app.post('/auth/login', function(req, resp) {
  console.log("1_");
  /*User.findOne({ displayName: req.body.email }, '+password', function(err, user) {
    if (!user) {
      return res.status(401).send({ message: 'Wrong Username and/or password' });
    }
    user.comparePassword(req.body.password, function(err, isMatch) {
      if (!isMatch) {
        return res.status(401).send({ message: 'Wrong Username  and/or password' });
      }
      res.send({ token: createJWT(user) });
    });
  });
*/

if(req.body.email=="admin" && req.body.password=="admin")
{
res.send({ token: createJWT(req.body.email) });
}
else
{
return res.status(401).send({ message: 'Wrong Username and/or password' });
}
/*var userexists=[];
function  findEmpId(empid, callback){ 
var collection = db.collection('cdc_users');
var test = empid;
//var userexists=[];
var query= { alias : test};
collection.find(query).toArray(function(err, doc) {
                                    if(doc.length>0){//console.log(doc);
                                                        resp.send({ token: createJWT(req.body.email) });
                                                         }
                                          if(err){ console.log("Error"+err); }

                                   });
}

findEmpId(req.body.email, function(err, exists) {
   if (err) {
      console.log(err);
          } else if (  exists ) {
                  //console.log(exists + 'here');
                   userexists=exists;
		   username = exists[0].name;
		   //console.log(username);
                   //console.log(userexists);
                   }
                  }


);
var ldap = require('ldapjs');
   //     console.log(ldap);
        var client = ldap.createClient({
    url: 'LDAP://172.17.9.25/'
  });

client.bind('cn=sa01.INCHNSOTTGIM,OU=Special-Users,OU=Users,OU=Yantra park,OU=TCS - Mumbai,OU=TCS - India,DC=India,DC=TCS,DC=com', 'gladiator@009', function(err,res) {
//  assert.ifError(err);
//console.log(err);
if(err)
{console.log('error while connecting');
}
else
{}
});
var opts = {
//  filter: '(&(pwd='+req.body.password+')(sAMAccountName='+req.body.email+'))',
    filter: '(sAMAccountName='+req.body.email+')',
  scope: 'sub',
  attributes: ['dn']
};

var ldap_test;


client.search('DC=India,DC=TCS,DC=com', opts, function(err, res) {
  //assert.ifError(err);

 res.on('searchEntry', function(entry) {
    //console.log(entry.toString());
    //console.log('entry: ' + JSON.stringify(entry.object));
    ldap_test=entry.raw;
    //JSON.stringify(entry.object);
    //console.log(ldap_test);
    //console.log(entry.raw);
    
  });
  res.on('searchReference', function(referral) {
    console.log('referral: ' + referral.uris.join());
  });
  res.on('error', function(err) {
    console.error('error: ' + err.message);
     return resp.status(401).send({ message: 'Wrong password' });
  });
  res.on('end', function(result) {
//    console.log('149'+ldap_test.dn);
console.log(req.body.email);
/*var collection = db.collection('cdc_users');
var test = req.body.email;
var query= { empid : test};
collection.find(query).toArray(function(err, doc) {
                                    if(doc != null){console.log(doc);
							userexists=doc;
							console.log(userexists); }
                                          if(err){ console.log("Error"+err);}
                                              
                                   });
	console.log(userexists);

  //  if(ldap_tes)
      if(userexists.length>0)
    {
    client.bind(ldap_test.dn,req.body.password,function(err) {
if (err) {
		    console.log(req.body.password);
                    console.log(err);
                    console.log('Wrong password');
                     client.unbind(function(err) {
                if(err){console.log('1succcess'+err)}
                });
		    return resp.status(401).send({ message: 'Wrong password' });
                }
                else {
                console.log('Successfully logged in');
                //console.log(ldap_test.dn);
		resp.send({ token: createJWT(req.body.email) });
                //resp.json(userexists);
		client.unbind(function(err) {
  		if(err){console.log('1succcess'+err)}
		});
}
});
 }
  else
{
console.log('Wrong Username/No Access');
 client.unbind(function(err) {
                if(err){console.log('1succcess'+err)}
                });
return resp.status(401).send({ message: 'Wrong Username/No Access' });
}
/*client.unbind(function(err) {
                if(err){console.log(err)}
                });
    console.log('status: ' + result.status);
  });
});
console.log(ldap_test);*/
/*if(ldap_test != undefined)
{
client.bind(ldap_test,req.body.password,function(err) {
if (err) {
                    console.log('Wrong password');
                }
                else {
		console.log('Successfully logged in');
}
});

}
else
{
console.log('Wrong Username');
}*/
   //console.log(client);
/*                    $cookieStore.put('myFavorite', $scope.email);
                    var mixinLocals = { $scope: $rootScope, notify: notify_test };
                    $injector.invoke(require('plugins/kibana/_apps1'), self, mixinLocals);
*/
});





/*
 |--------------------------------------------------------------------------
 | Create Email and Password Account
 |--------------------------------------------------------------------------
 */
app.post('/auth/signup', function(req, res) {
  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      return res.status(409).send({ message: 'Email is already taken' });
    }
    var user = new User({
      displayName: req.body.displayName,
      email: req.body.email,
      password: req.body.password
    });
    user.save(function() {
      res.send({ token: createJWT(user) });
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Login with Google
 |--------------------------------------------------------------------------
 */
app.post('/auth/google', function(req, res) {
  var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
  var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.GOOGLE_SECRET,
    redirect_uri: req.body.redirectUri,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
    var accessToken = token.access_token;
    var headers = { Authorization: 'Bearer ' + accessToken };

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {

      // Step 3a. Link user accounts.
      if (req.headers.authorization) {
        User.findOne({ google: profile.sub }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
          }
          var token = req.headers.authorization.split(' ')[1];
          var payload = jwt.decode(token, config.TOKEN_SECRET);
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            user.google = profile.sub;
            //user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
            user.displayName = user.displayName || profile.name;
            user.save(function() {
              var token = createJWT(user);
              res.send({ token: token });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ google: profile.sub }, function(err, existingUser) {
          if (existingUser) {
            return res.send({ token: createJWT(existingUser) });
          }
          var user = new User();
          user.google = profile.sub;
          //user.picture = profile.picture.replace('sz=50', 'sz=200');
          user.displayName = profile.name;
          user.save(function(err) {
            var token = createJWT(user);
            res.send({ token: token });
          });
        });
      }
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Login with GitHub
 |--------------------------------------------------------------------------
 */
app.post('/auth/github', function(req, res) {
  var accessTokenUrl = 'https://github.com/login/oauth/access_token';
  var userApiUrl = 'https://api.github.com/user';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.GITHUB_SECRET,
    redirect_uri: req.body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params }, function(err, response, accessToken) {
    accessToken = qs.parse(accessToken);
    var headers = { 'User-Agent': 'Satellizer' };

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: userApiUrl, qs: accessToken, headers: headers, json: true }, function(err, response, profile) {

      // Step 3a. Link user accounts.
      if (req.headers.authorization) {
        User.findOne({ github: profile.id }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a GitHub account that belongs to you' });
          }
          var token = req.headers.authorization.split(' ')[1];
          var payload = jwt.decode(token, config.TOKEN_SECRET);
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            user.github = profile.id;
            user.picture = user.picture || profile.avatar_url;
            user.displayName = user.displayName || profile.name;
            user.save(function() {
              var token = createJWT(user);
              res.send({ token: token });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ github: profile.id }, function(err, existingUser) {
          if (existingUser) {
            var token = createJWT(existingUser);
            return res.send({ token: token });
          }
          var user = new User();
          user.github = profile.id;
          user.picture = profile.avatar_url;
          user.displayName = profile.name;
          user.save(function() {
            var token = createJWT(user);
            res.send({ token: token });
          });
        });
      }
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Login with Facebook
 |--------------------------------------------------------------------------
 */
app.post('/auth/facebook', function(req, res) {
  var accessTokenUrl = 'https://graph.facebook.com/v2.3/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.3/me';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.FACEBOOK_SECRET,
    redirect_uri: req.body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
    if (response.statusCode !== 200) {
      return res.status(500).send({ message: accessToken.error.message });
    }

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
      if (response.statusCode !== 200) {
        return res.status(500).send({ message: profile.error.message });
      }
      if (req.headers.authorization) {
        User.findOne({ facebook: profile.id }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Facebook account that belongs to you' });
          }
          var token = req.headers.authorization.split(' ')[1];
          var payload = jwt.decode(token, config.TOKEN_SECRET);
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            user.facebook = profile.id;
            user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
            user.displayName = user.displayName || profile.name;
            user.save(function() {
              var token = createJWT(user);
              res.send({ token: token });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ facebook: profile.id }, function(err, existingUser) {
          if (existingUser) {
            var token = createJWT(existingUser);
            return res.send({ token: token });
          }
          var user = new User();
          user.facebook = profile.id;
          user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.displayName = profile.name;
          user.save(function() {
            var token = createJWT(user);
            res.send({ token: token });
          });
        });
      }
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Login with Twitter
 |--------------------------------------------------------------------------
 */
app.post('/auth/twitter', function(req, res) {
  var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
  var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
  var profileUrl = 'https://api.twitter.com/1.1/users/show.json?screen_name=';

  // Part 1 of 2: Initial request from Satellizer.
  if (!req.body.oauth_token || !req.body.oauth_verifier) {
    var requestTokenOauth = {
      consumer_key: config.TWITTER_KEY,
      consumer_secret: config.TWITTER_SECRET,
      callback: config.TWITTER_CALLBACK
    };

    // Step 1. Obtain request token for the authorization popup.
    request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, function(err, response, body) {
      var oauthToken = qs.parse(body);

      // Step 2. Send OAuth token back to open the authorization screen.
      res.send(oauthToken);
    });
  } else {
      // Part 2 of 2: Second request after Authorize app is clicked.
    var accessTokenOauth = {
      consumer_key: config.TWITTER_KEY,
      consumer_secret: config.TWITTER_SECRET,
      token: req.body.oauth_token,
      verifier: req.body.oauth_verifier
    };

    // Step 3. Exchange oauth token and oauth verifier for access token.
    request.post({ url: accessTokenUrl, oauth: accessTokenOauth }, function(err, response, accessToken) {

      accessToken = qs.parse(accessToken);

      var profileOauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        oauth_token: accessToken.oauth_token
      };

      // Step 4. Retrieve profile information about the current user.
      request.get({ url: profileUrl + accessToken.screen_name, oauth: profileOauth, json: true }, function(err, response, profile) {

        // Step 5a. Link user accounts.
        if (req.headers.authorization) {
          User.findOne({ twitter: profile.id }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a Twitter account that belongs to you' });
            }

            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);

            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'User not found' });
              }

              user.twitter = profile.id;
              user.displayName = user.displayName || profile.name;
              user.picture = user.picture || profile.profile_image_url.replace('_normal', '');
              user.save(function(err) {
                res.send({ token: createJWT(user) });
              });
            });
          });
        } else {
          // Step 5b. Create a new user account or return an existing one.
          User.findOne({ twitter: profile.id }, function(err, existingUser) {
            if (existingUser) {
              return res.send({ token: createJWT(existingUser) });
            }

            var user = new User();
            user.twitter = profile.id;
            user.displayName = profile.name;
            user.picture = profile.profile_image_url.replace('_normal', '');
            user.save(function() {
              res.send({ token: createJWT(user) });
            });
          });
        }
      });
    });
  }
});

/*
 |--------------------------------------------------------------------------
 | Unlink Provider
 |--------------------------------------------------------------------------
 */
app.get('/auth/unlink/:provider', ensureAuthenticated, function(req, res) {
  var provider = req.params.provider;
  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user[provider] = undefined;
    user.save(function() {
      res.status(200).end();
    });
  });
});



}
