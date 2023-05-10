
const FS = require ('fs');
const HTTP = require ('http');
const PATH = require ('path');
const PROCESS = require ('process');


const STATIC_PATH = PATH.join (PROCESS.cwd (), './');
const BEYOND_STATIC_PATH = PATH.join (PROCESS.cwd (), './beyond/');


function HamHandleMaker (out_fname)
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

      const poop_base = PATH.basename (out_fname);
      const poop_fname = PATH.join (PROCESS.cwd (), './', poop_base);
console.log("OOOOOUUUUT is this: " + poop_fname);
      const phyle = FS.openSync (poop_fname, 'a');
      if (phyle < 0)
        { let err =
            new Error ("Couldn't damn well open" + poop_fname + "...")
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

  const beyond_url = 'http://localhost:9009' + url_frag;
  const prom_hand = HamHandleMaker (file_path);
  HTTP.get (beyond_url, prom_hand[1])
  . on ('error',
        (e) => { console.error (`Horrible, horrible error: ${e.message}`); }
       );
  return prom_hand[0];
}


console.log ("ABOOOOOT TO GO:");

//RetrieveFromBeyond ("/apps/flamv/flamv.html");
let prommy = RetrieveFromBeyond ("/snacks/flamv/stein-picabia-smaller.png");
console.log ("yep -- it's prommy: " + prommy);

prommy . then (() => { console.log (" - - - and having then gone - - - "); });
