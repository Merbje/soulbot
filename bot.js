require('dotenv').config();
const moment = require('moment-timezone');
const pg = require('pg');
const Discord = require('discord.js');
let oneconnect = false;
let nodbconnect = false;
const discord = new Discord.Client();

//Channels
const jazzlounge = process.env.JAZZLOUNGE;
const soulchannel = process.env.SOULCHANNEL;
const farm = process.env.FARM;
const general = process.env.GENERAL;
const eventchannel = process.env.EVENTCHANNEL;
const tempchannel = '707158336876838913';

//Session
let sessionHost = '';
let sessionTime = '';
let sessionDesc = '';
let previousComment = '';

//Emotes
const vinkje = process.env.VINKJE;
const cross = process.env.CROSS;
const plusone = process.env.PLUSONE;

//People
// const chev = process.env.CHEV;
const panda = process.env.PANDA;
const controller = process.env.CONTROLLER;

//Ranks
const farmrole = process.env.FARMROLE;
const member = process.env.MEMBER;
const friend = process.env.FRIEND;
const memberrole = '<@&' + process.env.MEMBER + '>';
const friendrole = '<@&' + process.env.FRIEND + '>';

//Messages
const farmmessage = 'To ease the organization of farming groups we have a dedicated' +
    ' discord channel where players can form parties and announce farming events' +
    ' to leechers using bot commands. In order to be acknowledged as a carry and' +
    ' gain access to the farm channel you must meet one of the following criteria:\n\n' +
    '1)\tHave an Enutrof with the following characteristics:\n' +
    '\t-\tLevel: 190\n' +
    '\t-\tInitiative: 8000\n\n' +
    '2)\tHave a Cra with the following characteristics:\n' +
    '\t-\tLevel: 200\n' +
    '\t-\tIntelligence + Power: 1400\n\n' +
    '3)\tHave a Sram with the following characteristics:\n' +
    '\t-\tLevel: 120\n' +
    '\t-\tInitiative: 5000\n\n' +
    '4)\tHave a Sadida with the following characteristics:\n' +
    '\t-\tLevel: 198\n' +
    '\t-\tStrength + Power: 1200\n\n' +
    'A cumulative criterium is that you have selected your class in the #select-your-class channel.\n' +
    '\n' +
    'If you find yourself eligible you may respond with **!eligible** - the Bonabot will grant you access to the farm-channel';


//Lists
const soulmobs = ['Crab', 'Beaztinga',
    'Weirbwork', 'Primitive Cemetery', "Agony V''Helley",
    'Cromagmunk', 'Mopy King', 'Watchamatrich', 'Coral Beach', 'Canopy Village', 'Demonic Rose', 'Astrub Cemetery', 'Tofu'];
const mobs = 'the following mobs are allowed, between () is the shorter input:\n' +
    '| **Crab** (crab) | **Beaztinga** (beaz) | **Weirbwork** (weir) | **Primitive Cemetery** (cemetery) | **Agony V\'Helley** (agony) ' +
    '| **Cromagmunk** (croma) | **Mopy King** (mopy) | **Watchamatrich** (watcha) | **Canopy Village** (zoth) | **Coral Beach** (craboral) | **Demonic Rose** (rose) | **Astrub Cemetery** (ouas) | **Tofu** (tofu) |';
const commands = ['!addsoul [mob] [amount]', '!deletesoul [all:mob] [OPT: amount]', '!mysouls', '!allsouls', '!viewsouls [user]', '!moblist', '!buyin [small] [average] [big] [gigantic]'];
const conString = process.env.APITOKEN;

let client = new pg.Client(conString);

discord.on('ready', () => {
    console.log('Logged in as soulBotForDofus!');
    discord.user.setActivity('!help', {type: "LISTENING"});
    // discord.channels.get(requirements).send(`__**Sheduled Event**__\n<@${ultra}> and <@${chev}> are organizing a **Tynril dungeon farming session** from **19:30** till approximately **22:00** (dofus time). Everyone is welcome to join. Be sure to always have keys ready.  Participants may be replaced halfway throughout the event if there is high demand. \nRespond with a <:plusone:674594462726357012> if you would like to join.\n${memberrole}${friendrole}`).then(reactions => { reactions.react(plusone).catch();});

        var dayMillseconds = 1000 * 60 * 5;
        setInterval(function(){
            if(moment.tz('UTC').day() === 1 && moment.tz('Europe/Paris').hour() === 10 && moment.tz('Europe/Paris').minute() < 5) {
                const now = moment.tz('Europe/Paris');
                let eventFormat = now.format('YYYY-MM-DD') + ' 20:00:00';
                const eventTime = moment.tz(eventFormat, 'Europe/Paris').tz('UTC').format('YYYY-MM-DD HH:mm:ss');
                discord.channels.get(eventchannel).send(`__**Sheduled Event**__\n<@${controller}> and <@${panda}> are organizing a **tynril dungeon farming session** from **20:00** until approximately **22:00** (dofus time). Everyone is welcome to join. Be sure to always have keys ready.  Participants may be replaced halfway throughout the event if there is high demand.\nRespond with <:plusone:674594462726357012> if you would like to join.\n${memberrole} ${friendrole}`).then(reactions => { reactions.react(plusone).catch();
                    insertNewEvent(`INSERT INTO events(messageID, time) VALUES ('${reactions.id}', '${eventTime}')`, () => {});
                });
            // } else if(moment.tz('UTC').day() === 3 && moment.tz('Europe/Paris').hour() === 10 && moment.tz('Europe/Paris').minute() < 5) {
            //     const now = moment.tz('Europe/Paris');
            //     let eventFormat = now.format('YYYY-MM-DD') + ' 19:00:00';
            //     const eventTime = moment.tz(eventFormat, 'Europe/Paris').tz('UTC').format('YYYY-MM-DD HH:mm:ss');
            //     discord.channels.get(eventchannel).send(`__**Sheduled Event!**__\n<@${controller}> is organizing a **small soul session** from **19:00** until approximately **21:00** (dofus time). People that meet the requirements shown in the souls document *"small souls"* will have priority in selection.\nRespond with <:plusone:674594462726357012> if you would like to join.\n${memberrole} ${friendrole}`).then(reactions => { reactions.react(plusone).catch();
            //         insertNewEvent(`INSERT INTO events(messageID, time) VALUES ('${reactions.id}', '${eventTime}')`, () => {});
            //     });
             } else if(moment.tz('UTC').day() === 5 && moment.tz('Europe/Paris').hour() === 10 && moment.tz('Europe/Paris').minute() < 5) {
                const now = moment.tz('Europe/Paris');
                let eventFormat = now.format('YYYY-MM-DD') + ' 20:00:00';
                const eventTime = moment.tz(eventFormat, 'Europe/Paris').tz('UTC').format('YYYY-MM-DD HH:mm:ss');
                discord.channels.get(eventchannel).send(`__**Sheduled Event!**__\n<@${controller}> and <@${panda}> are organizing a **tynril and big souls session** from **20:00** until approximately **22:00** (dofus time). People with souls that meet the requirements shown in the souls document *"big souls"* will have priority in selection.\nRespond with <:plusone:674594462726357012> if you would like to join.\n${memberrole} ${friendrole}`).then(reactions => { reactions.react(plusone).catch();
                    insertNewEvent(`INSERT INTO events(messageID, time) VALUES ('${reactions.id}', '${eventTime}')`, () => {});
                });
            }
            queryRun('select * from events', (events) => {

                let currentTime = moment.tz('Europe/Paris').add(-2, 'hours');
                for (let i = 0; i < events.length; i++) {
                    const eventTime = moment.tz(events[i].time, 'UTC');
                    if (eventTime < currentTime) {
                        discord.channels.get(eventchannel).fetchMessage(events[i].messageid).then(msg => msg.delete());
                        queryRun(`DELETE FROM events WHERE messageid = '${events[i].messageid}'`, () => {});
                    }
                }
            });
        }, dayMillseconds);
});

discord.on('message', msg => {
    if (msg.channel.type !== "dm") {
        if (msg.content.startsWith('!')) {
            if (oneconnect === false) {
                oneconnect = true;
                setTimeout(function () {
                    oneconnect = false;
                }, 1500);
                let user = msg.author.username;
                try {
                    if (msg.author.lastMessage.member.nickname !== null) {
                        user = msg.author.lastMessage.member.nickname;
                    }
                } catch (e) {

                }
                let args = msg.content.substring(1).split(' ');

                if (args[2] !== undefined) {
                    switch (args[2].toLowerCase()) {
                        case 'cemetery':
                        case "v'helley":
                        case 'village':
                        case 'rose':
                        case 'beach':
                        case 'king':
                            args[1] = args[1] + ' ' + args[2];
                            for (let i = 2; i < args.length; i++) {
                                args[i] = args[i + 1];
                            }
                            break;
                    }
                }

                if (args[1] !== undefined && args[0] !== 'viewsouls' && (args[0] !== 'deletesoul' || msg.channel.id !== '675785176667783179') && (args[0] !== 'addsoul' || msg.channel.id !== '675785176667783179')) {
                    args[1] = args[1].toLowerCase();
                }

                for (let i = 1; i < args.length; i++) {
                    switch (args[i]) {
                        case 'demonic rose':
                        case 'rose':
                            args[i] = 'Demonic Rose';
                            break;
                        case 'astrub cemetery':
                        case 'ouas':
                            args[i] = 'Astrub Cemetery';
                            break;
                        case 'zoth':
                        case 'canopy village':
                            args[i] = 'Canopy Village';
                            break;
                        case 'craboral':
                        case 'coral beach':
                            args[i] = 'Coral Beach';
                            break;
                        case 'crab' :
                            args[i] = 'Crab';
                            break;
                        case 'beaz' :
                        case 'beaztinga' :
                            args[i] = 'Beaztinga';
                            break;
                        case 'tofu':
                            args[i] = "Tofu";
                            break;
                        case 'weir' :
                        case 'weirbwork' :
                            args[i] = 'Weirbwork';
                            break;
                        case 'cemetery' :
                        case 'primitive cemetery':
                            args[i] = 'Primitive Cemetery';
                            break;
                        case 'agony' :
                        case "agony v'helley" :
                            args[i] = "Agony V''Helley";
                            break;
                        case 'croma' :
                        case 'cromagmunk' :
                            args[i] = 'Cromagmunk';
                            break;
                        case 'mopy' :
                        case 'mopy king' :
                            args[i] = 'Mopy King';
                            break;
                        case 'watcha' :
                        case 'watchamatrich' :
                            args[i] = 'Watchamatrich';
                            break;
                    }
                }
                if (msg.channel.id === soulchannel) {
                    switch (args[0]) {
                        //===================================================================//
                        case 'addsoul':
                        case 'add':
                        case 'addsouls':
                            if (verifyMob(args[1]) && verifyAmount(args[2])) {
                                let check = args[2].split(',');
                                args[2] = check[0];
                                getSoulsPerUser(user, function (result) {
                                    let dubbel = false;
                                    for (let i = 0; i < result.length; i++) {
                                        if (result[i]['soulmob'] === "Agony V'Helley") {
                                            result[i]['soulmob'] = "Agony V''Helley";
                                        }

                                        if (result[i]['soulmob'] === args[1]) {
                                            dubbel = true;
                                        }
                                    }
                                    if (dubbel === false) {
                                        postSoulsPerUser(user, args[1], args[2]);
                                        msg.react(vinkje).then();
                                    } else {
                                        updateSoulByUser(user, args[1], args[2]);
                                        msg.react(vinkje).then();
                                    }
                                });
                            } else {
                                msg.react(cross).then();
                            }
                            break;
                        //===================================================================//
                        case 'mysouls':
                            getSoulsPerUser(user, function (result) {
                                let bericht = 'you have the following souls:\n';
                                for (let i = 0; i < result.length; i++) {
                                    if (i === 0) {
                                        bericht += '| '
                                    }
                                    let mob = '**' + result[i]['soulmob'] + '**';
                                    let amount = result[i]['amount'];
                                    bericht += mob + ' - ' + amount + ' | ';
                                }
                                msg.reply(bericht).then();
                            });
                            break;
                        //===================================================================//
                        case 'deletesoul':
                        case 'delete':
                        case 'deletesouls':
                            let mob = '';
                            if (args[1] !== undefined) {
                                mob = args[1];
                            }
                            let amount = 0;
                            try {
                                amount = -parseInt(args[2]);
                            } catch (TypeError) {
                                msg.react(cross).then();
                            }
                            if (mob.toLowerCase() !== 'pola') {
                                if (mob.toLowerCase() === 'all') {
                                    deleteAllSoulsByUser(user);
                                    msg.react(vinkje).then();
                                } else if (verifyMob(mob) && !Number.isNaN(amount)) {
                                    getSoulsPerUser(user, function (result) {
                                        let waar = false;
                                        for (let i = 0; i < result.length; i++) {
                                            if (result[i]['soulmob'] === "Agony V'Helley") {
                                                result[i]['soulmob'] = "Agony V''Helley";
                                            }

                                            if (result[i]['soulmob'] === mob) {
                                                waar = true;
                                            }
                                        }
                                        if (waar === true) {
                                            updateSoulByUser(user, mob, amount);
                                            if (mob === "Agony V''Helley") {
                                                mob = "Agony V'Helley";
                                            }
                                            msg.react(vinkje).then();
                                        } else {
                                            msg.react(cross).then();
                                        }
                                    });
                                } else if (verifyMob(mob)) {
                                    deleteSoulByUser(user, mob);
                                    if (mob === "Agony V''Helley") {
                                        mob = "Agony V'Helley";
                                    }
                                    msg.react(vinkje).then();
                                } else if (amount === 0) {
                                    msg.react(cross).then();
                                } else {
                                    msg.react(cross).then();
                                }

                            } else {
                                msg.reply("As Polarizing is getting kicked out of the guild, Pandabear rises to the throne!").then();
                            }
                            break;
                        //===================================================================//
                        case 'moblist':
                            msg.reply(mobs).then();
                            break;
                        //===================================================================//
                        case 'buyin':
                            if (args.length === 5) {
                                let buyin = 0;
                                getAmountOfStones(user, function (result) {
                                    for (let i = 0; i < result.length; i++) {
                                        if (result[i]['stone'] === 'small') {
                                            buyin += result[i]['sum'] * args[1];
                                        } else if (result[i]['stone'] === 'average') {
                                            buyin += result[i]['sum'] * args[2];
                                        } else if (result[i]['stone'] === 'big') {
                                            buyin += result[i]['sum'] * args[3];
                                        } else if (result[i]['stone'] === 'gigantic') {
                                            buyin += result[i]['sum'] * args[4];
                                        }
                                    }
                                    buyin = buyin / 8;
                                    msg.reply(buyin).then();
                                });
                            } else {
                                msg.reply('wrong use of command, please consult !help').then();
                            }
                            break;
                        //===================================================================//
                        case 'help' :
                            help();
                            // msg.author.send("list of commands:\n**" +
                            //     commands[0] + "** adds a soul or updates an already existing soul.\n**" +
                            //     commands[1] + "** deletes souls\n**" +
                            //     commands[2] + "** displays all your registered souls\n**" +
                            //     commands[5] + "** displays the list of all the mobs we soul\n**" +
                            //     commands[6] + "** calculates your buy in based on your souls (you must enter 4 prices)", {
                            //     files: [
                            //         "./end.png"
                            //     ]
                            // }).then();
                            // msg.react(vinkje).then();
                            break;
                        default:
                            msg.react("❓").then();
                    }
                }
                if (msg.channel.id === jazzlounge || msg.channel.id === '707158336876838913') {
                    let bericht = '';
                    let berichtLang = [''];
                    let berichtnmr = 0;
                    let peoplePerMessage = 0;
                    let userreply = '';

                    user = args[1];


                        // queryRun('SELECT DISTINCT username FROM userssouls ORDER BY username', function (result) {
                        //     for (let i = 0; i < result.length; i++) {
                        //         if (user.toLowerCase() === result[i]['username'].toLowerCase()) {
                        //             console.log('match!');
                        //             user = 'testtttt';
                        //         }
                        //     }
                        // });
                    // console.log(user);
                    if (args[1] !== undefined) {
                        userreply = user[0].toUpperCase() + user.substring(1, user.length);
                    }
                    if (args[0] === 'soulsperuser') {
                        getAllSouls("SELECT * FROM userssouls ORDER BY username, soulmob", function (result) {
                            for (let i = 0; i < result.length; i++) {
                                let mob = result[i]['soulmob'];
                                let amount = ' - ' + result[i]['amount'];
                                let soulowner = result[i]['username'];
                                let updatemessage = mob + amount + ' | ';
                                if (peoplePerMessage !== 0) {
                                    if (soulowner !== result[i - 1]['username']) {
                                        if (peoplePerMessage === 20) {
                                            berichtnmr++;
                                            berichtLang[berichtnmr] = '';
                                            peoplePerMessage = 0;
                                        }
                                            berichtLang[berichtnmr] += '\n\n' + soulowner + ':\n| ';
                                            peoplePerMessage++;
                                    }
                                    berichtLang[berichtnmr] += updatemessage;
                                } else {
                                    berichtLang[berichtnmr] += soulowner + ':\n| ';
                                    berichtLang[berichtnmr] += updatemessage;
                                    peoplePerMessage++;
                                }
                            }
                            for (let i = 0; i < berichtLang.length; i++) {
                                berichtLang[i] = '```' + berichtLang[i] + '```';
                                msg.author.send(berichtLang[i]).then();
                                msg.react(vinkje).then();
                                // msg.client.channels.get(msg.channel.id).send(berichtLang[i]).then();
                            }
                        });
                    } else if (args[0] === 'allsouls') {
                        getAllSouls("SELECT * FROM userssouls ORDER BY soulmob, username", function (result) {
                            for (let i = 0; i < result.length; i++) {
                                let mob = result[i]['soulmob'];
                                let amount = ' - ' + result[i]['amount'];
                                let soulowner = result[i]['username'];
                                let updatemessage = soulowner + amount + ' | ';
                                if (i !== 0) {
                                    if (mob !== result[i - 1]['soulmob']) {
                                        bericht += '\n\n' + mob + ':\n| ';
                                    }
                                    bericht += updatemessage;
                                } else {
                                    bericht += mob + ':\n| ';
                                    bericht += updatemessage;
                                }
                            }
                            bericht = '```' + bericht + '```';
                            msg.client.channels.get(msg.channel.id).send(bericht).then();
                        });
                    } else if (args[0] === 'viewsouls') {
                        getSoulsPerUser(args[1], function (result) {
                            let bericht = userreply + ' has the following souls:\n```';
                            for (let i = 0; i < result.length; i++) {
                                if (i === 0) {
                                    bericht += '| '
                                }
                                let mob = result[i]['soulmob'];
                                let amount = result[i]['amount'];
                                bericht += mob + ' - ' + amount + ' | ';
                            }
                            bericht += '```';
                            msg.reply(bericht).then();
                        });
                    } else if (args[0] === 'deletesoul') {
                        let mob = '';
                        if (args[2] !== undefined) {
                            mob = args[2];
                        }
                        let amount = 0;
                        try {
                            amount = -parseInt(args[3]);
                        } catch (TypeError) {
                            msg.react(cross).then();
                        }
                        if (mob.toLowerCase() === 'all') {
                            deleteAllSoulsByUser(user);
                            msg.react(vinkje).then();
                        } else if (verifyMob(mob) && !Number.isNaN(amount)) {
                            getSoulsPerUser(user, function (result) {
                                let waar = false;
                                for (let i = 0; i < result.length; i++) {
                                    if (result[i]['soulmob'] === "Agony V'Helley") {
                                        result[i]['soulmob'] = "Agony V''Helley";
                                    }

                                    if (result[i]['soulmob'] === mob) {
                                        waar = true;
                                    }
                                }
                                if (waar === true) {
                                    updateSoulByUser(user, mob, amount);
                                    if (mob === "Agony V''Helley") {
                                        mob = "Agony V'Helley";
                                    }
                                    msg.react(vinkje).then();
                                } else {
                                    msg.react(cross).then();
                                }
                            });
                        } else if (verifyMob(mob)) {
                            deleteSoulByUser(user, mob);
                            if (mob === "Agony V''Helley") {
                                mob = "Agony V'Helley";
                            }
                            msg.react(vinkje).then();
                        } else if (amount === 0) {
                            msg.react(cross).then();
                        } else {
                            msg.react(cross).then();
                        }
                    } else if (args[0] === 'addsoul') {
                        let mob = args[2];
                        let amount = args[3];
                        if (verifyMob(mob) && verifyAmount(amount)) {
                            let check = amount.split(',');
                            amount = check[0];
                            getSoulsPerUser(user, function (result) {
                                let dubbel = false;
                                for (let i = 0; i < result.length; i++) {
                                    if (result[i]['soulmob'] === "Agony V'Helley") {
                                        result[i]['soulmob'] = "Agony V''Helley";
                                    }

                                    if (result[i]['soulmob'] === mob) {
                                        dubbel = true;
                                    }
                                }
                                if (dubbel === false) {
                                    postSoulsPerUser(user, mob, amount);
                                    msg.react(vinkje).then();
                                } else {
                                    updateSoulByUser(user, mob, amount);
                                    msg.react(vinkje).then();
                                }
                            });
                        } else {
                            msg.react(cross).then();
                        }
                    } else if (args[0] === 'help') {
                        msg.reply("list of MOD/ADMIN commands:\n**" +
                            commands[3] + "** displays all registered souls\n**" +
                            commands[4] + "** displays another users souls\n**" +
                            "!deletesoul [user] [all:mob] [OPT: amount]** deletes a soul from another user\n**" +
                            "!addsoul [user] [mob] [amount]** adds or updates a soul from another user\n**" +
                            "!soulsperuser** displays all registered souls per user\n" +
                            "**!removed [inactive:kicked] [username]** send kicked message to user and removes member rank"
                        ).then();
                    } else if (args[0] === 'removed') {
                        let memberid = msg.mentions.users.first().id;
                        // console.log(msg.mentions.users.first().id);
                        let members = discord.users.find(user => user.id === memberid);
                        console.log(members, "\n\n============================\n\n" , members.roles , "\n\n============================\n\n", msg.mentions.members)
                        // console.log(members);
                        // let privatemsg = msg.mentions.users.first();
                        let pm;
                        if (args[1].toLowerCase() === 'inactive') {
                            pm = ("Hey " + members + ",\n\nDue to your recent inactivity you have been removed from the guild as part of our policy. Your discord rank has been adjusted. If you plan on being more active and want to rejoin the guild feel free free to send an administrator or a recruitment officer a private message through discord.\n\nKind regards,\n\nBona Fide staff");
                        } else if (args[1].toLowerCase() === 'kicked') {
                            pm = (`Hey ${members},\n\nYou’re receiving this message because either you have been removed from the guild or we have taken notice of you taking the initiative to leave.\n\nWe’ve adjusted your discord rank to ‘Friend’, you’re still welcome to take part in our community and events and we encourage you to do so!\n\nIf you have any questions feel free to contact an Admin or Recruitment Officer.\n\nKind regards,\n\nBona Fide staff`)
                        }

                        if (args[1].toLowerCase() === 'inactive' || args[1].toLowerCase() === 'kicked') {
                            members.send(pm, {
                                files: [
                                    "./end.png"
                                ]
                            }).then();
                            members.roles.add(friend);
                            members.roles.delete(member);
                            // members.removeRole(member).catch(console.error);
                            // members.addRole(friend).catch(console.error);
                        }
                        msg.react(vinkje).then();
                    }
                }
                if (msg.channel.id === general) {
                    switch (args[0]) {
                        case "help" :
                            help();
                            break;
                        case "farm" :
                            msg.react(vinkje).then();
                            msg.author.send(farmmessage, {
                                files: [
                                    "./end.png"
                                ]
                            }).then();
                            break;
                        case "eligible" :
                            msg.member.addRole(farmrole).catch(console.error);
                            msg.react(vinkje).then();
                            break;
                        default:
                            msg.react("❓").then();
                    }
                }
            } else {
                msg.reply('There is a 1.5 second cooldown between commands').then();
            }
        }
        if (msg.channel.id === farm && !msg.author.bot) {
            let args = msg.content.split(' ');
            if (args[0] === '!help') {
                help();
            } else if (args[0] === '!event') {
                resetSession();
                sessionHost = '<@' + msg.author.id + '>';
                previousComment = "event";
                msg.client.channels.get(farm).send('Hey there! Let\'s set up a farming event and make the announcement! First off, when should we shedule the event? Reply with a digital time format including a colon in the middle (example: 21:30).');

            } else if (previousComment === 'event' && (args[0].match(/^[0-1][0-9]:[0-5][0-9]$/) || args[0].match(/^[2][0-3]:[0-5][0-9]$/)) && sessionHost === '<@' + msg.author.id + '>') {
                previousComment = 'time';
                sessionTime = args[0];
               msg.client.channels.get(farm).send('Got it. What would u like the description of the event to be?');
            } else if (previousComment === 'time' && sessionHost === '<@' + msg.author.id + '>') {
                previousComment = 'description';
                for (let i = 0; i < args.length; i++) {
                    sessionDesc += ' ' + args[i];
                }
                msg.client.channels.get(farm).send(`Excellent! Here's a summary of our event:\n\n${sessionHost} has just announced a farming event with the following description: **${sessionDesc}**. The event will be taking place at **${sessionTime}** (dofus time).\nRespond with <:plusone:674594462726357012> if you would like to join.\n@Member @Friend\n\nIf it's to your liking reply to me with **announce**, if you think we should make some adjustments reply with **cancel** and we will start over.`);
            } else if (previousComment === 'description' && sessionHost === '<@' + msg.author.id + '>') {
                if (args[0].toLowerCase() === 'announce') {
                    const now = moment.tz('Europe/Paris');
                    let eventFormat = now.format('YYYY-MM-DD') + ' ' + sessionTime + ':00';
                    // const eventTime = moment.tz(eventFormat, 'Europe/Paris').tz('UTC').format('YYYY-MM-DD hh:mm:ss');
                    msg.react(vinkje).catch();
                    msg.client.channels.get(eventchannel).send(`${sessionHost} has just announced a farming event with the following description:**${sessionDesc}**. The event will be taking place at **${sessionTime}** (dofus time).\nRespond with <:plusone:674594462726357012> if you would like to join.\n${memberrole} ${friendrole}`).then(reactions => {
                        reactions.react(plusone).catch();
                        insertNewEvent(`INSERT INTO events(messageID, time) VALUES ('${reactions.id}', '${eventFormat}')`, () => {
                        });
                    });

                } else if (args[0].toLowerCase() === 'cancel') {
                    msg.react(vinkje).catch();
                    resetSession();
                }
            }
        } else if (msg.channel.id === tempchannel && !msg.author.bot) {
            let args = msg.content.split(' ');
            switch (args[0]) {
                case 'nickname':
                    msg.member.setNickname(args[1]).then( hello => {
                        msg.delete().then();
                    });
            }
        }


        function help() {
            msg.author.send(`
Hi there! Ready to start using BonaBot, eh? Here's some info to get you started!

__<#${general}> **commands**__
**!farm** *starts the procedure of granting you access to the <#${farm}> channel*

__<#${soulchannel}> **commands**__
**!addsoul** [mob] [amount] *adds souls under your username to the BonaBot inventory*
**!deletesoul** [all:mob] [OPT: amount] *removes souls under your username from the BonaBot inventory*
**!mysouls** *displays Lists your current registered souls*
**!moblist** *lists all available mob categories and their corresponding !addsoul tag*
**!buyin** [small] [average] [big] [gigantic] *calculates a buyin based on your current registered souls (you must enter the current market prices for the different soulstones)*

__<#${farm}> **commands**__
**!event** *start to set up a customized announcement message for a farming event in the <#${eventchannel}> channel*

https://docs.google.com/spreadsheets/d/10PJIyhDvzenkKwRcTF1I8JjH9MbN9jlUILiy-fZvsOc/edit#gid=0
            `, {
                files: [
                    "./end.png"
                ]
            }).then();
            msg.react(vinkje).then();
        }
    } else if (msg.channel.type === "dm" && !msg.author.bot) {
        let args = msg.content.substring(1).split(' ');
        switch (args[0]) {
            // case "eligible" :
            //     msg.member.addRole(farmrole).catch(console.error);
            //     msg.react(vinkje).then();
            //     break;
            default:
                msg.reply("Please use commands in the corresponding channels").then();
        }
    }
});


function resetSession() {
    previousComment = '';
    sessionHost = '';
    sessionDesc = '';
    sessionTime = '';
}

function connectDB() {
    client = new pg.Client(conString);
    client.connect();
    }

function disconnectDB() {
        setTimeout(function(){
            nodbconnect = false;
            client.end();
        }, 1250);
    }

function verifyMob(mob) {
        if(soulmobs.includes(mob)){
            return true
        }
    }

function verifyAmount(amount) {
        try {
            let isNumber = parseInt(amount);
            if (isNumber > 0 && amount.length < 8) {
                return true;
            }
        } catch (TypeError) {
            throw "not valid";

        }
    }

function getAmountOfStones(user, callback) {
        const sql = "select stone, sum(amount) from userssouls where username = '" + user + "' group by stone";
        queryRun(sql, function (result) {
            return callback(result);
        });
    }

function queryRun(query, callback) {
    if (nodbconnect === false) {
        nodbconnect = true;
        connectDB();
        disconnectDB();
    }
    client.query(query,function (err, result){
        if (err) throw err;
        return callback(result['rows']);
    });
}

function postSoulsPerUser(user, mob, amount) {
        let stone;
        if (mob === 'Mopy King') {
            stone = 'gigantic'
        } else if (mob === 'Crab' || mob === 'Tofu' || mob === 'Demonic Rose' || mob === 'Astrub Cemetery' || mob === 'Çoral Beach') {
            stone = 'small';
        } else if (mob === 'Beaztinga' || mob === 'Weirbwork') {
            stone = 'average';
        } else {
            stone = 'big';
        }
    queryRun("INSERT INTO userssouls VALUES ('"+user+"','"+mob+"',"+amount+",'"+stone+"')", function (result){
        return result;
    });
}

function getSoulsPerUser(user, callback) {
        const sql = "select soulmob, amount from userssouls where username = '" + user + "' order by soulmob";
        queryRun(sql, function(result){
            return callback(result);
        });
    }

function deleteAllSoulsByUser(user) {
        const sql = "DELETE FROM userssouls where username = '" + user + "'";
        queryRun(sql,function (result){
            return result;
    });
}

function deleteSoulByUser(user, mob) {
        let sql = "DELETE FROM userssouls WHERE username = '" + user + "' AND soulmob= '" + mob + "'";
        queryRun(sql, function (result) {});
}

function updateSoulByUser(user, mob, amount){
        getSoulAmountByUser(user, mob, function(result){
            let nieuw = parseInt(result) + parseInt(amount);
            if (nieuw > 0) {
                let sql = "UPDATE userssouls SET amount = " + nieuw + " WHERE username = '" + user + "' AND soulmob = '" + mob + "'";
                queryRun(sql, function (result) {});
            } else if (nieuw <= 0){
                deleteSoulByUser(user,mob);
            }
        });
}

function getSoulAmountByUser(user, mob, callback){
        const sql = "SELECT amount FROM userssouls WHERE username = '"+ user +"' AND soulmob = '" + mob + "'";
            queryRun(sql, function (result) {
                return callback(result[0]['amount']);
            });
}

function getAllSouls(query, callback) {
            queryRun(query, function(result) {
                return callback(result);
            });
}

function insertNewEvent(query, callback) {
            queryRun(query, function(result) {
                return callback(result);
            });
}

discord.login(process.env.DISCORD_TOKEN).then();
