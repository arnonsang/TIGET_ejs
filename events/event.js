const mysql = require('mysql');
const { host, user, password, database } = require('../config/sqlconfig.js');
const conn = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database   
});

conn.connect((err) => {
    if (err) throw err;
    console.log('Connected to DB!');
    logger('Database', 'success', 'Connected to DB!')
});

const createEventTable = () => {
    const tableQuery = [
        //MAIN TABLE    
        `CREATE TABLE IF NOT EXISTS EVENTS (
            EventID int(11) NOT NULL AUTO_INCREMENT,
            EventCode varchar(10) NOT NULL UNIQUE,
            EventKeyName varchar(20) NOT NULL UNIQUE,
            EventName varchar(255) NOT NULL,
            EventDesc text NOT NULL,
            EventDate date NOT NULL,
            EventTime time NOT NULL,
            EventTag varchar(255) NOT NULL,
            EventImage varchar(255) NOT NULL,
            EventLocation varchar(255) NOT NULL, 
            EventOrganizer varchar(255) NOT NULL,
            EventPlan text,
            PRIMARY KEY (EventID)
            );`,
            //TABLE FOR GDA
            `CREATE TABLE IF NOT EXISTS EVENTS_GDA (
                ticketZone char(3) NOT NULL,
                ticketZoneColor varchar(255) NOT NULL,
                ticketPrice int(4) NOT NULL,
                ticketQuantity int(5) NOT NULL,
                ticketSold int(5) NOT NULL DEFAULT 0,
                ticketAvailable int(5) NOT NULL ,
                PRIMARY KEY (ticketZone)
                );`,
            //TABLE FOR UJUCODENAME
            `CREATE TABLE IF NOT EXISTS EVENTS_UJUCODENAME (
                ticketID int(11) NOT NULL AUTO_INCREMENT,
                ticketPrice int(4) NOT NULL,
                ticketQuantity int(5) NOT NULL,
                ticketSold int(5) NOT NULL DEFAULT 0,
                ticketAvailable int(5) NOT NULL ,
                PRIMARY KEY (ticketID)
                );`,
            //TABLE FOR ONLINE_EVENT
            `CREATE TABLE IF NOT EXISTS EVENTS_ONLINE (
                ticketCode varchar(255) NOT NULL,
                ticketPrice int(4) NOT NULL,
                BuyerName varchar(255) NOT NULL,
                BuyerEmail varchar(255) NOT NULL,
                BuyerPhone varchar(16) NOT NULL,
                BuyerPayment varchar(20) NOT NULL,
                BuyerPaymentStatus varchar(20) NOT NULL,
                BuyerPaymentDate datetime,
                EventCode varchar(10) NOT NULL,
                PRIMARY KEY (ticketCode),
                FOREIGN KEY (EventCode) REFERENCES EVENTS(EventKeyName)
                );`,
            //TABLE FOR ONSITE_EVENT
            `CREATE TABLE IF NOT EXISTS EVENTS_ONSITE (
                ticketCode varchar(255) NOT NULL,
                ticketZone char(3) NOT NULL,
                ticketZoneColor varchar(255) NOT NULL,
                ticketPrice int(4) NOT NULL,
                BuyerName varchar(255) NOT NULL,
                BuyerEmail varchar(255) NOT NULL,
                BuyerPhone varchar(16) NOT NULL,
                BuyerPayment varchar(20) NOT NULL,
                BuyerPaymentStatus varchar(20) NOT NULL,
                BuyerPaymentDate datetime NOT NULL,
                EventCode varchar(10) NOT NULL,
                PRIMARY KEY (ticketCode),
                FOREIGN KEY (EventCode) REFERENCES EVENTS(EventCode)
                );`
    ]
    const tableNameList = ['Main Event Table','GDA Table','UJUCODENAME Table','Online Event Table','Onsite Event Table'];
    for(let i = 0; i < tableQuery.length; i++){
        conn.query(tableQuery[i], (err, result) => {
            if(err) throw err;
            logger('createEventTable', 'success', `Table ${i+1} created : ${tableNameList[i]}`)
        });
};
}

const testEventInsert = () => {
    const testEventQuery = [`INSERT INTO EVENTS (EventCode, EventName, EventKeyName, EventDesc, EventDate, EventTime, EventTag, EventImage, EventLocation, EventOrganizer, EventPlan) 
    VALUES ('7jiiuj0m8V', '37th Golden Disc Awards','GDA' , 'The 37th GOLDEN DISC AWARDS will be coming to Bangkok, Thailand for the first time! 
    Stay tuned for the lineup and further updates!', '2023-01-07', '14:00:00', '#K-POP, #JTBC, #BANGKOK', 'https://pbs.twimg.com/media/FiuANOwacAcluun?format=jpg&name=large', 'RAJAMANGALA NATIONAL STADIUM', 'APPLEWOOD Thailand', 'https://thethaiger.com/th/wp-content/uploads/2022/11/%E0%B8%A3%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%9A%E0%B8%B1%E0%B8%95%E0%B8%A3-Golden-Disc-Awards-2023-2.jpg?ezimgfmt=ng:webp/ngcb46');
    `,`
    INSERT INTO EVENTS (EventCode, EventName, EventKeyName,  EventDesc, EventDate, EventTime, EventTag, EventImage, EventLocation, EventOrganizer, EventPlan) 
VALUES ('o4FtgZZB9X', '2022 WJSN WJSN FAN-CON <CODENAME : UJUNG>','UJUCODENAME' , '"One day, SOS from UJUNG?!"
Operation codename is <CODENAME: UJUNG>.
The WJ Detectives are now engaged in a struggle to protect their UJUNG.
At the place where special stages and secret masterpieces are prepared,
Missions must be done one by one to save UJUNG who have been waiting for WJSN for so long.
The operation <CODENAME: UJUNG> will soon begin. ', '2023-01-07', '15:00:00', '#K-POP, #WJSN, #UJUNG', 'https://static.beyondlive.com/contents/fe90d12645fd4f8fa42519a62abd6371.jpg', 'BLUE SQUARE Mastercard Hall', 'StartShip Entertainment', '');`
    ];
    for(let i = 0; i < testEventQuery.length; i++){
        conn.query(testEventQuery[i], (err, result) => {
            if(err) throw err;
            logger('testEventInsert', 'success', `Test Event ${i} inserted`);
        });
    }
    
};

//fetch custom event by key
const fetchEvent = (eventCode) => {
    const querySQL = `SELECT EventName, EventName, EventDesc, EventDate, EventTime, EventTag, EventImage, EventLocation, EventOrganizer 
    FROM EVENTS WHERE EventCode = '${eventCode}';`;
    conn.query(querySQL, (err, result) => {
        if(err) throw err;
        logger('fetchEvent', 'success', `Event ${eventCode} fetched`);
        return result;
    });
};

//Generate a random key with length
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

//Logger
const logger  = (where, status, what) => {  console.log(`[${where}] : ${status} : ${what}`);  };

module.exports = {  createEventTable, testEventInsert, keyGen, logger, fetchEvent};
