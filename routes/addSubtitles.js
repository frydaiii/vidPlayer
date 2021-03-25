const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const root = require('../value').root;

router.post('/', (req, res, next) => {
    const url = req.body.url;
    exec(`python3 ${__dirname+'/subs.py'} ${url} ${root+'/subtitles'}`, (err, stdout, stderr) => {
        if (err) {
            res.send(`nodejs couldn't execute command \n ${err}`);
        } else if (stdout) {
            res.send(`stdout \n ${stdout}`);
        } else if (stderr) {
            res.send(`stderr \n ${stderr}`);
        } else {
            res.send('successful');
        }
    });
});

router.get('/', (req, res, next) => {
    res.send(
        '<html> \
            <form action="/add" method="POST"> \
                <input type="text" name="url" style="width: 95%"></input> \
                <input type="submit"></input> \
            </form> \
        </html>'
    )
});

module.exports = router;
