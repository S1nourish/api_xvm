const calculateWN8 = require('./calcOverallWN8');

function calcLinegraph(stats, num) {
    const linegraphStats = [];

    const prunedStats = [];
    for (let i = num - 1; i >= 0; --i) {
        // if ('date' in stats[i]) {
            prunedStats.push(stats[i]);
        // }
    }
    // console.log(prunedStats);
    for (let i = prunedStats.length - 1; i >= 1; --i) {
        // [
        //     19111,
        //     2407,
        //     0.5473810894249386,
        //     1658.1636753702057
        // ],
        if (prunedStats[i-1].battles - prunedStats[i].battles > 0) {
            const entry = [];

            entry.push(prunedStats[i-1].battles);
            entry.push(calculateWN8(prunedStats[i-1].tankStats, []));
            entry.push(prunedStats[i-1].wins/prunedStats[i-1].battles);
            entry.push(prunedStats[i-1].xp/prunedStats[i-1].battles);

            linegraphStats.push(entry);
        }
    }

    return linegraphStats;
}

module.exports = calcLinegraph;