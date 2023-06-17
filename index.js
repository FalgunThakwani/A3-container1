const express = require('express');

const app = express();

const http = require('http');
const bodyParser = require('body-parser');

const fs = require('fs');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/',(req,res) => {
  res.json('Container 1 working....');
});

// app.get('/',(req,res) => {
// try{

//   const filePath = './file.dat';
//   fs.readFile(filePath, 'utf8', (err, data) => {
//     if (err) {
//       console.log('Error reading file:', err);
//       res.send("Error reading file:")
//       return;
//     }
//     console.log('File content:', data)
//     res.send({"data":data});
//   });
    

// }catch (err){
//   console.log(err);
//   res.send({"FAILED":err})
// }
// });



app.post('/store-file',async (req,res) => {
   let {file, data} = req.body;
   try{
    if(!file || file==null || file===""){
      res.json({"file":file,"error":"Invalid JSON input"});
    }else{
      const filePath = './'+file; 
      fs.writeFile(filePath, data,(err) => {
        if(err){
          const output = {
            "file": file,
            "error": err
          }
          res.status(500).send(output);
        }
      });
    }
   }catch (err){
    console.log('Errorr:', err);
    const output = {
      "file": file,
      "error": "Error while storing the file to the storage."
    }
    res.status(500).send(output);
  }
  });

app.post('/calculate', (req, res) => {
  const request = {
    hostname: 'container2',
    port: 3000,
    path: '/calculateAmount',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  let {file, product} = req.body;
  file=file.toLowerCase();
  const filePath = '/usr/src/data/'+ file;
  let output="";
  try{
    if(!file || file===""){
      res.json({file:file,error:"Invalid JSON input"});
    }else{
      fs.accessSync(filePath);
      const httpRequest=http.request(request,(response) =>{
        response.on('data', (data) => {
          output += data;
        });
        response.on('end', () => {
          res.send(JSON.parse(output));
        });
      });
      httpRequest.on('error', error => {
        res.send(error);
      });
      httpRequest.write(JSON.stringify({"file":file,"product":product}));
      httpRequest.end();
   
    }
  }catch (err){
    if (err.code === 'ENOENT') {
      output={"file":file,"error":"File not found."};
      statusCode=500;
      console.error('File does not exist');
    } else {
      console.error('Error occurred while accessing the file:', err);
    }
    res.send(output);
  }
});

app.listen(3000, () => {
  console.log('Server started on port 6000');
});
