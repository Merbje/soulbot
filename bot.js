require('dotenv').config();
const mysql = require('mysql');
const Discord = require('discord.js');
const client = new Discord.Client();
var soulmobs = ['milirat', 'crab', 'beaztinga', 'holybambooto', 'bulbig',
    'weirbwork', 'koalakrider', 'koalakmaster', 'wildkoalak', 'kilibriss',
    'cromagmunk', 'mopyking', 'watchamatrich', 'zothmaster', 'zothwarrior',
    'zothdisciple'];
var mobs = 'the following mobs are allowed, between () is the shorter input:\n' +
    '| **milirat** (rat) | **crab** | **beaztinga** (beaz) | **holybambooto** (holy) |' +
    ' **bulbig** | **weirbwork** (weir) | **koalakrider** (krider) ' +
    '| **koalakmaster** (kmaster) | **wildkoalak** (wild) | **kilibriss** (kili) ' +
    '| **cromagmunk** (croma) | **mopyking** (mopy) | **watchamatrich** (watcha) ' +
    '| **zothmaster** (zmaster) | **zothwarrior** (zwar) | **zothdisciple** (zdisc) |';
var commands = ['!addsoul [mob] [amount]', '!deletesoul [all:mob] [OPT: amount]', '!mysouls', '!allsouls', '!moblist', '!buyin [small] [average] [big] [gigantic]'];
var config = {
    host: "remotemysql.com",
    user: "EaRxbcwve0",
    password: "hf09Ekp150",
    database: "EaRxbcwve0"
};

var con = mysql.createConnection(config);

client.on('ready', () => {
    console.log('Logged in as soulBotForDofus!');
});

client.on('message', msg => {
    let user = msg.author.username;
    let args = msg.content.substring(1).split(' ');
    if (msg.content.startsWith('!') && msg.channel.id === '681167201855864843') {
        switch (args[0]) {
    //===================================================================//
            case 'addsoul':
                let check = args[2].split(',');
                switch(args[1]){
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
                args[2] = check[0];
                if (verifyMob(args[1]) && verifyAmount(args[2])){
                    connectDB();
                    getSoulsPerUser(user,function(result){
                        let dubbel = false;
                        for(let resul in result) {
                            if (result[resul]['soulmob'] === args[1]){
                                dubbel = true;
                            }
                        }
                        if(dubbel === false) {
                        postSoulsPerUser(user, args[1], args[2]);
                        msg.reply("soul is added.");
                        }else {
                            updateSoulByUser(user,args[1],args[2]);
                            msg.reply('soul amount is updated.');
                        }
                    });
                    disconnectDB();
                } else {
                    msg.reply("soul is not valid, please consult !help.")
                }
                break;
    //===================================================================//
            case 'mysouls':
                connectDB();
                getSoulsPerUser(user, function (result) {
                    var bericht = 'you have the following souls:\n';
                    for(var i = 0; i < result.length; i++) {
                        if (i === 0) {
                            bericht += '| '
                        }
                        var mob = '**' + result[i]['soulmob'] + '**';
                        var amount = result[i]['amount'];
                        bericht += mob + ' - ' + amount + ' | ';
                    }
                    msg.reply(bericht);
                    disconnectDB();
                });
                break;
    //===================================================================//
            case 'deletesoul':
                connectDB();
                var mob = args[1];
                try {
                    var amount = -parseInt(args[2]);
                }
                catch (TypeError) {
                    msg.reply('amount has to be a number');
                }
                if (mob.toLowerCase() === 'all'){
                    deleteAllSoulsByUser(user);
                    msg.reply('all souls deleted');
                } else if (verifyMob(mob) && !Number.isNaN(amount)) {
                    updateSoulByUser(user,mob,amount);
                        msg.reply(mob + ' souls deleted');
                } else if (verifyMob(mob)) {
                    deleteSoulByUser(user, mob);
                        msg.reply('all your ' + mob + ' souls are deleted.')
                } else if (parseInt(amount) === 0){
                    msg.reply("it's not possible to delete 0 souls");
                } else {
                    msg.reply('wrong use of command, please consult !help for more info');
                }
                disconnectDB();
            break;
    //===================================================================//
            case 'moblist':
                msg.reply(mobs);
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
                        msg.reply(buyin);
                    });
                    disconnectDB();
                } else {
                    msg.reply('wrong use of command, please consult !help');
                }
                break;
        }
    } else if (msg.content.startsWith('!') && msg.channel.id === '681167234495676417') {
        switch (args[0]) {
    //===================================================================//
            case 'allsouls':
                connectDB();
                getAllSouls(function(result){
                    var bericht = 'these souls are available:\n';
                    for(var i = 0; i < result.length; i++) {
                        var mob = result[i]['soulmob'][0].toUpperCase() + result[i]['soulmob'].substring(1, result[i]['soulmob'].length);
                        var amount = ' - ' + result[i]['amount'];
                        var soulowner =  '**' + result[i]['username'] + '**';
                        var updatemessage = soulowner + amount + ' | ';
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
                    msg.reply(bericht);
                    disconnectDB();
                });
                break;
        }
    }
    if (msg.content.startsWith('!') && (msg.channel.id === '681167234495676417' || msg.channel.id === '681167201855864843')) {
        switch (args[0]) {
    //===================================================================//
            case 'help':
                msg.reply("list of commands:\n**" +
                    commands[0] + "** adds a soul or updates an already existing soul\n**" +
                    commands[1] + "** deletes souls\n**" +
                    commands[2] + "** displays all your registered souls\n**" +
                    commands[3] + "** displays all registered souls *(soulviewing channel only!)*\n**" +
                    commands[4] + "** displays the list of all the mobs we soul\n**" +
                    commands[5] + "** calculates your buy in based on your souls (you must enter 4 prices)");
                break;
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
        }, 1000);
    }

function verifyMob(mob) {
        if(soulmobs.includes(mob)){
            return true
        }
    }

function verifyAmount(amount) {
        try {
            let isNumber = parseInt(amount);
            if (isNumber > 0) {
                return true;
            }
        } catch (TypeError) {
            return false;
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
        //console.log(result);
        return callback(result);
    });
}

function postSoulsPerUser(user, mob, amount) {
        var stone;
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
        return true;
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
            return true;
    });
}

function deleteSoulByUser(user, mob) {
        let sql = '';
        sql = "DELETE FROM userssouls WHERE username = '" + user + "' AND soulmob= '" + mob + "'";
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

client.login(process.env.DISCORD_TOKEN);
