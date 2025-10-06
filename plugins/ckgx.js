const config = require("../config");
const axios = require("axios");
const cheerio = require("cheerio");
const {
  File
} = require("megajs");
const {
  sizeFormatter
} = require("human-readable");
;
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  getsize,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson
} = require("../lib/functions");
const {
  cmd,
  commands
} = require("../command");
const g_i_s = require('g-i-s');
const fetch = (..._0x28700a) => import("node-fetch").then(({
  default: _0x5cc38c
}) => _0x5cc38c(..._0x28700a));
const sharp = require('sharp');
async function resizeImage(_0x3011e7, _0x223696, _0x1f89b4) {
  try {
    return await sharp(_0x3011e7).resize(_0x223696, _0x1f89b4).toBuffer();
  } catch (_0x173ad1) {
    console.error("Error resizing image:", _0x173ad1);
    return _0x3011e7;
  }
}
let wm = config.FOOTER;
async function GDriveDl(_0x129a91) {
  let _0x3ef221;
  let _0xb939d0 = {
    'error': true
  };
  if (!(_0x129a91 && _0x129a91.match(/drive\.google/i))) {
    return _0xb939d0;
  }
  const _0x20c6bd = sizeFormatter({
    'std': 'JEDEC',
    'decimalPlaces': 0x2,
    'keepTrailingZeroes': false,
    'render': (_0x2ed693, _0x224e57) => _0x2ed693 + " " + _0x224e57 + 'B'
  });
  try {
    _0x3ef221 = (_0x129a91.match(/\/?id=(.+)/i) || _0x129a91.match(/\/d\/(.*?)\//))[0x1];
    if (!_0x3ef221) {
      throw "ID Not Found";
    }
    _0xb939d0 = await fetch("https://drive.google.com/uc?id=" + _0x3ef221 + '&authuser=0&export=download', {
      'method': "post",
      'headers': {
        'accept-encoding': "gzip, deflate, br",
        'content-length': 0x0,
        'Content-Type': "application/x-www-form-urlencoded;charset=UTF-8",
        'origin': 'https://drive.google.com',
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
        'x-client-data': "CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=",
        'x-drive-first-party': "DriveWebUi",
        'x-json-requested': "true"
      }
    });
    let {
      fileName: _0x48123a,
      sizeBytes: _0x438089,
      downloadUrl: _0x372204
    } = JSON.parse((await _0xb939d0.text()).slice(0x4));
    if (!_0x372204) {
      throw "Link Download Limit!";
    }
    let _0xd99930 = await fetch(_0x372204);
    if (_0xd99930.status !== 0xc8) {
      return _0xd99930.statusText;
    }
    return {
      'downloadUrl': _0x372204,
      'fileName': _0x48123a,
      'fileSize': _0x20c6bd(_0x438089),
      'mimetype': _0xd99930.headers.get("content-type")
    };
  } catch (_0x191391) {
    console.log(_0x191391);
    return _0xb939d0;
  }
}
cmd({
  'pattern': "ckgx",
  'alias': ["googledrive'"],
  'react': '🗃️',
  'desc': "Download googledrive files.",
  'category': "download",
  'use': ".gdrive <googledrive link>",
  'filename': __filename
}, async (_0x5a9019, _0x4c6a64, _0x38df9b, {
  from: _0x3341a5,
  l: _0x3b4a5e,
  quoted: _0xe9a596,
  body: _0x347f12,
  isCmd: _0xd75965,
  command: _0x58ee0f,
  args: _0x2fa6b3,
  q: _0x193afa,
  isGroup: _0xb88398,
  sender: _0x4145a4,
  senderNumber: _0x4c75c3,
  botNumber2: _0x5ecef9,
  botNumber: _0x3b8a9a,
  pushname: _0x55f61f,
  isMe: _0xaae840,
  isOwner: _0x4f04e6,
  groupMetadata: _0x332669,
  groupName: _0x5df9cd,
  participants: _0x530267,
  groupAdmins: _0x5e9b80,
  isBotAdmins: _0x25b557,
  isAdmins: _0x342873,
  reply: _0x3be367
}) => {
  try {
    if (!_0x193afa) {
      return await _0x3be367("*Please give me googledrive url !!*");
    }
    let _0x65f2a1 = await GDriveDl(_0x193afa);
    let _0x4b1e03 = "*`🗃️ CK GDRIVE DOWNLODER 🗃️`*\n\n*┌──────────────────*\n*├ 🗃️ Name :* " + _0x65f2a1.fileName + "\n*├ ⏩ Type :* " + _0x65f2a1.fileSize + "\n*├ 📁 Size :* " + _0x65f2a1.mimetype + "\n*└──────────────────*";
    await _0x3be367(_0x4b1e03);
    _0x5a9019.sendMessage(_0x3341a5, {
      'document': {
        'url': _0x65f2a1.downloadUrl
      },
      'fileName': _0x65f2a1.fileName,
      'mimetype': _0x65f2a1.mimetype
    }, {
      'quoted': _0x4c6a64
    });
  } catch (_0x4ab9ef) {
    _0x3be367("*Error !!*");
    console.log(_0x4ab9ef);
  }
});
