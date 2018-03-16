const express = require('express');
var cassandra = require('cassandra-driver');
const app = express();
const path = require('path');
var fs = require('fs');
var client = new cassandra.Client({contactPoints: ['localhost'], keyspace: 'hw4'});
const Uuid = require('cassandra-driver').types.Uuid;

app.get('/', (req, res) => res.send('Hello World!'))
var multer  = require('multer')
//Set storage engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req,file,cb){
    cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname));
  }
});
//Initialize upload variable
const upload = multer({
  //storage: storage,
  storage : multer.memoryStorage()
  //fileFilter: function(req,file,cb){
    //checkFileType(file,cb);
  //}
}).single('contents');

//check file type
function checkFileType(file,cb){
  //Allow ext
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  //checkmime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  }else{
    cb('Error: Images Only');
  }
}

app.use(express.static('./public'));

app.post('/deposit',upload, function (req, res, next) {
  // req.file is the `avatar` file
  console.log(req.file.buffer);
  var id = Uuid.random();
  client.execute('INSERT INTO imgs (id, filename, contents ) VALUES (?,?,?)', [id, req.body.filename, req.file.buffer],
    function(err, result) {
      if (err) console.log(err);
      //else console.log('got user profile with email ' + result.rows[0].contents);
    }
  );
 // console.log(fs.readFileSync(req.file.path));
  // req.body will hold the text fields, if there were any
  console.log(req.body);
  res.json({STATUS:"OK"})
});


app.get('/retrieve',(req,res,next)=>{
       var query = 'SELECT contents FROM imgs WHERE filename = ?  ALLOW FILTERING';
       console.log(query);
       client.execute(query, [req.query.filename],{ prepare: true })
	.then(
    	// function(err, result) {
       	    //if (err) console.log(err);
      		result=>{
  			
 			console.log(result);
			res.contentType( req.query.filename.split(".")[1]);
			//res.send(new Buffer(result.rows[0].contents, 'binary').toString('base64'));
			res.send(result.rows[0].contents);
		}
        );
	//res.send("DONE");

});
app.listen(80, () => console.log('Example app listening on port 3000!'))
