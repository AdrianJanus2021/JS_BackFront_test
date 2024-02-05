const express = require("express")

const app = express();
const port = 3000;
app.set('view engine', 'ejs')



const bodyParser = require("body-parser")
const path = require("path");
app.use(bodyParser.urlencoded({ extended: false }))

const sqlite3 =require("sqlite3").verbose()
let db = new sqlite3.Database(':memory:', (err)=>{
    if (err){
        return console.error(err.message);
    }
    console.log('Connected to the in-memory database')
});
app.set('db',db)

db.serialize(()=> {
    db.run("CREATE TABLE category (" +
        "categoryId VARCHAR NOT NULL PRIMARY KEY," +
        "categoryName VARCHAR NOT NULL" +
        ");",function(err){
        if(err){
            return console.error(err.message)
        }
        console.log(`table created`);
    })
    .run("CREATE TABLE product (" +
        "productId VARCHAR NOT NULL PRIMARY KEY," +
        "productName VARCHAR NOT NULL," +
        "price DOUBLE(10,2) NOT NULL," +
        "categoryId VARCHAR NOT NULL,"+
        "FOREIGN KEY (categoryId) REFERENCES category(categoryId)" +
        ");",function(err){
        if(err){
            return console.error(err.message)
        }
        console.log(`table created`);
    })
    .run("INSERT INTO category(categoryId,categoryName)" +
        "VALUES('1','food');",function(err){
        if(err){
            return console.error(err.message)
        }
        console.log(`Rows inserted ${this.changes}`);
    }).run("INSERT INTO category(categoryId,categoryName)" +
    "VALUES('2','toy');",function(err){
    if(err){
        return console.error(err.message)
    }
    console.log(`Rows inserted ${this.changes}`);
    })
    .run("INSERT INTO product(productId,productName,price,categoryId)" +
            "VALUES('1','Banana',3.99,'1');",function(err){
        if(err){
            return console.error(err.message)
        }
        console.log(`Rows inserted ${this.changes}`);
    })
    .run("INSERT INTO product(productId,productName,price,categoryId)" +
        "VALUES('2','Chocolate',5.29,'1');",function(err){
        if(err){
            return console.error(err.message)
        }
        console.log(`Rows inserted ${this.changes}`);
    })
    .run("INSERT INTO product(productId,productName,price,categoryId)" +
        "VALUES('3','teddy bear',20.67,'2');",function(err){
        if(err){
            return console.error(err.message)
        }
        console.log(`Rows inserted ${this.changes}`);
    })
})

const joinedTable=`SELECT p.productId, p.productName, p.price, p.categoryId, c.categoryName
                        FROM product p, category c
                        WHERE p.categoryId = c.categoryId ;`

app.get("/", (req, res) =>
{
    db.all(joinedTable,async function(err,data){
        if(err){
            console.error(err.message);
            res.render('../views/errorview.ejs');
        }
        await res.render(
            "../views/mainview.ejs",
            {data}
        );
    })
})

app.post("/addProduct",async (req,res)=>{
    const {productId, productName, price, categoryId}=req.body
    db.get("SELECT count(*) FROM product WHERE productId = ?", [productId],(err,count1)=>{
        if(err){
            console.error(err.message);
            res.render('../views/errorview.ejs');
        }
        db.get("SELECT count(*) FROM category WHERE categoryId = ?", [categoryId],(err,count2)=>{
            if(err){
                console.error(err.message);
                res.render('../views/errorview.ejs');
            }
            if(count1["count(*)"]===0 && count2["count(*)"]!==0) {
                db.run("INSERT INTO product VALUES(?,?,?,?)", [productId, productName, price, categoryId], function (err) {
                    if (err) {
                        console.error(err.message);
                        res.render('../views/errorview.ejs');
                    }
                    console.log("New row has been inserted to the product table")
                })
            }
            res.redirect("/")
        })

    })
})

app.post("/addCategory",(req,res)=>{
    const {categoryId, categoryName}=req.body
    db.get("SELECT count(*) FROM category WHERE categoryId = ?", [categoryId],(err,result)=>{
        if(err){
            console.error(err.message);
            res.render('../views/errorview.ejs');
        }
        if(result["count(*)"]===0) {
            db.run("INSERT INTO category VALUES(?,?)", [categoryId, categoryName], function (err) {
                if (err) {
                    console.error(err.message);
                    res.render('../views/errorview.ejs');
                }
                console.log("New row has been inserted to the category table")
            })
        }
        res.redirect("/")
    })
})

app.post('/randomNumber',function(req,res){
    randN=Math.floor(Math.random()*100)
    res.json({randN: randN})
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})

app.use((req, res, next) => {
    res.status(404);
    res.send('<h3>Not found on the server</h3>');
});
