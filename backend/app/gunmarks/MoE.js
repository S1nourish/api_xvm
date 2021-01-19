const db = require("../db");

async function MoE(res, server) {
    const servers = ['com', 'eu', 'ru', 'asia'];
    if (!(servers.includes(server))) res.status(404).send('itsover');
    let data = await db.query(`SELECT data FROM moevals WHERE server = $1`, [server]);
    data = data.rows[0].data.newData;
    res.status(200).json(data);
}

module.exports = MoE;