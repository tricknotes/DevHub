var mongo = require('mongodb');
var util = require('../lib/util');
var db;

var table_blog_name = 'blog';
var BLOG_LIMIT = 20;

exports.set_db = function(current_db){
  db = current_db;
};


var chat_log = require('../lib/chat_log');
var client_info = require('../lib/client_info');
var util = require('../lib/util');

exports.post = function(req, res, io) {
  var blog = req.body.blog;
  var blog_lines = blog.text.split('\n');

  function notify(blog){
    var name = "Blog";
    var msg = blog.name + "さんがブログを投稿しました\n" + "[" + blog.title + "](blog?id=" + blog._id + ")";
    var avatar = "img/blog.png";
    var data = {name: name, msg: msg, avatar: avatar, date: util.getFullDate(new Date())};

    chat_log.add(data,function(){
      io.sockets.emit('message', data);
      client_info.send_growl_all(data);
    });
  }

  blog.date = util.getFullDate(new Date());
  db.collection(table_blog_name, function(err, collection) {
    if (blog._id){
      collection.findOne({_id: new mongo.ObjectID(blog._id)},function(err, target_text) {
        if (target_text != null){
          blog._id = null;
          collection.update( {_id: target_text._id}, {'$set': {text: blog.text, name: blog.name, date: blog.date}}, {safe: true}, function(){});
          console.log("update " + target_text._id);
        }else{
          collection.save( blog, function(){} );
          console.log("save " + blog._id);
        }
        res.send({blog: blog});
      });
    }else{
      collection.save( blog, function(){
        console.log("save " + blog._id);
        res.send({blog: blog});
        notify(blog);
      });
    }
  });
};

exports.get = function(req, res){
  var id = req.query.id;
  if (id == undefined){
    res.render('blog');
  }else{
    res.render('blog_permalink',{locals:{id: id}});
  }
};

exports.body = function(req, res){
  var blog_id = req.query._id;
  db.collection(table_blog_name, function(err, collection) {
    if (blog_id == undefined){
      collection.find({}, {limit: BLOG_LIMIT, sort: {date: -1}}).toArray(function(err, latest_texts) {
        collection.count(function(err, count){
          var blogs = [];
          if (latest_texts != null && latest_texts.length != 0){
            blogs = latest_texts;
          }
          res.send({body: blogs, count: count});
        });
      });
    }else{
      collection.findOne({_id: new mongo.ObjectID(blog_id)}, function(err, blog){
        res.send({body: [blog], count: 1});
      });
    }
  });
};

exports.body_older = function(req, res){
  var last_id = req.query._id;
  db.collection(table_blog_name, function(err, collection) {
    collection.findOne({_id: new mongo.ObjectID(last_id)}, function(err, last_blog){
      collection.find({ date: {$lte: last_blog.date}}, {limit: BLOG_LIMIT + 1, sort:{date: -1}}).toArray(function(err, blogs) {
        res.send({body: blogs});
      });
    });
  });
};

exports.body_search = function(req, res){
  var conditions = req.query.keyword.split(" ").map(function(key){ return {text: { $regex: key, $options: 'i'}}; })
  db.collection(table_blog_name, function(err, collection) {
    collection.find({ $and: conditions }, {sort: {date: -1}}).toArray(function(err, latest_texts) {
      var blogs = [];
      if (latest_texts != null && latest_texts.length != 0){
        blogs = latest_texts;
      }
      res.send({body: blogs, count: blogs.length});
    });
  });
};

exports.delete = function(req, res) {
  var blog = req.body.blog;
  console.log(blog);
  db.collection(table_blog_name, function(err, collection) {
    collection.remove( {_id: new mongo.ObjectID(blog._id)} ,{safe:true}, function(){
      res.send("delete ok");
      console.log("delete ok");
    });
  });
};


