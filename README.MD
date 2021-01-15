# Installing

You can install the **tweet.js** package using the following command

  

```
npm i tweet.js
```

  
  

# usage

  
to get the following tokens here is a [guide](https://iag.me/socialmedia/how-to-create-a-twitter-app-in-8-easy-steps/)
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
