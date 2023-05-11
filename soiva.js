
const FS = require ('fs');
const HTTP = require ('http');
const PATH = require ('path');
const PROCESS = require ('process');


let PORT = 8000;
//const BEYOND_PRT = 9009;
let reaching_beyond = false;
let BEYOND_URLBASE = undefined;

if (process.argv.length > 2)
  PORT = parseInt (process.argv[2]);

if (process.argv.length > 3)
  { reaching_beyond = true;
    BEYOND_URLBASE = process.argv[3];
  }


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


const STATIC_PATH = PATH.join (PROCESS.cwd (), './');
const BEYOND_STATIC_PATH = PATH.join (PROCESS.cwd (), './beyond/');

const toBool = [() => true, () => false];


function HamHandleMaker (out_fpath)
{ let happy_end_fn, sad_end_fn;
  let prawm = new Promise ((hf, sf) => { happy_end_fn = hf;
                                         sad_end_fn = sf;
                                       });
  function HamHandle (res)
    { const { statusCode } = res;
      const contentType = res.headers['content-type'];

      // Any 2xx status code signals a successful response but
      // here we're only checking for 200.
      if (statusCode !== 200)
        { let err =
            new Error ('Request Failed.\n' + `Status Code: ${statusCode}`);
          console.error (err.message);
          // Consume response data to free up memory
          res.resume ();
          sad_end_fn ();
          return;
        }

console.log("OOOOOUUUUT is this: " + out_fpath);
      const dir = PATH.dirname (out_fpath);
      if (! FS.existsSync (dir))
        FS.mkdirSync (dir, { recursive: true });
      const phyle = FS.openSync (out_fpath, 'a');
      if (phyle < 0)
        { let err = new Error ("Couldn't damn well open" + out_fpath + "...")
          console.error (err.message);
          // Consume response data to free up memory
          res.resume ();
          sad_end_fn ();
          return;
        }

      //res.setEncoding('utf8');
      let rawData = '';
      res.on ('data', (chunk) => { rawData += chunk;
                                   FS.writeSync (phyle, chunk);
                                   //console.log (chunk);
                                 });
      res.on ('end',
              () => { try
                         { console.log ("data go bye-bye...");
                           FS.closeSync (phyle);
                           happy_end_fn ();
                         }
                      catch (e)
                        { console.error (e.message);
                          sad_end_fn ();
                        }
                    });
    }
  return [prawm, HamHandle];
}


async function RetrieveFromBeyond (url_frag)
{ const path_chunks = [STATIC_PATH, url_frag];
  if (url_frag.endsWith('/'))
    path_chunks . push ('index.html');
  const file_path = PATH.join (...path_chunks);

  const byon_url = BEYOND_URLBASE + url_frag;
  const prom_hand = HamHandleMaker (file_path);
  HTTP.get (byon_url, prom_hand[1])
  . on ('error',
        (e) => { console.error (`Horrible, horrible error: ${e.message}`); }
       );
  return prom_hand[0];
}


const FileStreamFromURL = async function (url) {
console.log (`yeah, well, urly thus: ${url}`);
  const path_chunks = [STATIC_PATH, url];
  if (url.endsWith('/'))
    path_chunks . push ('index.html');
  const file_path = PATH.join (...path_chunks);
  const path_transgression = ! file_path . startsWith (STATIC_PATH);
  let exists = await FS.promises . access (file_path) . then (...toBool);
  if (! exists  &&  reaching_beyond)
    { await RetrieveFromBeyond (url);
      exists = await FS.promises . access (file_path) . then (...toBool);
    }
  const found = ! path_transgression  &&  exists;
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

console.log (`Soiva heaving at http://127.0.0.1:${PORT}/`);
