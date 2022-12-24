const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../db/tigetDatabase.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});


const createTableSQL = [`
CREATE TABLE EVENTS_LIST (
  EventKeyID varchar(12) NOT NULL PRIMARY KEY,
  EventKeyName varchar(12) UNIQUE NOT NULL,
  EventTitle varchar(255) NOT NULL,
  EventDate date NOT NULL,
  EventLocation varchar(255) DEFAULT 'ONLINE',
  EventDesc text NOT NULL,
  EventTag text NOT NULL,
  EventPoster text NOT NULL,
  EventType varchar(12) DEFAULT 'online',
  EventStatus varchar(12) DEFAULT 'deactive' NOT NULL
);`,
`
CREATE TABLE EVENTS_TICKET (
    ticketCode varchar(255) PRIMARY KEY NOT NULL,
    ticketPrice INTEGER NOT NULL,
    BuyerName varchar(255) NOT NULL,
    BuyerEmail varchar(255) NOT NULL,
    BuyerPhone varchar(16) NOT NULL,
    BuyerPayment varchar(20) NOT NULL,
    BuyerPaymentStatus varchar(20) NOT NULL,
    BuyerPaymentDate datetime,
    EventCode varchar(20) NOT NULL,
    EventType char(1) DEFAULT 'o',
    ticketZone varchar(3),
    ticketSeat varchar(3),
    FOREIGN KEY(EventCode) REFERENCES EVENTS_LIST(EventKeyName)
  );`,

  `
CREATE TABLE EVENTS_ONLINE (
  ticketCode varchar(255) PRIMARY KEY NOT NULL,
  ticketPrice INTEGER NOT NULL,
  BuyerName varchar(255) NOT NULL,
  BuyerEmail varchar(255) NOT NULL,
  BuyerPhone varchar(16) NOT NULL,
  BuyerPayment varchar(20) NOT NULL,
  BuyerPaymentStatus varchar(20) NOT NULL,
  BuyerPaymentDate datetime,
  EventCode varchar(10) NOT NULL,
  ticketZone varchar(3),
  ticketSEAT varchar(3),
  FOREIGN KEY(EventCode) REFERENCES EVENTS_LIST(EventKeyName)
);`,

`CREATE TABLE EVENTS_ONLINE_LIVE (
    EventCode varchar(20) NOT NULL PRIMARY KEY,
    LiveLink text NOT NULL);`,

`
CREATE TABLE EVENTS_ENHYPHEN_BL (
  seatNo INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  a INTEGER(1) DEFAULT 1 NOT NULL,
  b INTEGER(1) DEFAULT 1 NOT NULL,
  c INTEGER(1) DEFAULT 1 NOT NULL,
  d INTEGER(1) DEFAULT 1 NOT NULL,
  e INTEGER(1) DEFAULT 1 NOT NULL,
  f INTEGER(1) DEFAULT 1 NOT NULL,
  g INTEGER(1) DEFAULT 1 NOT NULL,
  h INTEGER(1) DEFAULT 1 NOT NULL,
  i INTEGER(1) DEFAULT 1 NOT NULL
);`,

`
CREATE TABLE EVENTS_ENHYPHEN_BR (
  seatNo INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  a INTEGER(1) DEFAULT 1 NOT NULL,
  b INTEGER(1) DEFAULT 1 NOT NULL,
  c INTEGER(1) DEFAULT 1 NOT NULL,
  d INTEGER(1) DEFAULT 1 NOT NULL,
  e INTEGER(1) DEFAULT 1 NOT NULL,
  f INTEGER(1) DEFAULT 1 NOT NULL,
  g INTEGER(1) DEFAULT 1 NOT NULL,
  h INTEGER(1) DEFAULT 1 NOT NULL,
  i INTEGER(1) DEFAULT 1 NOT NULL
);`,

`
CREATE TABLE EVENTS_ENHYPHEN_RC (
  seatNo INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  a INTEGER(1) DEFAULT 1 NOT NULL,
  b INTEGER(1) DEFAULT 1 NOT NULL,
  c INTEGER(1) DEFAULT 1 NOT NULL,
  d INTEGER(1) DEFAULT 1 NOT NULL,
  e INTEGER(1) DEFAULT 1 NOT NULL,
  f INTEGER(1) DEFAULT 1 NOT NULL,
  g INTEGER(1) DEFAULT 1 NOT NULL,
  h INTEGER(1) DEFAULT 1 NOT NULL,
  i INTEGER(1) DEFAULT 1 NOT NULL
);`,

`
CREATE TABLE EVENTS_ENHYPHEN_SC (
  seatNo INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  a INTEGER(1) DEFAULT 1 NOT NULL,
  b INTEGER(1) DEFAULT 1 NOT NULL,
  c INTEGER(1) DEFAULT 1 NOT NULL,
  d INTEGER(1) DEFAULT 1 NOT NULL,
  e INTEGER(1) DEFAULT 1 NOT NULL,
  f INTEGER(1) DEFAULT 1 NOT NULL,
  g INTEGER(1) DEFAULT 1 NOT NULL,
  h INTEGER(1) DEFAULT 1 NOT NULL,
  i INTEGER(1) DEFAULT 1 NOT NULL
);`,

`
CREATE TABLE EVENTS_ENHYPHEN_SE (
  seatNo INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  a INTEGER(1) DEFAULT 1 NOT NULL,
  b INTEGER(1) DEFAULT 1 NOT NULL,
  c INTEGER(1) DEFAULT 1 NOT NULL,
  d INTEGER(1) DEFAULT 1 NOT NULL,
  e INTEGER(1) DEFAULT 1 NOT NULL,
  f INTEGER(1) DEFAULT 1 NOT NULL,
  g INTEGER(1) DEFAULT 1 NOT NULL,
  h INTEGER(1) DEFAULT 1 NOT NULL,
  i INTEGER(1) DEFAULT 1 NOT NULL
);`,

`
CREATE TABLE EVENTS_ENHYPHEN_SK (
  seatNo INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  a INTEGER(1) DEFAULT 1 NOT NULL,
  b INTEGER(1) DEFAULT 1 NOT NULL,
  c INTEGER(1) DEFAULT 1 NOT NULL,
  d INTEGER(1) DEFAULT 1 NOT NULL,
  e INTEGER(1) DEFAULT 1 NOT NULL,
  f INTEGER(1) DEFAULT 1 NOT NULL,
  g INTEGER(1) DEFAULT 1 NOT NULL,
  h INTEGER(1) DEFAULT 1 NOT NULL,
  i INTEGER(1) DEFAULT 1 NOT NULL
);`,

`
CREATE TABLE EVENTS_ENHYPHEN_SM (
  seatNo INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  a INTEGER(1) DEFAULT 1 NOT NULL,
  b INTEGER(1) DEFAULT 1 NOT NULL,
  c INTEGER(1) DEFAULT 1 NOT NULL,
  d INTEGER(1) DEFAULT 1 NOT NULL,
  e INTEGER(1) DEFAULT 1 NOT NULL,
  f INTEGER(1) DEFAULT 1 NOT NULL,
  g INTEGER(1) DEFAULT 1 NOT NULL,
  h INTEGER(1) DEFAULT 1 NOT NULL,
  i INTEGER(1) DEFAULT 1 NOT NULL
);`



];
for (let i = 0; i < createTableSQL.length; i++) {
  db.run(createTableSQL[i], (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Table '+ i + ' created successfully');
  });
}

db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });