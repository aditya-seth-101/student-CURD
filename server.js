let http = require('http')
let url = require('url')
let mongoClient = require('mongodb').MongoClient
let mongoUrl = 'mongodb://localhost:27017'
let s = ""
let dbFind = null
let dbInsert = null
let name = ""
let rollNo = ""
let cls = ""
let dbLength = 0;


async function setDb() {
    dbInsert = await mongoClient.connect(mongoUrl, function (err, db) {
        if (err) throw err;
        let dbObj = db.db('mydb1')
        dbObj.collection('students').insertOne({ name: name, rollNo: rollNo, cls: cls }), function (err, res) {
            if (err) throw err;

        }
        // db.close();
    })
}



async function getdb() {
    dbFind = await mongoClient.connect(mongoUrl, function (err, db) {
        let dbObj = db.db('mydb1')
        dbObj.collection("students").find({}).toArray(function (err, res1) {
            if (err) throw err;

            s = ""
            s = s + "<table border='1' cellpadding='10'><tr><th>Rno</th><th>Name</th><th>Branch</th><th> Edit / Del</th></tr>";
            for (var i = 0; i < res1.length; i++) {
                s = s + `<tr><td> ${res1[i].name}</td><td>${res1[i].rollNo} </td><td> ${res1[i].cls} </td><td>  <form action="http://127.0.0.1:8082"><input type='submit' name=${i} 
                value='Edit' >/<input type='submit' name=${i} value='Del'>    </form></td></tr>`;
            }
            s = s + "</table> <a href='http://127.0.0.1:5500/index.html'>Go to add table</a>";
        });
    });
}


http.createServer(function (req, res) {
    if (req.url !== "/favicon.ico") {
        let urlObj = url.parse(req.url, true)
        let data = urlObj.query
        name = data.name
        rollNo = data.rollNo
        cls = data.cls

        if (name != null&&name!=''&&data.EditOperation==null) {
            setDb()
           
        }


        if (data.EditOperation!=null) {
            mongoClient.connect(mongoUrl, function(err, db) {
                if (err) throw err;
                let qry=""
                var dbo = db.db("mydb1");
                 dbo.collection('students').find({}).toArray(function (err,res2) {
                   
                    qry= res2[parseInt(data.EditOperation)]
                    qry= (qry.name)
                  
                })
                setTimeout(function () {
                let x={"name":`${qry}`}
                let newvalues = { $set: { "name": name, "rollNo":  rollNo, "cls": cls } };
                dbo.collection("students").updateOne(x, newvalues, function(err, res) {
                  if (err) throw err;
                 getdb()
                });
                
                },500)
              });
              
        }
        if (data.DelOperation!=null) {
            mongoClient.connect(mongoUrl, function(err, db) {
                if (err) throw err;
                let qry=""
                var dbo = db.db("mydb1");
                 dbo.collection('students').find({}).toArray(function (err,res2) {
                    qry= res2[parseInt(data.DelOperation)]
                    qry= (qry.name)
                })
                setTimeout(function () {
                    let x={"name":`${qry}`}
                dbo.collection("students").deleteOne(x, function(err, res) {
                  if (err) throw err;
                 getdb()
                });
                
                },500)
              });
              
        }


        mongoClient.connect(mongoUrl, function (err, db) {
            if (err) throw err;
            let dbObj = db.db('mydb1')
            dbObj.collection('students').find({}).toArray(function (err, res1) {
                if (err) throw err;
                dbLength = res1.length
                if (name == undefined) {
                    for (let i = 0; i < dbLength; i++) {
                        if(data[i]=='Edit'){
                             
                                // res.setHeader("Content-Type", "text/html");
                                res.write(`<form action="http://127.0.0.1:8082">
                                <input type="text" placeholder="Name" name="name">
                                <input type="text" placeholder="Roll No" name="rollNo">
                                <input type="text" placeholder="Branch" name="cls">
                                <input type="hidden"  name="EditOperation" value=${i}>
                                <input type="submit" >
                            </form>`)
                                res.end()
                          
                        }
                        if(data[i]=='Del'){
                             
                                // res.setHeader("Content-Type", "text/html");
                                res.write(`<form action="http://127.0.0.1:8082">
                               <p>Are you sure</p>
                                <input type="hidden"  name="DelOperation" value=${i}>
                                <input type="submit" >
                            </form>`)
                                res.end()
                          
                        }
                    }
                }

            })

        })
        getdb();
        res.setHeader("Content-Type", "text/html");
        setTimeout(function () {
           
           
            res.write(s)
            res.end()
        }, 1000)

    }
}).listen(8082)