// Thanks for the reminder @dontsend :P
require('dotenv').config();
const mysql = require('mysql');
const Discord = require('discord.js');
const client = new Discord.Client();
const soulmobs = ['Crab', 'Beaztinga', 'Pandala Forest',
    'Weirbwork', 'Primitive Cemetery', "Agony V'Helley'", 'Kilibriss',
    'Cromagmunk', 'Mopy King', 'Watchamatrich'];
const mobs = 'the following mobs are allowed, between () is the shorter input:\n' +
    '| **Crab** | **Beaztinga** (beaz) | **Pandala Forest** (pandala) | **Weirbwork** (weir) | **Primitive Cemetery** (cemetery) | **Agony V\'Helley** (agony) | **Kilibriss** (kili) ' +
    '| **Cromagmunk** (croma) | **Mopy King** (mopy) | **Watchamatrich** (watcha) |';
const commands = ['!addsoul [mob] [amount]', '!deletesoul [all:mob] [OPT: amount]', '!mysouls', '!allsouls', '!moblist', '!buyin [small] [average] [big] [gigantic]'];
let config = {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
};

let con = mysql.createConnection(config);

client.on('ready', () => {
    console.log('Logged in as soulBotForDofus!');
});

client.on('message', msg => {
    let user = msg.author.username;
    if (msg.author.lastMessage.member.nickname !== null) {
        user = msg.author.lastMessage.member.nickname;
    }
    let args = msg.content.substring(1).split(' ');
    console.log(args[1]);
    if (args[1])
    switch(args[1]) {
        case 'rat' :
            args[1] = 'milirat';
            break;
        case 'beaz' :
            args[1] = 'beaztinga';
            break;
        case 'holy' :
            args[1] = 'holybambooto';
            break;
        case 'weir' :
            args[1] = 'weirbwork';
            break;
        case 'krider' :
            args[1] = 'koalakrider';
            break;
        case 'kmaster' :
            args[1] = 'koalakmaster';
            break;
        case 'wild' :
            args[1] = 'wildkoalak';
            break;
        case 'kili' :
            args[1] = 'kilibriss';
            break;
        case 'croma' :
            args[1] = 'cromagmunk';
            break;
        case 'mopy' :
            args[1] = 'mopyking';
            break;
        case 'watcha' :
            args[1] = 'watchamatrich';
            break;
        case 'zmaster' :
            args[1] = 'zothmaster';
            break;
        case 'zwar' :
            args[1] = 'zothwarrior';
            break;
        case 'zdisc' :
            args[1] = 'zothdisciple';
            break;
        case 'bulbig':
            args[2] = 'holybambooto';
            break;
    }
    if (msg.content.startsWith('!') && msg.channel.id === '681167201855864843') {
        switch (args[0]) {
    //===================================================================//
            case 'addsoul':
                if (verifyMob(args[1]) && verifyAmount(args[2])){
                    let check = args[2].split(',');
                    args[2] = check[0];
                    connectDB();
                    getSoulsPerUser(user,function(result){
                        let dubbel = false;
                        for(let i = 0; i < result.length; i++) {
                            if (result[i]['soulmob'] === args[1]){
                                dubbel = true;
                            }
                        }
                        if(dubbel === false) {
                        postSoulsPerUser(user, args[1], args[2]);
                        msg.reply("soul is added.").then();
                        }else {
                            updateSoulByUser(user,args[1],args[2]);
                            msg.reply('soul amount is updated.').then();
                        }
                    });
                    disconnectDB();
                } else if (verifyAmount(args[2])){
                    msg.reply('amount is not valid, please make sure it numbers only and not higher than 9999999').then();
                }
                else {
                    msg.reply("soul is not valid, please consult !help.").then();
                }
                break;
    //===================================================================//
            case 'mysouls':
                connectDB();
                getSoulsPerUser(user, function (result) {
                    let bericht = 'you have the following souls:\n';
                    for(let i = 0; i < result.length; i++) {
                        if (i === 0) {
                            bericht += '| '
                        }
                        let mob = '**' + result[i]['soulmob'] + '**';
                        let amount = result[i]['amount'];
                        bericht += mob + ' - ' + amount + ' | ';
                    }
                    msg.reply(bericht).then();
                    disconnectDB();
                });
                break;
    //===================================================================//
            case 'deletesoul':
                connectDB();
                let mob = args[1];
                let amount = 0;
                try {
                    amount = -parseInt(args[2]);
                }
                catch (TypeError) {
                    msg.reply('amount has to be a number').then();
                }
                if (mob.toLowerCase() === 'all'){
                    deleteAllSoulsByUser(user);
                    msg.reply('all souls deleted').then();
                } else if (verifyMob(mob) && !Number.isNaN(amount)) {
                    getSoulsPerUser(user, function (result) {
                        let waar = false;
                        for (let i = 0; i < result.length; i++) {
                            if(result[i]['soulmob'] === mob){
                                waar = true;
                            }
                        }
                        if (waar === true) {
                            updateSoulByUser(user,mob,amount);
                            msg.reply(mob + ' souls deleted').then();
                        } else {
                            msg.reply("you can't delete a soul you don't have").then();
                        }
                    });
                } else if (verifyMob(mob)) {
                    deleteSoulByUser(user, mob);
                        msg.reply('all your ' + mob + ' souls are deleted.').then();
                } else if (amount === 0){
                    msg.reply("it's not possible to delete 0 souls").then();
                } else {
                    msg.reply('wrong use of command, please consult !help for more info').then();
                }
                disconnectDB();
            break;
    //===================================================================//
            case 'moblist':
                msg.reply(mobs).then();
                break;
    //===================================================================//
            case 'buyin':
                if (args.length === 5) {
                    let buyin = 0;
                    connectDB();
                    getAmountOfStones(user, function (result) {
                        for (let i = 0; i < result.length; i++) {
                            if (result[i]['soulstone'] === 'small') {
                                buyin += result[i]['sum(amount)'] * args[1];
                            } else if (result[i]['soulstone'] === 'average') {
                                buyin += result[i]['sum(amount)'] * args[2];
                            } else if (result[i]['soulstone'] === 'big') {
                                buyin += result[i]['sum(amount)'] * args[3];
                            } else if (result[i]['soulstone'] === 'gigantic') {
                                buyin += result[i]['sum(amount)'] * args[4];
                            }
                        }
                        buyin = buyin / 8;
                        msg.reply(buyin).then();
                    });
                    disconnectDB();
                } else {
                    msg.reply('wrong use of command, please consult !help').then();
                }
                break;
        }
    } else if (msg.content.startsWith('!') && msg.channel.id === '681167234495676417') {
        if (args[0] === 'allsouls') {
            connectDB();
            getAllSouls(function(result){
                let bericht = 'these souls are available:\n';
                for(let i = 0; i < result.length; i++) {
                    let mob = result[i]['soulmob'][0].toUpperCase() + result[i]['soulmob'].substring(1, result[i]['soulmob'].length);
                    let amount = ' - ' + result[i]['amount'];
                    let soulowner =  '**' + result[i]['username'] + '**';
                    let updatemessage = soulowner + amount + ' | ';
                    if(i !== 0) {
                        if (mob.toLowerCase() !== result[i-1]['soulmob']) {
                            bericht += '\n\n__**' + mob + ':**__\n| ';
                        }
                        bericht += updatemessage;
                    } else {
                        bericht += '__**' + mob + ':**__\n| ';
                        bericht += updatemessage;
                    }
                }
                msg.reply(bericht).then();
                disconnectDB();
            });
        } else if (args[0] === 'viewsouls') {
            connectDB();
            getSoulsPerUser(args[1], function (result) {
                let bericht = args[1] + ' has the following souls:\n';
                for (let i = 0; i < result.length; i++) {
                    if (i === 0) {
                        bericht += '| '
                    }
                    let mob = '**' + result[i]['soulmob'] + '**';
                    let amount = result[i]['amount'];
                    bericht += mob + ' - ' + amount + ' | ';
                }
                msg.reply(bericht).then();
                disconnectDB();
            });
        }
    }
    if (msg.content.startsWith('!') && (msg.channel.id === '681167234495676417' || msg.channel.id === '681167201855864843')) {
        if (args[0] === 'help') {
            msg.reply("list of commands:\n**" +
                commands[0] + "** adds a soul or updates an already existing soul.\n**" +
                commands[1] + "** deletes souls\n**" +
                commands[2] + "** displays all your registered souls\n**" +
                commands[3] + "** displays all registered souls *(soulviewing channel only!)*\n**" +
                commands[4] + "** displays the list of all the mobs we soul\n**" +
                commands[5] + "** calculates your buy in based on your souls (you must enter 4 prices)").then();
        }
    }

});

function connectDB() {
        con = mysql.createConnection(config);
        con.connect();
    }

function disconnectDB() {
        setTimeout(function(){
            con.destroy();
        }, 2000);
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
        const sql = "select soulstone, sum(amount) from userssouls where username = '" + user + "' group by soulstone";
        queryRun(sql, function (result) {
            return callback(result);
        });
    }

function queryRun(query, callback) {
    con.query(query,function (err, result){
        if (err) throw err;
        return callback(result);
    });
}

function postSoulsPerUser(user, mob, amount) {
        let stone;
        if (mob === 'mopyking') {
            stone = 'gigantic'
        } else if (mob === 'crab' || mob === 'milirat') {
            stone = 'small';
        } else if (mob === 'beaztinga' || mob === 'holy' || mob === 'weirbwork' || mob === 'bulbig') {
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

function getAllSouls(callback) {
        const sql = "SELECT * FROM userssouls ORDER BY soulmob, username";
            queryRun(sql, function(result) {
                return callback(result);
            });
}

client.login(process.env.DISCORD_TOKEN).then();
