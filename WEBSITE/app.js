// ********************* Required Modules ********************** //

const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const PORT = 3000;

// create express app
const app = express();


// view engine
app.set('view engine', 'ejs');

// ********************* Connect to MongoDB ********************** //
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


// ********************* Retrieve data from specified collections ********************** //

const database = client.db('signode');

const markham = database.collection('markham');
const surrey = database.collection('surrey');
const glenview = database.collection('glenview');

const markhamStatus = database.collection('markhamStatus');
const surreyStatus = database.collection('surreyStatus');
const glenviewStatus = database.collection('glenviewStatus');


// paths of pickticket pdfs
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


// ********************* Home page and main search ********************** //

// Home page: call index.ejs
// initially only displays search bar and location buttons
app.get("/", (req, res) => {
    res.render("index", {title: "Main Page"});
})

// Search for all locations: call mainSearch.ejs
// once user enters a search, display table
app.get("/:search=:filter", (req, res) => {
    const filter = req.params.filter
    // search active orders
    if(filter === "Search by..." || filter === "Active orders"){
        markham.find({ "status": { $ne: "Archived" } }).toArray().then((marList) => {
            markhamStatus.find({}).toArray().then((marStat => {
                surrey.find({ "status": { $ne: "Archived" } }).toArray().then((surrList) => {
                    surreyStatus.find({}).toArray().then((surrStat) => {
                        glenview.find({ "status": { $ne: "Archived" } }).toArray().then((glenList) => {
                            glenviewStatus.find({}).toArray().then((glenStat) => {
                                let context = { title: "Main Page", marList, marStat, surrList, surrStat, glenList, glenStat};
                                res.render("mainSearch", context);
                            })
                        })
                    })
                })
            }))
        })
    }
    // search archived orders
    else{
        markham.find({}).toArray().then((marList) => {
            markhamStatus.find({}).toArray().then((marStat => {
                surrey.find({}).toArray().then((surrList) => {
                    surreyStatus.find({}).toArray().then((surrStat) => {
                        glenview.find({}).toArray().then((glenList) => {
                            glenviewStatus.find({}).toArray().then((glenStat) => {
                                let context = { title: "Main Page", marList, marStat, surrList, surrStat, glenList, glenStat};
                                res.render("mainSearch", context);
                            })
                        })
                    })
                })
            }))
        })
    }
});

// EDI paths
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


// ********************* Display All Orders ********************** //

// Search result tables: call locationSearch
// markham: all orders
app.get("/markham/allOrders", (req, res) => {

    markham.find({ "status": { $ne: "Archived" } }).sort({ dateReceived: -1 }).toArray().then((result) => {
        markhamStatus.find({}).toArray().then((statusResults) => {
            let lst_status = statusResults
            let lst_orders = result;
            const site = db.markham.name;
            const status = "All Orders";

            context = { title: site, lst_orders, site, status, lst_status };
            res.render("locationSearch", context);

        })
    });
});


// surrey: all orders
app.get("/surrey/allOrders", (req, res) => {

    surrey.find({ "status": { $ne: "Archived" } }).sort({ dateReceived: -1 }).toArray().then((result) => {
        surreyStatus.find({}).toArray().then((statusResults) => {
            let lst_status = statusResults
            let lst_orders = result;
            const site = db.surrey.name;
            const status = "All Orders";

            context = { title: site, lst_orders, site, status, lst_status };
            res.render("locationSearch", context);

        })
    });
});

// glenview: all orders
app.get("/glenview/allOrders", (req, res) => {

    glenview.find({ "status": { $ne: "Archived" } }).sort({ dateReceived: -1 }).toArray().then((result) => {
        glenviewStatus.find({}).toArray().then((statusResults) => {
            let lst_status = statusResults
            let lst_orders = result;
            const site = db.glenview.name;
            const status = "All Orders";

            context = { title: site, lst_orders, site, status, lst_status };
            res.render("locationSearch", context);

        })
    });
});


// ********************* Display Orders Filtered by Status (printed, archived, etc.) ********************** //

// markham: filter by status 
app.get("/markham/allOrders/:status", (req, res) => {

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

                res.render("locationSearch", context);
            })
        });
    }
});

// surrey: filter by status 
app.get("/surrey/allOrders/:status", (req, res) => {

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

                res.render("locationSearch", context);
            })
        });
    }
});

// glenview: filter by status 
app.get("/glenview/allOrders/:status", (req, res) => {

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

                res.render("locationSearch", context);
            })
        });
    }
});


// ********************* Display order details (when you click a specific order) ********************** //
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
    })
});


// ********************* Error Page ********************** //

app.use((req, res) => {
    let = context = { title: "404 ERROR" }
    res.status(404).render('404', context);
});