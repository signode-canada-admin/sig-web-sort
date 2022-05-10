// ********************* Required Modules ********************** //

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const { type } = require('os');
const PORT = 3000;


// create express app
const app = express();


// view engine
app.set('view engine', 'ejs');


// connect to MongoDB
const uri = 'mongodb://127.0.0.1:27017/';

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
    .catch((err) => {
        console.log(err)
    });


// retrieve data from specified collections
const database = client.db('signode');

const markham = database.collection('markham');
const surrey = database.collection('surrey');
const glenview = database.collection('glenview');
const markhamStatus = database.collection('markhamStatus');
const surreyStatus = database.collection('surreyStatus');
const glenviewStatus = database.collection('glenviewStatus');


// path of pickticket pdfs
const db = {
    "markham": {
        "pdfdb": "C:/pickticket_test/OneDrive - Signode Industrial Group/Signode Canada Picktickets/Markham",
        "name": "markham"
    },

    "surrey": {
        "pdfdb": "C:/pickticket_test/OneDrive - Signode Industrial Group/Signode Canada Picktickets/Surrey",
        "name": "surrey"
    },

    "glenview": {
        "pdfdb": "C:/pickticket_test/OneDrive - Signode Industrial Group/Signode Canada Picktickets/Glenview",
        "name": "glenview"
    }
};


//*********************************** Middleware *************************************//
app.use(express.urlencoded({ extended: true })); // POST data is readable 
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(db.markham.pdfdb));
app.use(express.static(db.surrey.pdfdb));
app.use(express.static(db.glenview.pdfdb));


// ********************* GET Requests ********************** //
// Can maybe search from each collection at the same time instead of sequentially
app.get("/", (req, res) => {
    markham.find({}).toArray().then((marlst) => {
        markhamStatus.find({}).toArray().then((marStat => {
            surrey.find({}).toArray().then((surrlst) => {
                surreyStatus.find({}).toArray().then((surrStat) => {
                    glenview.find({}).toArray().then((glenlst) => {
                        glenviewStatus.find({}).toArray().then((glenStat) => {
                            let context = { title: "Main Page", marlst, marStat, surrlst, surrStat, glenlst, glenStat };
                            res.render("index", context);
                        })
                    })
                })
            })
        }))
    })
})

// TEST
app.get("/edi", (req, res) => {
    return res.render('editest1', { title: "EDI" })
})


app.get("/edi/:site/:id", (req, res) => {
    const id = req.params.id
    return res.render('editest2', { title: id })
})


app.get("/edi/DONE", (req, res) => {
    const id = req.query.id
    res.render('ediDone', { title: id })
})


app.get("/mainPage", (req, res) => {
    res.redirect("/")
})

// mainPage/markham
app.get("/mainPage/markham", (req, res) => {
    res.redirect('/mainPage/markham/allOrders');
});


// mainPage/surrey
app.get("/mainPage/surrey", (req, res) => {
    res.redirect('/mainPage/surrey/allOrders');
});


// mainPage//glenview
app.get("/mainPage/glenview", (req, res) => {
    res.redirect('/mainPage/glenview/allOrders');
})


// mainPage/markham/allOrders
app.get("/mainPage/markham/allOrders", (req, res) => {

    markham.find({ "status": { $ne: "Archived" } }).sort({ dateReceived: -1 }).toArray().then((result) => {
        markhamStatus.find({}).toArray().then((statusResults) => {
            let lst_status = statusResults
            let lst_orders = result;
            const site = db.markham.name;
            const status = "All Orders";

            context = { title: site, lst_orders, site, status, lst_status };
            res.render("monthlyView", context);

        })
    });
});


// mainPage/surrey/allOrders
app.get("/mainPage/surrey/allOrders", (req, res) => {

    surrey.find({ "status": { $ne: "Archived" } }).sort({ dateReceived: -1 }).toArray().then((result) => {
        surreyStatus.find({}).toArray().then((statusResults) => {
            let lst_status = statusResults
            let lst_orders = result;
            const site = db.surrey.name;
            const status = "All Orders";

            context = { title: site, lst_orders, site, status, lst_status };
            res.render("monthlyView", context);

        })
    });
});

// mainPage/markham/allOrders
app.get("/mainPage/glenview/allOrders", (req, res) => {

    glenview.find({ "status": { $ne: "Archived" } }).sort({ dateReceived: -1 }).toArray().then((result) => {
        glenviewStatus.find({}).toArray().then((statusResults) => {
            let lst_status = statusResults
            let lst_orders = result;
            const site = db.glenview.name;
            const status = "All Orders";

            context = { title: site, lst_orders, site, status, lst_status };
            res.render("monthlyView", context);

        })
    });
});

// mainPage/markham/allOrders/:status
app.get("/markham", (req, res) => {

    const status = req.params.status;

    const site = db.markham.name;

    res.render("statusOrders");


});





// mainPage/markham/allOrders/:status
app.get("/mainPage/markham/allorders/:status", (req, res) => {

    const status = req.params.status;

    const site = db.markham.name;


    if (status == "AllOrders") {
        res.redirect(".");

    } else {

        markham.find({ "status": status }).sort({ dateReceived: -1 }).toArray().then((result) => {
            markhamStatus.find({ "status": status }).toArray().then((statusResults) => {
                let lst_status = statusResults
                let lst_orders = result

                context = { title: site, lst_orders, status, site, lst_status };

                res.render("monthlyView", context);
            })
        });
    }
});




// mainPage/surrey/allOrders/:status
app.get("/mainPage/surrey/allOrders/:status", (req, res) => {

    const status = req.params.status;

    const site = db.surrey.name;


    if (status == "AllOrders") {
        res.redirect(".");

    } else {

        surrey.find({ "status": status }).sort({ dateReceived: -1 }).toArray().then((result) => {
            surreyStatus.find({ "status": status }).toArray().then((statusResults) => {
                let lst_status = statusResults
                let lst_orders = result

                context = { title: site, lst_orders, status, site, lst_status };

                res.render("monthlyView", context);
            })
        });
    }
});


// mainPage/glenview/allOrders/:status
app.get("/mainPage/glenview/allOrders/:status", (req, res) => {

    const status = req.params.status;

    const site = db.glenview.name;


    if (status == "AllOrders") {
        res.redirect(".");

    } else {

        glenview.find({ "status": status }).sort({ dateReceived: -1 }).toArray().then((result) => {
            glenviewStatus.find({ "status": status }).toArray().then((statusResults) => {
                let lst_status = statusResults
                let lst_orders = result

                context = { title: site, lst_orders, status, site, lst_status };

                res.render("monthlyView", context);
            })
        });
    }
});



// Order details "all/:order"
app.get("/orders/:order", (req, res) => {


    const order = req.params.order;

    markham.find({ "_id": order }).toArray().then((result) => {

        if (result.length > 0) {
            const url = result[0]["fileDirectory"].split("\\").join("/");
            const file = url.replace(db.markham.pdfdb, "");
            const site = db.markham.name;

            const orderdata = result[0];

            let context = { title: `${order}`, orderdata, file, site };

            res.render("orderDetails", context);

        } else {
            surrey.find({ "_id": order }).toArray().then((result) => {

                if (result.length > 0) {

                    const url = result[0]["fileDirectory"].split("\\").join("/");
                    const file = url.replace(db.surrey.pdfdb, "");
                    const site = db.surrey.name;

                    const orderdata = result[0];

                    let context = { title: `${order}`, orderdata, file, site };

                    res.render("orderDetails", context);

                } else {

                    glenview.find({ "_id": order }).toArray().then((result) => {

                        if (result.length > 0) {

                            const url = result[0]["fileDirectory"].split("\\").join("/");
                            const file = url.replace(db.glenview.pdfdb, "");
                            const site = db.glenview.name;

                            const orderdata = result[0];

                            let context = { title: `${order}`, orderdata, file, site };

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
    let = context = { title: "404 ERROR" }
    res.status(404).render('404', context);
});