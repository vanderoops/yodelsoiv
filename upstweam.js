
const FS = require ('fs');
const HTTP = require ('http');
const PATH = require ('path');

const PROCESS = require ('process');

const PORT = 9009;


const MIME_TYPES = {
  default: 'application/octet-stream',
  html: 'text/html; charset=UTF-8',
  js: 'application/javascript; charset=UTF-8',
  css: 'text/css',
  png: 'image/png',
  jpg: 'image/jpg',
  gif: 'image/gif',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
};


const STATIC_PATH = PATH.join (PROCESS.cwd (), './beyond/');

const toBool = [() => true, () => false];


const FileStreamFromURL = async function (url) {
console.log (`yeah, well, urly thus: ${url}`);
  const path_chunks = [STATIC_PATH, url];
  if (url.endsWith('/'))
    path_chunks . push ('index.html');
  const file_path = PATH.join (...path_chunks);
  const path_traversal = ! file_path . startsWith (STATIC_PATH);
  const exists = await FS.promises . access (file_path) . then (...toBool);
  const found = ! path_traversal  &&  exists;
  const stream_path = found ? file_path : STATIC_PATH + '/404.html';
  const ext = PATH.extname (stream_path) . substring (1) . toLowerCase ();
  const stream = FS.createReadStream (stream_path);
  return { found, ext, stream };
};


const FulfillFileRequest = async function (request, rspns_obj) {
  const strm_bndl = await FileStreamFromURL (request.url);
  const status_code = strm_bndl.found ? 200 : 404;
  const mime_type = MIME_TYPES[strm_bndl.ext] || MIME_TYPES.default;
  rspns_obj . writeHead (status_code, { 'Content-Type': mime_type });
  strm_bndl.stream . pipe (rspns_obj);
  console.log (`${request.method} ${request.url} ${status_code}`);
};

const http_server = HTTP.createServer (FulfillFileRequest);

http_server . listen (PORT);


let ootpootcoont = 0;
let continuspew = false;

const din = PROCESS.stdin;
din . setRawMode (true);
din . on ('data', (patty) =>
                    { if (patty == '\033')
                        PROCESS.exit ();
                      let q = Number.parseInt (patty);
                      if (patty == 's')
                        continuspew = ! continuspew;
                      else if (q != NaN)
                        ootpootcoont = q;
                    });

console.log (`Upstweam wallowing at http://127.0.0.1:${PORT}/`);
