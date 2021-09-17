//*********************************** Required Modules *************************************//

const express = require("express");
const fs = require('fs');
const path = require("path");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const PORT = 3000;


//*********************************** Express App *************************************//
const app = express();


//*********************************** View Engine *************************************//
app.set("view engine", "ejs");
// app.set("views", "myviews"); //looks for views directory by default for .ejs files





// //*********************************** Database for markham and surrey orders *************************************//

const uri = "mongodb://127.0.0.1:27017/";
const dbName = 'signode';

const collectMar = 'markham';
const collectSurr = "surrey";
const collectGlen = "glenview";




const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


client.connect()
    .then((result) => {
        console.log("Connected to MongoDB");

        // Listen 
        app.listen(PORT, (req, res) => {
            console.log(`listening on PORT: ${PORT}`)
        })
    })
    .catch((err)=>{
        console.log(err)
    });
const database = client.db(dbName);
const markham = database.collection(collectMar);
const surrey = database.collection(collectSurr);
const glenview = database.collection(collectGlen);



// file is deprecated (to be removed)

const db = {"markham" : {"pdfdb" : "C:/pickticket_test/OneDrive - Signode Industrial Group/Signode Canada Picktickets/Markham",
                        "name" : "markham"}, 

            "surrey" : {"pdfdb" : "C:/pickticket_test/OneDrive - Signode Industrial Group/Signode Canada Picktickets/Surrey", 
                        "name" : "surrey"},

            "glenview" : {"pdfdb" : "C:/pickticket_test/OneDrive - Signode Industrial Group/Signode Canada Picktickets/Glenview", 
                        "name" : "glenview"}};




//*********************************** Middleware *************************************//
app.use(express.urlencoded({ extended: true })); // POST data is readable 
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(db.markham.pdfdb));
app.use(express.static(db.surrey.pdfdb));
app.use(express.static(db.glenview.pdfdb));









//***************************************** ALL ROUTES *************************************//



// "/"
app.get("/", (req, res)=>{
    res.redirect("/mainPage");
});


// /mainPage
app.get("/mainPage", (req, res)=>{

    markham.find({}).toArray().then((marlst)=>{
        surrey.find({}).toArray().then((surrlst)=>{
            glenview.find({}).toArray().then((glenlst)=>{
                let context = {title: "Main Page", marlst, surrlst, glenlst};
                res.render("index", context);
            })
        });
    });
});



/// Month webpage is deprecated, is now redirected to Allorders

// mainPage/markham
app.get("/mainPage/markham", (req, res)=>{

    res.redirect('/mainPage/markham/allOrders');
});


// mainPage/surrey
app.get("/mainPage/surrey", (req, res)=>{

    res.redirect('/mainPage/surrey/allOrders');
});


// mainPage//glenview
app.get("/mainPage/glenview", (req, res)=>{

    res.redirect('/mainPage/glenview/allOrders');
})








// mainPage/markham/allOrders
app.get("/mainPage/markham/allOrders", (req, res)=>{

    markham.find({}).sort({dateReceived: -1}).toArray().then((result)=>{

        lst_orders = result;
        const site = db.markham.name;
        const status = "All Orders";

        context = {title : site, lst_orders, site, status};
        res.render("monthlyView", context);

    });

});


// mainPage/surrey/allOrders
app.get("/mainPage/surrey/allOrders", (req, res)=>{

    surrey.find({}).sort({dateReceived: -1}).toArray().then((result)=>{

        lst_orders = result;
        const site = db.surrey.name;
        const status = "All Orders";

        context = {title : site, lst_orders, site, status};
        res.render("monthlyView", context);

    });

});

// mainPage/markham/allOrders
app.get("/mainPage/glenview/allOrders", (req, res)=>{

    glenview.find({}).sort({dateReceived: -1}).toArray().then((result)=>{

        lst_orders = result;
        const site = db.glenview.name;
        const status = "All Orders";

        context = {title : site, lst_orders, site, status};
        res.render("monthlyView", context);

    });

});





// mainPage/markham/allOrders/:status
app.get("/mainPage/markham/allorders/:status", (req, res)=>{

    const status = req.params.status;

    const site = db.markham.name;


    if (status == "AllOrders"){
        res.redirect(".");

    } else {

        markham.find({"status": status}).sort({dateReceived: -1}).toArray().then((result)=>{

            let lst_orders = result;

            context = {title: site, lst_orders, status, site};

            res.render("monthlyView", context);
    
        });

    }

});




// mainPage/surrey/allOrders/:status
app.get("/mainPage/surrey/allOrders/:status", (req, res)=>{

    const status = req.params.status;

    const site = db.surrey.name;


    if (status == "AllOrders"){
        res.redirect(".");

    } else {

        surrey.find({"status": status}).sort({dateReceived: -1}).toArray().then((result)=>{

            let lst_orders = result;

            context = {title: site, lst_orders, status, site};

            res.render("monthlyView", context);
    
        });

    }

});


// mainPage/glenview/allOrders/:status
app.get("/mainPage/glenview/allOrders/:status", (req, res)=>{

    const status = req.params.status;

    const site = db.glenview.name;


    if (status == "AllOrders"){
        res.redirect(".");

    } else {

        glenview.find({"status": status}).sort({dateReceived: -1}).toArray().then((result)=>{

            let lst_orders = result;

            context = {title: site, lst_orders, status, site};

            res.render("monthlyView", context);
    
        });

    }

});



// Order details "all/:order"
app.get("/orders/:order", (req, res)=>{


    const order = req.params.order;

    markham.find({"_id":order}).toArray().then((result)=>{

        if (result.length > 0){

            const url = result[0]["fileDirectory"].split("\\").join("/");
            const file = url.replace(db.markham.pdfdb, "");
            const site = db.markham.name;

            const orderdata = result[0];

            let context = {title : `${order}`, orderdata, file, site};

            res.render("orderDetails", context);

        } else {
            surrey.find({"_id":order}).toArray().then((result)=>{

                if (result.length > 0){

                    const url = result[0]["fileDirectory"].split("\\").join("/");
                    const file = url.replace(db.surrey.pdfdb, "");
                    const site = db.surrey.name;

                    const orderdata = result[0];

                    let context = {title : `${order}`, orderdata, file, site};

                    res.render("orderDetails", context);

                } else {

                    glenview.find({"_id":order}).toArray().then((result)=>{

                        if (result.length > 0){
                    
                            const url = result[0]["fileDirectory"].split("\\").join("/");
                            const file = url.replace(db.glenview.pdfdb, "");
                            const site = db.glenview.name;
                    
                            const orderdata = result[0];
                    
                            let context = {title : `${order}`, orderdata, file, site};
                    
                            res.render("orderDetails", context);
                        }
                    });
                }
            });
        }

        

    });
});





// invalid routes
app.use((req, res) => {

    let = context = {title :"404 ERROR"}
    res.status(404).render('404', context);
});







