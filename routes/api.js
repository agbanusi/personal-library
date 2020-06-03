/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
var ID = require('shortid')
var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
//const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app,db) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      db.collection('books').find().toArray().then((doc)=>{
        doc.forEach((i)=>{delete i.comments})
        res.send(doc)
      })
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      if(!title){res.send('missing title')}
      else{
      let result = ID.generate()
      try{
      db.collection('books').insertOne({_id:result,title,commentcount:0,comments:[]},(err,doc)=>{
        res.json({_id:result,title})
        //console.log(result)
      })}
      catch(e){
        res.send('unexpected error occured')
      }}
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      db.collection('books').deleteMany().then((doc)=>{
        res.send('complete delete successful')
      }).catch((e)=>{
        res.send('already empty Database')
      })
    });//.remove({})



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      db.collection('books').findOne({_id:bookid},(err,doc)=>{
        if(err) throw err;
        if(!doc) {res.send('no book exists')}
        else{delete doc.commentcount
        res.send(doc)}
      })
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      if(comment==''){
        res.send('No comment found!')
      }
    else{
      db.collection('books').findOneAndUpdate({_id:bookid},{
        $inc:{commentcount:1},
        $push:{comments:comment}
      },{ returnNewDocument: true })
        .then((doc)=>{
        doc.value.comments.push(comment)
        res.json({title:doc.value.title,_id:doc.value._id,comments:doc.value.comments})
      }).catch(e=>{
          res.send('Invalid Id')
      })}
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      try{
        db.collection('books').findOneAndDelete({_id:bookid},(err,doc)=>{
          res.send('delete successful')
      })}
    catch(e){
      res.send('No book with that Id here')
    }
    });
  
};
