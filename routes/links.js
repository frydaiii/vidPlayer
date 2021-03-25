const express = require('express');
const router = express.Router();
const { resolve } = require('path');
const { readdir } = require('fs').promises;
const root = require('../value').root;

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

router.post('/', async function(req, res, next) {
  try {
    res.send(
      `<video controls preload="metadata" style="width: 95%; height: 95%"> \
        <source src=${req.body.video}> \
        <track label="Vietnamese" kind="subtitles" srclang="vi" src=${req.body.subtitle}> \
      </video>`
    );
  } catch(e) {
    res.send(e);
  }
});

router.get('/', async function(req, res, next) {
  try {
    const dir = root;
    const files = await getFiles(dir);
    for (i = 0; i < files.length; i++) {
      files[i] = files[i].replace(dir, '');
    }

    const videos = []
    const subtitles = []
    files.forEach(item => {
      const ext = item.slice(item.lastIndexOf('.'));
      if (ext=='.mp4' || ext=='.mkv') videos.push(item);
      else  if (ext=='.vtt') subtitles.push(item);
    });

    res.json({
      "videos": videos,
      "subtitles": subtitles
    });
  } catch(e) {
    res.send(e);
  }
});

module.exports = router;
