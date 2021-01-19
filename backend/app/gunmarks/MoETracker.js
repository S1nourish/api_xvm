const fetch = require('node-fetch');
const tankNames = require('../data/tankNames.json');
const conversion = require('../data/conversion.json');
const nationConversion = require('../data/nationConversion.json');
const db = require("../db");

const marks = ['95', '85', '65'];
const days = [7, 14, 30];
const indexToNum = {
    0: "50",
    1: "65",
    2: "85",
    3: "95"
}
const tierConv = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX",
    10: "X",
};

function round(value, decimals) {
    return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
}

async function MoETracker(server) {
    let totaldata = await fetch(`https://gunmarks.poliroid.ru/api/${server}/vehicles/50,65,85,95,100`);
    totaldata = await totaldata.json();
    const table = {
        data: []
    };

    const len = totaldata.data.length;

    for (let i = 0; i < len; ++i) {
        setTimeout(async function () {
            const entry = {};
            let tankData = await fetch(`https://gunmarks.poliroid.ru/api/${server}/vehicle/${totaldata.data[i].id}/50,65,85,95,100`);
            tankData = await tankData.json();
            entry.id = totaldata.data[i].id;
            entry.name = tankNames[totaldata.data[i].id].short_name;
            entry.class = conversion[tankNames[totaldata.data[i].id].type];
            entry.tier = tierConv[tankNames[totaldata.data[i].id].tier];
            entry.nation = nationConversion[tankNames[totaldata.data[i].id].nation];
            entry.isPrem = tankNames[totaldata.data[i].id].is_premium;
            //console.log(entry.name);

            marks.forEach((mark) => {
                if (!tankData.data[0].marks[mark]) setNull(mark);
                else {
                    let zero = tankData.data[0].marks[mark] + (tankData.data[1].marks[mark] || tankData.data[0].marks[mark]) + (tankData.data[2].marks[mark] || tankData.data[0].marks[mark]);
                    days.forEach((day) => {
                        if (tankData.data[day].marks[mark]) {
                            let one = tankData.data[day].marks[mark] || tankData.data[0].marks[mark]; 
                            let two;
                            if (day === 30)
                                two = tankData.data[day - 2].marks[mark] || tankData.data[0].marks[mark];
                            else 
                                two = tankData.data[day + 1].marks[mark] || tankData.data[0].marks[mark];
                            let three = tankData.data[day - 1].marks[mark] || tankData.data[0].marks[mark];
                            entry[`${day}diff${mark}`] = parseInt((zero - one - two - three) / 3);
                            entry[`${day}percent${mark}`] = round((entry[`${day}diff${mark}`] * 100 / tankData.data[day].marks[mark]), 2);
                        }
                        else { 
                            entry[`${day}diff${mark}`] = 0;
                            entry[`${day}percent${mark}`] = 0;
                        }
                    });
                    entry[mark] = tankData.data[0].marks[mark] || "-";
                }
            });

            function setNull(moe) {
                entry[`30diff${moe}`] = 0;
                entry[`30percent${moe}`] = 0;
                entry[`14diff${moe}`] = 0;
                entry[`14percent${moe}`] = 0;
                entry[`7diff${moe}`] = 0;
                entry[`7percent${moe}`] = 0;
                entry[`3diff${moe}`] = 0;
                entry[`${moe}`] = "-";  
            }

            table.data.push(entry);
            if (i === len - 1 ) {
                await db.query(`UPDATE moetracker SET data = $1 WHERE server = $2`, [table, server]);
                return;
            }
        }, i * 50);
    }

    fetchOverallMoEVals();

    async function fetchOverallMoEVals() {
        const servers = ['com', 'eu', 'ru', 'asia'];
        servers.forEach(async (server) => {
            let data = await fetch(`https://gunmarks.poliroid.ru/api/${server}/vehicles/50,65,85,95,100`);
            data = await data.json();
            data = data.data;
            let newData = [];
            for (let i = 0; i < data.length; ++i) {
                let entry = {};
                entry.id = data[i].id;
                entry['50'] = data[i].marks['50'];
                entry['65'] = data[i].marks['65'];
                entry['85'] = data[i].marks['85'];
                entry['95'] = data[i].marks['95'];
                entry['100'] = data[i].marks['100'];
                newData.push(entry);
            }
            await db.query(`UPDATE moevals SET data = $1 WHERE server = $2`, [{newData}, server]);
        });
    }    

    fetchTankMoEVals();

    async function fetchTankMoEVals() {
        const servers = ['com', 'eu', 'ru', 'asia'];
        servers.forEach((server) => {

            for (let k = 0; k < totaldata.data.length; ++k) {
                setTimeout(async function () {
                    const id = totaldata.data[k].id;
                    console.log(tankNames[totaldata.data[k].id].short_name);
                    let data = await fetch(`https://gunmarks.poliroid.ru/api/${server}/vehicle/${id}/50,65,85,95,100`);
                    data = await data.json();
                    let newData = [];
                    for (let i = 0; i < 4; ++i) {
                        let line = {
                            "id": indexToNum[i],
                            "data": [],
                        };
                        for (let j = data.data.length - 1; j >= 0; --j) {
                            let entry = {};
                            entry.x = data.data[j].date;
                            entry.y = data.data[j].marks[indexToNum[i]];
                            line.data.push(entry);
                        }
                        newData.push(line);
                    }
                    console.log(newData);
                    let tankidserver = `${id}${server}`
                    await db.query(
                    `
                        INSERT INTO tankmoehistory (data, tankidserver) VALUES ($1, $2)
                        ON CONFLICT (tankidserver)
                        DO 
                            UPDATE SET data = $1
                    `, [{newData}, tankidserver]);
                }, k * 250);
            }
        });
    }   
}

module.exports = MoETracker;