const sqlite3 = require("sqlite3").verbose();
const port = process.env.PORT || 80;

var bodyParser = require('body-parser');

const cors=require("cors");
const express = require("express");
const path = require("node:path");
const app = express();

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: '50mb'
    }),
    express.static(path.join(__dirname, "public"))
);

app.get("/",
    function(req,res){
        res.sendFile(path.join(__dirname,"public/index.html"));
    }
)

app.listen(port, () => console.log(`Server is running on Port ${port}, visit http://localhost:${port}/ or http://127.0.0.1:${port} to access your website`));