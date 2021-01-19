const async  = require('express-async-await');
const db = require("../db");
//calculates snapshot index closest to certain time
const recentTime = require('../functions/RecentTime.js');
//calculates snapshot index closest to certain num of battles
const recentBattles = require('../functions/RecentBattles.js');
//calculates session log array
const sessionstats = require('../functions/sessionstats.js');
//calculates overall stats
const calcOverall = require('../functions/calcOverall.js');
//calculates recent stats
const calcRecents = require('../functions/calcRecents.js');
//calculates stats for the linegraph
const calcLinegraph = require('../functions/calcLinegraph.js');

async function existingPlayer(res, currentTime, server, id, exists, compressedStats, stats, moeData) {
    const numEntries = exists.rows[0].numentries;
    const timeArr = exists.rows[0].timestamps;
    const battlesArr = exists.rows[0].battlestamps;
    // returns the index of respective stats snapshots for each period
    const index24hr = recentTime(exists.rows[0].stats, numEntries, currentTime, timeArr, 1600);
    const index3days = recentTime(exists.rows[0].stats, numEntries, currentTime, timeArr, 4720);
    const index1week = recentTime(exists.rows[0].stats, numEntries, currentTime, timeArr, 10800);
    const index30days = recentTime(exists.rows[0].stats, numEntries, currentTime, timeArr, 43200);
    const index60days = recentTime(exists.rows[0].stats, numEntries, currentTime, timeArr, 86400);

    const index1000 = recentBattles(exists.rows[0].stats, numEntries, compressedStats.battles, battlesArr, 1000);
    const index500 = recentBattles(exists.rows[0].stats, numEntries, compressedStats.battles, battlesArr, 100);

    console.log('battles diff: ' + (compressedStats.battles - battlesArr[battlesArr.length - 1]));
    // Only updates stats if account has played at least one game since last snapshot
    if ((compressedStats.battles - battlesArr[battlesArr.length - 1] > 0) || (currentTime - timeArr[timeArr.length - 1] > 360)) {
        console.log(`update happens battles passed:  ${compressedStats.battles - battlesArr[battlesArr.length - 1]} time:  ${currentTime - timeArr[timeArr.length - 1]}`);
        const numBattles = compressedStats.battles;
        let newCompressed = compressedStats;
        if (compressedStats.battles - battlesArr[battlesArr.length - 1] === 0) {
            newCompressed = {};
        }
        if (server != 'com' && server != 'eu' && server != 'asia') {
            await db.query(
                `UPDATE dev${server} SET 
                numEntries = numEntries + 1, 
                timestamps = array_append(timestamps, $2),
                battlestamps = array_append(battlestamps, $3),
                stats = array_append(stats, $4)
                WHERE player_id = $1`,
                [id, currentTime, numBattles, newCompressed]);
        }
    }

    const sessions = sessionstats(exists.rows[0].stats, exists.rows[0].stats.length);

    const overallStats = calcOverall(stats, moeData);

    const linegraph = calcLinegraph(exists.rows[0].stats, exists.rows[0].stats.length)
    //console.log(exists.rows[0].stats[index24hr]);
    const recents = {
        recent24hr: calcRecents(exists.rows[0].stats[index24hr] || compressedStats, compressedStats),
        recent3days: calcRecents(exists.rows[0].stats[index3days] || compressedStats, compressedStats),
        recent7days: calcRecents(exists.rows[0].stats[index1week] || compressedStats, compressedStats),
        recent30days: calcRecents(exists.rows[0].stats[index30days] || compressedStats, compressedStats),
        recent60days: calcRecents(exists.rows[0].stats[index60days] || compressedStats, compressedStats),
        recent1000: calcRecents(exists.rows[0].stats[index1000] || compressedStats, compressedStats),
        recent100: calcRecents(exists.rows[0].stats[index500] || compressedStats, compressedStats),
    }

    // console.log(calcRecents(exists.rows[0].stats[index24hr] || compressedStats, compressedStats));
    res.status(200).json({ 
        server: server,
        username: exists.rows[0].username,
        status: 'success', 
        linegraph: linegraph,
        overall: compressedStats,
        overallStats: overallStats,
        sessions: sessions,
        recents: recents, 
    });
}

module.exports = existingPlayer;