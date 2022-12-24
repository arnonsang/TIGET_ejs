//package import
const express = require("express");
const router = express.Router();
const app = express();
const path = require("path");
const ejs = require("ejs");
// const mysql = require("mysql");
//import functions from event.js
// const { createEventTable, testEventInsert, keyGen } = require("./events/event.js");
const { mailer } = require("./events/ticketmailler.js");
const hostServer = 'localhost';
const portServer = 3000;

//import mysql config and get connection
// const { host, user, port, password, database } = require("./config/sqlconfig.js");
// const conn = mysql.createConnection({
//   host: host,
//   port: port,
//   user: user,
//   password: password,
//   database: database,
// });

//sqlite
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/tigetDatabase.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});


const keyGen = (eventtype, keylength) => {
  let key = '';
  let et = 0;
  if(eventtype == 's'){
      key = 'S-';
      et = 2;
  }else if(eventtype == 'o'){
       key = 'O-';
       et = 2;
  }else{
       key = '';
       et = 0;
  }
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( var i = 0; i < keylength-et; i++ ) {
      key += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return key;
};

//create app table if not exist
// createEventTable();

//homepage
//finished for sqlite
router.get("/", (req, res) => {
  //  res.sendFile(path.join(__dirname, "./dist/html/index/index.html"));
  console.log("Loading key: ", keyGen(10));
  const querySQL = `SELECT * FROM EVENTS_LIST ORDER BY EventStatus;`;
  db.all(querySQL, [], (err, rows) => {
    if (err) {
      res.write("<p>Error, while loading event :" + err.sqlMessage +"</p>");
    } else {
      console.log('Homepage loaded');
      console.log(rows);
       res.render(path.join(__dirname + "/./dist/index.ejs"), {
        eventData: rows,
      });
    }
  });
});



router.get("/AboutUs", (req, res) => {
  res.sendFile(path.join(__dirname, "./dist/html/aboutus.html"));
});

router.get("/Ticket", (req, res) => {
  res.render(path.join(__dirname + "/./dist/ticket_checkticket.ejs"));
});


//event page
//finished for sqlite
router.get("/Events", (req, res) => {
  //get event
  const querySQL = `SELECT * FROM EVENTS_LIST ORDER BY EventStatus;`;
  const querySQL2 = `SELECT * FROM EVENTS_LIST WHERE EventType = 'online' ORDER BY EventStatus;`;
  db.all(querySQL, [], (err, rows) => {
    if (err) {
      console.log(err);
      res.write("<p>Error, while loading event :" + err.sqlMessage +"</p>");
      res.end();
    } else {
      db.all(querySQL2, [], (err2, rows2) => {
        if (err2) {
          console.log(err2);
          res.write("<p>Error, while loading online event :" + err2.sqlMessage +"</p>");
          res.end();
        } else {
          res.render(path.join(__dirname + "/./dist/event.ejs"), {
            eventData: rows,
            eventDataOnline: rows2,
          });
          console.log('Event page loaded');
        }
      });
    }
  });
});

//finished for sqlite
router.get("/Events/search", (req, res) => {
  //get event
  const key = req.query.searchEvent;
  const querySQL = `SELECT * FROM EVENTS_LIST WHERE EventTitle LIKE '%${key}%' OR EventTag LIKE '%${key}%' OR EventKeyName LIKE '%${key}%' OR EventDesc LIKE '%${key}%' OR EventLocation LIKE '%${key}%';`;

  db.all(querySQL, [], (err, rows) => {
  if (err) {
    console.error(err.message);
    res.end();
  } else {
    console.log(rows);
    res.render(path.join(__dirname + "/./dist/event_search.ejs"), {
      eventData: rows,
      Key: key
    });
  }
});
});

//event page with event code
//finished for sqlite
router.get("/Events/:eventCode", (req, res) => {
  const eventCode = req.params.eventCode;
  //render event page with event code
  res.render(path.join(__dirname + `/./dist/event_${eventCode}.ejs`), {
    eventCode: eventCode,
    // eventData: result[0]
  });  
});

// router.get("/Events/:eventCode/ticket/:eventName/:eventLocation/:eventTime/:eventDate", (req, res) => {
//   const eventCode = req.params.eventCode;
//   const querySQL = `SELECT ticketPrice, ticketQuantity, ticketSold, ticketAvailable FROM EVENTS_${eventCode};`; 
//   conn.query(querySQL, (err, result) => {
//     if (err) {
//       console.log(err);
//       res.write("<p>Error, while loading event :" + err.sqlMessage +"</p>");
//       res.end();  
//     } else {
//       console.log(result);
//       res.render(path.join(__dirname + `/./dist/ticket_${eventCode}.ejs`), {
//         ticketData: result[0],
//         title: req.params.eventName,
//         location: req.params.eventLocation,
//         time: req.params.eventTime,
//         date: req.params.eventDate,
//         eventCode: eventCode
//       });
//     }
//   });
  
// });


//finished for sqlite
router.get('/ticketRequest/:ticketPrice/:eventType', (req, res) => {
  const ticketPrice = req.params.ticketPrice;
  const eventType = req.params.eventType;
  const ticketCode = keyGen(eventType, 8);
  const buyerName = req.query.cName;
  const buyerEmail = req.query.cEmail;
  const buyerPhone = req.query.cPhone;
  const BuyerPayment = req.query.cPayment;
  const BuyerPaymentStatus = 'pending';
  const eventCode = req.query.eventCode;
  const insertSQL = `
INSERT INTO EVENTS_TICKET (ticketCode, ticketPrice, BuyerName, BuyerEmail, BuyerPhone, BuyerPayment, BuyerPaymentStatus, EventCode)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;

db.run(insertSQL, [ticketCode, ticketPrice, buyerName, buyerEmail, buyerPhone, BuyerPayment, BuyerPaymentStatus, eventCode], (err) => {
    if (err) {
      res.send("alert('Got error while create your ticket request'); window.location.href = '/Events'; ");
    } else {
      console.log('ticket request success');
      let mailSubject = `From Tiget! Hello ${buyerName}, Ticket Code for ${eventCode}`;
      let mailBody = `<h1>Hi ${buyerName}, From TiGet</h1><br>
      <p>Thank you for purchasing ticket from TiGet. Your ticket code is <h2>${ticketCode}</h2> .</p>
      <p>Please pay the ticket price of ${ticketPrice} Bath to the following account:</p>
      <p>Paypal : tigetpayment@paypal.com</p>
      <p>PromptPay : 1234567890</p>
      <p>Your ticket will be activated after payment is confirmed.</p><br>
      <p>You can watch this event on http://10.4.53.25:3444/watchOnline/Live?ticketCode=${ticketCode}</p><br>
      <p>Thank you for using TiGet</p><br>
      <p>Regards,</p>
      <p>TiGet Team</p>
      `
      mailer(buyerEmail, mailSubject, mailBody, ticketPrice);
      res.send(`alert('Ticket pending, please check your email to comfirm your payment details and activate ticket code'); window.location.href = '/Events/${eventCode}'`);

    }
  });
  console.log(req.query);
});

//finished for sqlite
router.get('/ticketRequest/offline/:ticketPrice/:eventType/:eventCode', (req, res) => {
  const ticketPrice = req.params.ticketPrice;
  const eventType = req.params.eventType;
  const ticketCode = keyGen(eventType, 8);
  const buyerName = req.query.cName;
  const buyerEmail = req.query.cEmail;
  const buyerPhone = req.query.cPhone;
  const BuyerPayment = req.query.cPayment;
  const BuyerPaymentStatus = 'pending';
  const eventCode = req.params.eventCode;
  const ticketZone = req.query.cZone;
  const ticketSeat = req.query.cSeat;

  let querySQL = `INSERT INTO EVENTS_TICKET (ticketCode, ticketPrice, BuyerName, BuyerEmail, BuyerPhone, BuyerPayment, BuyerPaymentStatus, EventCode, EventType, ticketZone, ticketSeat) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
  console.log(querySQL);
  db.run(querySQL, [ticketCode, ticketPrice, buyerName, buyerEmail, buyerPhone, BuyerPayment, BuyerPaymentStatus, eventCode, 's', ticketZone, ticketSeat], function(err) {
    if (err) {
      res.send(`alert('Got error while create your ticket'); window.location.href = '/Events/${eventCode}'`);
      console.error(err.message);
    }else {
      console.log(`Successfully inserted data into EVENTS_TICKET table.`);

    let seat = ticketSeat.split('');

    db.run(`UPDATE EVENTS_ENHYPHEN_${ticketZone} SET ${seat[0]} = '0' WHERE seatNo = ${seat[1]}`, function(err2) {
        if (err2) {
          res.send(`alert('Got error while create your ticket request'); window.location.href = '/Events/${eventCode}'`);
        } else {
          let mailSubject = `From Tiget! Hello ${buyerName}, Ticket Code for ${eventCode}`;
          let mailBody = `<h1>Hi ${buyerName}, From TiGet</h1><br>
          <p>Thank you for purchasing ticket from TiGet. Your ticket code is <h2>${ticketCode}</h2> .</p>
          <p>Your seat is <h3>${ticketZone} : ${ticketSeat}</h3></p>
          <p>Please pay the ticket price of ${ticketPrice} Bath to the following account:</p>
          <p>Paypal : tigetpayment@paypal.com
          <p>PromptPay : 1234567890</p>
          <p>Your ticket will be activated after payment is confirmed.</p><br>
          <a href='http://10.4.53.25:3444/Ticket'>Check your ticket here</a>
          <p>Thank you for using TiGet</p><br>
          <p>Regards,</p>
          <p>TiGet Team</p>
          
          `
          mailer(buyerEmail, mailSubject, mailBody, ticketPrice);
          res.send(`alert('Ticket pending, please check your email to comfirm your payment details and activate ticket code'); window.location.href = '/Events/${eventCode}'`);
        }
      });

    }
  });
})

//finished for sqlite
router.get('/Ticket/checkTicket', (req, res) => {
  let ticketCode = req.query.ticketCode;
  let querySQL = `SELECT * FROM EVENTS_TICKET WHERE ticketCode = '${ticketCode}';`;
  db.all(querySQL, [], (err, rows) => {
    if(err) {
      console.log(err.message);
      res.send(`alert('Got error while checking your ticket'); window.location.href = '/Ticket'`);
    }
    else {
      console.log(rows);
      if(rows.length === 0) {
        const notFound = {
          ticketCode: 'not found',
          ticketPrice: 'not found',
          BuyerName: 'not found',
          BuyerEmail: 'not found',
          BuyerPhone: 'not found',
          BuyerPayment: 'not found',
          BuyerPaymentStatus: 'not found',
          EventCode: 'not found'
        };
        res.render(path.join(__dirname + `/./dist/ticket_status.ejs`), { status: 'not found' , ticketData: notFound});
      } else {
        
        res.render(path.join(__dirname + `/./dist/ticket_status.ejs`), { status: 'found', ticketData: rows[0] })  ;
      }
    }
  });
});

//finished for sqlite
router.get('/watchOnline', (req, res) => {
  res.render(path.join(__dirname + `/./dist/event_watchonline.ejs`));
});

//finished for sqlite
router.get('/watchOnline/Live', (req, res) => {
  let ticketCode = req.query.ticketCode;
  if(ticketCode === undefined) {
    res.send(`alert('Ticket code not found ,Please enter your ticket code or contact us'); window.location.href = '/watchOnline'`)
  }else if(ticketCode.startsWith('S')) {
    res.send(`alert('Ticket code is not for online event, Please enter your ticket code or contact us'); window.location.href = '/watchOnline'`);
  }else{
    let result1;
  let querySQL = `SELECT * FROM EVENTS_TICKET WHERE ticketCode = '${ticketCode}';`;
  db.all(querySQL, [], (err, rows) => {
    if(err) {
      console.log(err);
      res.send(`alert('ticket code not found, Please enter your ticket code or contact us'); window.location.href = '/watchOnline'`);
    }
    else {
      console.log(rows);
      if(rows.length === 0) {
        res.send(`alert('Ticket not found, Please enter your ticket code or contact us'); window.location.href = '/watchOnline'`);
      } else {
        let eventCode = rows[0].EventCode;
        let sqlQuery2 = `SELECT * FROM EVENTS_ONLINE_LIVE WHERE EventCode = '${eventCode}';`;
        db.all(sqlQuery2, [], (err2, rows2) => {
          if(err2) {
            console.log(err2);
            res.send(`alert('Event not found, Please enter your ticket code or contact us'); window.location.href = '/watchOnline'`);
          }
          else {
            console.log(rows2);
            res.render(path.join(__dirname + `/./dist/event_live.ejs`), { CODE: rows2[0].EventCode, LiveLink: rows2[0].LiveLink })  ;
        }});
      }
    }
  });
  }
  
});

//finished for sqlite
router.get('/seat', (req, res) => {
  let eventZone = req.query.eventZone;
  let price;
  if(eventZone === 'BL' || eventZone === 'BR' || eventZone === 'SE' || eventZone === 'SK') {
    price = 6300;
  } else if(eventZone === 'SC' || eventZone === 'SM') {
    price = 6500;
  }


  let querySQL = `SELECT * FROM EVENTS_ENHYPHEN_${eventZone};`;
  db.all(querySQL, [], (err, rows) => {
    if(err) {
      console.log(err.message);
      res.send(`alert('Event not found please contact us for more information'); window.location.href = '/Events'`);
    }
    else {
      console.log(rows);
      res.render(path.join(__dirname + `/./dist/ticket_enhypen_seat.ejs`), { seatData: rows , Zone: eventZone, Price: price }) ;
    }
  });
});

//express server config and start
app.use(express.static(path.join(__dirname, "/./dist")));
app.use(express.static(path.join(__dirname, "/./dist/index")));
app.use('/qr', express.static(path.join(__dirname, "/./dist/assets/paymentImg")));
app.use('/figmaAssets', express.static(path.join(__dirname, "/./dist/figmaAssets")));
app.use('/Events/figmaAssets', express.static(path.join(__dirname, "/./dist/figmaAssets")));
app.use('/watchOnline/figmaAssets', express.static(path.join(__dirname, "/./dist/figmaAssets")));
app.use('/Ticket/figmaAssets', express.static(path.join(__dirname, "/./dist/figmaAssets")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", router);
const server = app.listen(portServer, hostServer, () => {
  console.log(`Listening on http://${server.address().address}:${server.address().port}`);
});

//admin zone
const adminClient = express.Router();

adminClient.get('/', (req, res) => { 
  res.write('<h1>Admin Access key</h1>');
  res.write('<form action="/admin/login" method="get">');  
  res.write('<input type="text" name="accessKey" placeholder="Enter access key">');
  res.write('<input type="submit" value="Submit">');  
  res.write('</form>');
  res.end();
 });

adminClient.get('/login', (req, res) => {
  let accessKey = req.query.accessKey;
  if(accessKey === 'tiget1234') {
    res.redirect(`/admin/link/${accessKey}`);
  }else {
    res.write('<h1>Access Denied</h1>');
    res.end();
  }
});
adminClient.get('/link/:key', (req, res) => {
  let accessKey = req.params.key;
  if(accessKey !== 'tiget1234') {
    res.write('<h1>Access Denied</h1>');
    res.end();
  }
  res.write('<h1>Admin Panel</h1>');
  res.write(`<a href="/admin/addEvents/${accessKey}">Add Events</a><br>`);
  res.write(`<a href="/admin/viewEvents/${accessKey}">View Events</a><br>`);
  res.write(`<a href="/admin/ViewAllTicket/${accessKey}">Ticket Manager</a>`);
  res.end();
} );

adminClient.get('/viewEvents/:key', (req, res) => {
  let accessKey = req.params.key;
  if(accessKey !== 'tiget1234') {
    res.write('<h1>Access Denied</h1>');
    res.end();
  }
  let querySQL = `SELECT * FROM EVENTS_LIST ORDER BY EventStatus;`;
  db.all(querySQL, [], (err, rows) => {
    if(err) {
      res.write('<h1>Something went worng!</h1>');
      res.write(`<p>${err.message}</p>`);
      res.end();
    }
    else {
      console.log(rows);
    res.render(path.join(__dirname + '/./dist/adminsys_viewevents.ejs'), { eventData: rows });
  }
});
});

adminClient.get('/addEvents/:key', (req, res) => { 
  let accessKey = req.params.key;
  if(accessKey !== 'tiget1234') {
    res.write('<h1>Access Denied</h1>');
    res.end();
  }
  res.sendFile(path.join(__dirname + '/./dist/adminsys_uploadevents.html'));
 });

 //finished for sqlite
 adminClient.get('/insertEvent/', (req, res) => {
    const EventKeyID = req.query.EventKeyID;
    const EventKeyName = req.query.EventKeyName;
    const EventTitle = req.query.EventTitle;
    const EventDesc = req.query.EventDesc;
    const EventDate = req.query.EventDate;
    let EventLocation = req.query.EventLocation;
    if(EventLocation == undefined) {
      EventLocation = 'Online';
    }
    const EventTag = `#${req.query.EventTag1}, #${req.query.EventTag2}, #${req.query.EventTag3}`;
    const EventPoster = req.query.EventPoster;
    const EventType = req.query.EventType;
    const query = `INSERT INTO EVENTS_LIST (EventKeyID, EventKeyName, EventTitle, EventDesc, EventDate, EventLocation, EventTag, EventPoster ,EventType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const values = [EventKeyID, EventKeyName, EventTitle, EventDesc, EventDate, EventLocation, EventTag, EventPoster, EventType];
console.log("Add Event \n" + values);
db.run(query, values, (err) => {
  if(err) {
    console.log(err);
    res.write('Error, some fields are wrong : ', err.sqlMessage);
    res.end();
  } else {
    res.write('<h1>Event Added</h1>');
    res.write('<a href="/admin/addEvents/tiget1234">Add More Events</a>');
    res.write('<a href="/admin/viewEvents/tiget1234">View Events</a>');
    res.end();
  }
    });
 });

//finished for sqlite3
adminClient.get('/deleteEvent/:eventKey', (req, res) => {
  const EventKeyID = req.params.eventKey;
  const selQuery = `DELETE FROM EVENTS_LIST WHERE EventKeyID = ?;`;
  db.run(selQuery, [EventKeyID], function(err) {
    if(err) {
      console.log(err.message);
      res.write('Error'+ err.message);
      res.end();
    }
    else {
      res.write(`<h1>Event Key ${EventKeyID} Deleted</h1>`);
      res.write('<a href="/admin/viewEvents/tiget1234">Back to View Events</a>');
      res.end();
    }
  });
});
 
//finished for sqlite3
adminClient.get('/editEvent/:eventKey', (req, res) => {
  const EventKeyID = req.params.eventKey;
  const selQuery = `SELECT * FROM EVENTS_LIST WHERE EventKeyID = ?;`;
  db.all(selQuery, [EventKeyID], (err, rows) => {
    if(err) {
      console.log(err.message);
      res.write('Error'+ err.message);
      res.end();
    }
    else {
      console.log(rows);
      res.render(path.join(__dirname + '/./dist/adminsys_editevents.ejs'), { eventData: rows[0] });
    }
  });
});

//finished for sqlite3
adminClient.get('/updateEvent', (req, res) => {
  const EventKeyID = req.query.EventKeyID.trim();
  const EventKeyName = req.query.EventKeyName.trim();
  const EventTitle = req.query.EventTitle.trim();
  const EventDesc = req.query.EventDesc.trim();
  const EventDate = req.query.EventDate.trim();
  const EventStatus = req.query.EventStatus.trim();
  let EventLocation = '';
  if(req.query.EventLocation == undefined) {
    EventLocation = 'Online';
  }else{
    EventLocation = req.query.EventLocation.trim();
  }
  const EventTag = `#${req.query.EventTag1}, #${req.query.EventTag2}, #${req.query.EventTag3}`.trim();
  const EventPoster = req.query.EventPoster.trim();
  const EventType = req.query.EventType.trim();
  let sqlQuery = `UPDATE EVENTS_LIST SET EventKeyName = '${EventKeyName}', EventTitle = '${EventTitle}', EventDesc = '${EventDesc}', EventDate = '${EventDate}', EventLocation = '${EventLocation}', EventTag = '${EventTag}', EventPoster = '${EventPoster}', EventType = '${EventType}',EventStatus = '${EventStatus}' WHERE EventKeyID = '${EventKeyID}';`;
  console.log(sqlQuery);

  db.run(sqlQuery, (err) => {
   if(err) {
     console.log(err.message);
     res.write('Error'+ err.message);
     res.end();
   }
   else {
     res.write(`<h1>Event Key ${EventKeyID} Updated</h1>`);
     res.write('<a href="/admin/viewEvents/tiget1234">Back to View Events</a>');
     res.end();
   }
 });
});

//finished for sqlite3
// adminClient.get('/setActive/:eventKeyID', (req, res) => {
//   const EventKeyID = req.params.eventKeyID;
//   const selQuery = `UPDATE EVENTS_LIST SET EventStatus = 'active' WHERE EventKeyID = '${EventKeyID}';`;
//   db.run(selQuery, (err) => {
//     if(err) {
//       console.log(err.message);
//       res.write('Error'+ err.message);
//       res.end();
//     }
//     else {
//       res.write(`<h1>Event Key ${EventKeyID} Set to Active</h1>`);
//       res.write('<a href="/admin/viewEvents/tiget1234">Back to View Events</a>');
//       res.end();
//     }
//   });

// });

// adminClient.get('/setDeActive/:eventKeyID', (req, res) => {
//   const EventKeyID = req.params.eventKeyID;
//   const selQuery = `UPDATE EVENTS_LIST SET EventStatus = 'deactive' WHERE EventKeyID = '${EventKeyID}';`;
//   conn.query(selQuery, (err, result) => {
//     if(err) {
//       console.log(err);
//       res.write('Error'+ err);
//       res.end();
//     }
//     else {
//       console.log(result);
//       res.write(`<h1>Event Key ${EventKeyID} Set to DeActive</h1>`);
//       res.write('<a href="/admin/viewEvents/tiget1234">Back to View Events</a>');
//       res.end();
//     }
//   });

// });

//finished for sqlite3
adminClient.get('/ViewAllTicket/:adminKey', (req, res) => {
  const adminKey = req.params.adminKey;
  if(adminKey !== 'tiget1234') {
    res.write('<h1>Wrong Admin Key Access Denied</h1>');
    res.end();
  }
    const selQuery = `SELECT * FROM EVENTS_TICKET ORDER BY BuyerPaymentStatus;`;
    db.all(selQuery,[], (err, rows) => {
      if(err) {
        console.log(err.message);
        res.write('Error'+ err.message);
        res.end();
      }else {
        console.log(rows);
        res.render(path.join(__dirname + '/./dist/adminsys_listticket.ejs'), { ticket: rows });
      }

    });

});

//finished for sqlite3
adminClient.get('/approvePayment/:ticketCode', (req, res) => {
  const ticketCode = req.params.ticketCode;
  const selQuery = `UPDATE EVENTS_TICKET SET BuyerPaymentStatus = 'approved' WHERE TicketCode = '${ticketCode}';`;
  db.run(selQuery, [],(err) => {
    if(err) {
      console.log(err.message);
      res.write('Error'+ err.message);
      res.end();
    }else {
      res.write(`<h1>Payment for Ticket Code ${ticketCode} Approved</h1>`);
      res.write('<a href="/admin/ViewAllTicket/tiget1234">Back to View Tickets</a>');
      res.end();
    }
  });
});

//finished for sqlite3
adminClient.get('/deleteTicket/:ticketCode', (req, res) => {
  const ticketCode = req.params.ticketCode;
  const selQuery = `DELETE FROM EVENTS_TICKET WHERE TicketCode = '${ticketCode}';`;
  db.run(selQuery,[], (err) => {
    if(err) {
      console.log(err.message);
      res.write('Error'+ err.message);
      res.end();
    }else {
      res.write(`<h1>Payment for Ticket Code ${ticketCode} Deleted</h1>`);
      res.write('<a href="/admin/ViewAllTicket/tiget1234">Back to View Tickets</a>');
      res.end();
    }
  });

});

adminClient.get('/addLive/:adminkey', (req, res) => {
  const adminkey = req.params.adminkey;
  if(adminkey !== 'tiget1234') {
    res.write('<h1>Wrong Admin Key Access Denied</h1>');
    res.end();
  }
  res.render(path.join(__dirname + '/./dist/adminsys_addlivelink.ejs'));
});

adminClient.get('/addlivelink/:adminkey', (req, res) => {
    const eventCode = req.query.eventCode.trim();
    const liveLink = req.query.eventLink.trim();
    const adminkey = req.params.adminkey;
    if(adminkey !== 'tiget1234') {
      res.write('<h1>Wrong Admin Key Access Denied</h1>');
      res.end();
    }
    const selQuery = `UPDATE EVENTS_ONLINE_LIVE SET LiveLink = '${liveLink}' WHERE EventCode = '${eventCode}';`;
    db.run(selQuery, [],(err) => {
      if(err) {
        console.log(err.message);
        res.write('Error'+ err.message);
        res.end();
      }else {
        res.write(`<h1>Live Link for Event Code ${eventCode} Added</h1>`);
        res.write('<a href="/admin/viewEvents/tiget1234">Back to View Events</a>');
        res.end();
      }
    });
});


app.use('/admin', adminClient);


module.exports = app;