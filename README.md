# Installing

You can install the **tweets.js** package using the following command

  

```
npm i tweets.js
```

# support

* [Discord Support server](https://discord.gg/HVnGtzMaW4)
  

# usage

## Getting the token 

* Create an app on https://apps.twitter.com/
* Grab the Consumer Key (API Key) and Consumer Secret (API Secret) from Keys and Access Tokens
* Make sure you set the right access level for your app
* If you want to use user-based authentication, grab the access token key and secret as well



> Using the package is pretty easy

### setting up

```js
const { client }= require('tweets.js');
const  bot = new  tweet({
consumer_key:  "",
consumer_secret:  "",
access_token:  "",
access_token_secret:  ""
// get these by applying for developer access on twitter
});
```

## Example


> tweeting

```js
bot.tweet('hello from tweets.js').then(console.log).catch(console.error)
```

> Streams

* Using the default settings
* **A stream emitter is ready on startup by default, you will just have to call `<client>.start(parameters)` for it to be activated**

```js

const parameters = {
  follow: "1238451949000888322", // @typicalninja
};

const stream = bot.start(parameters);

// Stream is ready
stream.on('ready', (res) => {
  console.log('Stream ready');
});

// on data event from twitter
stream.on("data", tweet => {
if(tweet.text) {
  console.log(`New tweet : ${tweet.text} `)
} else {
  console.log(`A tweet was deleted : (`)
}
});

// good idea to listen for these errors
stream.on('error', (err) => console.log(err));

// Not important
stream.on("ping", () => console.log("ping"))

// emitted when stream ends
stream.on("end", () => console.log(`Stream ended f`))
```

> search for users

```js
// returns a array
bot.searchUsers('typicalNinja').catch(console.log).then(users => {
  console.log(users[0].id);
});
```

**find all the methods in our docs [here](https://tweets.axix.cf/)**


# Errors

## Read-only application cannot POST

**If you receive a error like above, change the permission for you app from dev portal to `read and write` from `read`**

![img](https://user-images.githubusercontent.com/65993466/120090828-1da06880-c123-11eb-992e-f0361f3676c2.png)

* Make sure to reset your access Token and Secret

![img](https://user-images.githubusercontent.com/65993466/120090968-47a65a80-c124-11eb-8dca-e4be5fc75823.png)

* it should be equal to below image

![img](https://user-images.githubusercontent.com/65993466/120091035-cf8c6480-c124-11eb-92c2-51553bca66f8.png)

## New version is here!!!

* supports streams
* Updated code



## Credit

* Code/inspiration is taken from the below sources


* [twitter-lite](https://github.com/draftbit/twitter-lite)
* [node-twitter](https://github.com/desmondmorris/node-twitter)
* [twit](https://github.com/ttezel/twit)