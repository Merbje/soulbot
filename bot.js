require('dotenv').config();
const pg = require('pg');
const Discord = require('discord.js');
let oneconnect = false;
let nodbconnect = false;
//Channels
const jazzlounge = '675785176667783179';
const soulchannel = '677524777992323072';
const farm = '704750408471412757';
const requirements = '707158336876838913';

//Emotes
const vinkje = '674593230402224148';
const cross = '674593603787554841';
const discord = new Discord.Client();

//Ranks
const farmrole = '707642560990150666';

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
    'If you find yourself eligible you may respond with **!eligible** - the bonabot grant you access to the farm-channel';


//Lists
const soulmobs = ['Crab', 'Beaztinga', 'Pandala Forest',
    'Weirbwork', 'Primitive Cemetery', "Agony V''Helley",
    'Cromagmunk', 'Mopy King', 'Watchamatrich', 'Coral Beach', 'Canopy Village'];
const mobs = 'the following mobs are allowed, between () is the shorter input:\n' +
    '| **Crab** (crab) | **Beaztinga** (beaz) | **Pandala Forest** (pandala) | **Weirbwork** (weir) | **Primitive Cemetery** (cemetery) | **Agony V\'Helley** (agony) ' +
    '| **Cromagmunk** (croma) | **Mopy King** (mopy) | **Watchamatrich** (watcha) | **Canopy Village** (zoth) | **Coral Beach** (craboral)';
const commands = ['!addsoul [mob] [amount]', '!deletesoul [all:mob] [OPT: amount]', '!mysouls', '!allsouls', '!viewsouls [user]', '!moblist', '!buyin [small] [average] [big] [gigantic]'];
const conString = process.env.APITOKEN;

let client = new pg.Client(conString);

discord.on('ready', () => {
    console.log('Logged in as soulBotForDofus!');
});

discord.on('message', msg => {
    if (msg.content.startsWith('!')) {
        if (oneconnect === false) {
            oneconnect = true;
            setTimeout(function () {
                oneconnect = false;
            }, 2500);
            let user = msg.author.username;
            if (msg.author.lastMessage.member.nickname !== null) {
                user = msg.author.lastMessage.member.nickname;
            }
            let args = msg.content.substring(1).split(' ');

            if (args[2] !== undefined) {
                switch (args[2].toLocaleLowerCase()) {
                    case 'forest':
                    case 'cemetery':
                    case "v'helley":
                    case 'village':
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
                    case 'pandala' :
                    case 'pandala forest' :
                        args[i] = 'Pandala Forest';
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
                        msg.author.send("list of commands:\n**" +
                            commands[0] + "** adds a soul or updates an already existing soul.\n**" +
                            commands[1] + "** deletes souls\n**" +
                            commands[2] + "** displays all your registered souls\n**" +
                            commands[5] + "** displays the list of all the mobs we soul\n**" +
                            commands[6] + "** calculates your buy in based on your souls (you must enter 4 prices)", {
                            files: [
                                "./end.png"
                            ]
                        }).then();
                        msg.react(vinkje).then();
                        break;
                    default:
                        msg.react("❓").then();
                }
            }
            if (msg.channel.id === jazzlounge) {
                let voorheteindebericht = 'these souls are available:\n';
                let bericht = '';
                user = args[1];
                let userreply = '';
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
                            if (i !== 0) {
                                if (soulowner !== result[i - 1]['username']) {
                                    bericht += '\n\n' + soulowner + ':\n| ';
                                }
                                bericht += updatemessage;
                            } else {
                                bericht += soulowner + ':\n| ';
                                bericht += updatemessage;
                            }
                        }
                        bericht = voorheteindebericht + '```' + bericht + '```';
                        msg.reply(bericht).then();
                    });
                }
                else if (args[0] === 'allsouls') {
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
                        bericht = voorheteindebericht + '```' + bericht + '```';
                        msg.reply(bericht).then();
                    });
                }
                else if (args[0] === 'viewsouls') {
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
                }
                else if (args[0] === 'deletesoul') {
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
                            msg.react("674593230402224148").then();
                            //msg.reply('all of ' + userreply + '\'s souls deleted').then();
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
                                    msg.react("674593230402224148").then();
                                    //msg.reply(mob + ' souls deleted').then();
                                } else {
                                    msg.react("674593603787554841").then();
                                    //msg.reply("you can't delete a soul they don't have.").then();
                                }
                            });
                        } else if (verifyMob(mob)) {
                            deleteSoulByUser(user, mob);
                            if (mob === "Agony V''Helley") {
                                mob = "Agony V'Helley";
                            }
                            msg.react("674593230402224148").then();
                            //msg.reply('all ' + userreply + ' their ' + mob + ' souls are deleted.').then();
                        } else if (amount === 0) {
                            msg.react("674593603787554841").then();
                            //msg.reply("it's not possible to delete 0 souls.").then();
                        } else {
                            msg.react("674593603787554841").then();
                            //msg.reply('wrong use of command, please consult !help for more info.').then();
                        }
                }
                else if (args[0] === 'addsoul') {
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
                }
                else if (args[0] === 'help') {
                    msg.reply("list of MOD/ADMIN commands:\n**" +
                        commands[3] + "** displays all registered souls\n**" +
                        commands[4] + "** displays another users souls\n**" +
                        "!deletesoul [user] [all:mob] [OPT: amount]** deletes a soul from another user\n**" +
                        "!addsoul [user] [mob] [amount]** adds or updates a soul from another user\n**" +
                        "!soulsperuser** displays all registered souls per user"
                    ).then();
                }
                else if (args[0] === 'removed') {
                    let privatemsg = msg.mentions.users.first();
                    let pm = ("Hey " + privatemsg + ",\n\nDue to your recent inactivity you have been removed from the guild as part of our policy. Your discord rank has been adjusted. If you plan on being more active and want to rejoin the guild feel free free to send an administrator or a recruitment officer a private message through discord.\n\nKind regards,\n\nBona Fide staff");
                    privatemsg.send(pm, {
                        files: [
                            "./end.png"
                        ]
                    }).then();
                }
            }
            if (msg.channel.id === requirements) {
                msg.member.removeRole(farmrole).catch(console.error);
            }
            if (msg.channel.id === farm) {
                msg.member.addRole(farmrole).catch(console.error);
                if (args[0] === "farm") {
                    msg.author.send(farmmessage, {
                        files: [
                            "./end.png"
                        ]
                    }).then();
                }
            }
        } else {
            msg.reply('There is a 2.5 second cooldown between commands').then();
        }
    }
});



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
        } else if (mob === 'Crab') {
            stone = 'small';
        } else if (mob === 'Beaztinga' || mob === 'Pandala Forest' || mob === 'Weirbwork') {
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

discord.login(process.env.DISCORD_TOKEN).then();
