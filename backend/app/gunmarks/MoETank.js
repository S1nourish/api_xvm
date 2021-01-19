const db = require("../db");

async function MoETank(res, id, server) {
    const servers = ['com', 'eu', 'ru', 'asia'];
    if (!(servers.includes(server))) res.status(404).send('itsover');
    let data = await db.query(`SELECT data FROM tankmoehistory WHERE tankidserver = $1`, [`${id}${server}`]);
    data = data.rows[0].data.newData;
    res.status(200).json(data);
}

module.exports = MoETank;