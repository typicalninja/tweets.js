# Installing

You can install the **tweets.js** package using the following command

  

```
npm i tweets.js
```

  
  

# usage

  
to get the following tokens here is a [guide](https://tweet.js.axix-devlopment.gq/tokens)
Using the package is pretty easy
setting up
```
const { tweet }= require('tweet.js');
const  bot = new  tweet({
consumer_key:  "",
consumer_secret:  "",
access_token:  "",
access_token_secret:  ""
// get these by applying for developer access on twitter
});
// thats it now follow the below methods
  ```
### find all the methods in our docs [here](https://tweet.js.axix-devlopment.gq)
### tweeting

  

#### **tweeting default** :

  ```
bot.tweet('tweet from tweet.js').then(r => console.log(r));

```

This will [console log this](https://hastebin.com/jaqabuteye.less)

#### **tweeting manual** :

```	
let  body = {
status:  'tweet from tweet.js'
};
bot.post('statuses/update' , body).then(r => {
console.log(r)
});

// or 
bot.post('statuses/update' , body,  function(r) {
console.log(r)
});


## plans

* have follow unfollow methods
* support streams
