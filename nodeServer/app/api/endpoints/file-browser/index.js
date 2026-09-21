module.exports = {
    INIT
};
let RES = null;
let REQ = null;
let URL = null;
let BASE = "/media";
const fs = require('fs');
const path = require('path');
const static = require('../static.js');
const helper = require('../helper.js');
const { unzip } = require('zlib');
const { execFileSync } = require('child_process');
const copySamples = static.CONFIG.COPY_SAMPLES_WITH_XPM == '1';

let MOCKBA = '';


function INIT($req, $res, NS) {
    RES = $res;
    REQ = $req;
    MOCKBA = NS.MOCKBA;
    //static.refresh();
    //console.log("static was refreshed");
    URL = $req.url.replace("/^\//", '').split('/');

    switch (URL[2]) {
        case '':
        case undefined:
        case "/":
            HOME();
            break;
        case "LIST":
            LIST();
            break;
        case "READ":
            READ();
            break;
        case "SPECTROGRAM":
            doSpectrogram();
            break;
        case "FSCOMMAND":
            FSCOMMAND();
            break;
        case "DOWNLOAD":
            DOWNLOAD();
            break;
        case "UPLOAD":
            UPLOAD();
            break;

    }
}

function READ() {
    let ret = {
        DATA: '',
        ERROR: false,
    }
    $f = unescape(URL.slice(3).join("/"));

    fs.readFile($f, (err, data) => {
        if (err) {
            ret.ERROR = true;
            endJSON(ret);
            return;
        }
        ret.DATA = data.toString();
        endJSON(ret);
    });
}

function isHidden(f) {
    let hidden = static.CONFIG.HIDDEN_FILES.toLowerCase().replaceAll(' ', ',').trim().split(',').filter(e => e.startsWith('.'));
    return hidden.includes(path.extname(f).toLowerCase());
}

function isExpansion(d) {
    //console.log("checking", d);
    let m = d.match(/(.*\/Expansions\/[^\/]+)\/?/);
    if (!m) return false;
    let f = path.join(m[1], "Expansion.xml")
    return fs.existsSync(f);

}

function getTagData(data, tag) {
    let rex = new RegExp(`<${tag}>(.*)</${tag}`);
    let m = data.match(rex);
    if (m) {
        return m[1].replaceAll("&amp;", "&");
    }

    return '';

}

function getExpansionMeta(d) {
    let ex = {
        title: '',
        subtitle: '',
        image: '',
        isExpansion: false
    }

    if (!d || !isExpansion(d)) return ex;

    m = d.match(/(.*\/Expansions\/[^\/]+)\/?/);
    if (!m) return ex
    root = m[1];
    let xml = path.join(root, "Expansion.xml");
    if (!fs.existsSync(xml)) return ex;
    let fData = fs.readFileSync(xml).toString();
    let title = getTagData(fData, "title");
    let image = path.join(root, getTagData(fData, "img"));
    let multi = getTagData(fData, "multi");
    let subtitle = '';
    if (multi == "true") {
        let sub = d.replace(m[0], '');
        mt = sub.match(/^[^\/]+/);
        if (mt) {
            subtitle = mt[0];
        }

    }

    ex = {
        title: title,
        subtitle: subtitle,
        image: image,
        isExpansion: root == d
    }
    return ex;


}

function getDir(dir, ScanFiles = true) {
    let all = fs.readdirSync(dir);
    let dirs = [];
    let uncles = [];
    let files = [];
    let hidden = static.CONFIG.ADVANCED_MODE != '1';
    let isExpansionRoot = dir.endsWith("/Expansions");
    let uBase = path.dirname(dir);

    uncles = fs.readdirSync(uBase).filter(d => d != 'az01-internal' && (!hidden || !d.startsWith('.')) && fs.existsSync(path.join(uBase, d)) && fs.statSync(path.join(uBase, d))
        .isDirectory()).map(d => {

            return {
                NAME: d,
                PATH: path.join(uBase, d)
            }
        });


    all.forEach(e => {

        let full = path.join(dir, e);
        if (!fs.existsSync(full)) return;
        let info = fs.statSync(full);
        let meta = {
            path: full,
            isExpansionEntry: e == "Expansions",
            isExpansionRoot: isExpansionRoot,

            name: e,
            type: path.extname(e).toUpperCase().substring(1),
            mtime: info.mtime,
            mstime: info.mtimeMs,
            size: info.size,
            ctime: info.ctime,
            playing: false
        }

        if (info.isDirectory()) {
            if (e != 'az01-internal' && (!hidden || !e.startsWith('.'))) dirs.push(meta);
            dirs.forEach((d, i) => { // if the directory is Expansion read xml file and get Title and Image
                dirs[i]["EXMETA"] = getExpansionMeta(d.path);
            });

        } else {

            if (!e.trim().startsWith('.') && !isHidden(e)) {
                files.push(meta);
            }

        }

    });

    return {
        isExpansionRoot: isExpansionRoot,
        isExpansion: isExpansion(dir),
        EXMETA: getExpansionMeta(dir),
        FOLDERS: dirs,
        UNCLES: uncles,
        FILES: files,
        FAVS: getFAVS(),
        DISK: getDiskUsage(dir),
        CONFIG: static.CONFIG
    }

}
function getFAVS() {
    let token = 'BROWSER_FAV_';

    return Object.keys(static.CONFIG).filter(k => {
        if (!k.startsWith(token)) return false;
        let p = static.CONFIG[k];

        p = p.indexOf("::") > 0 ? p.split("::").slice(1).join("::") : p;

        if (p.trim() == '' || !p.trim().startsWith('/')) return false;
        return isDir(p);
    }).map(pp => static.CONFIG[pp]);

}

function getDiskUsage(dir) {
    try {
        let out = execFileSync('df', ['-k', dir], { encoding: 'utf8' });
        let cols = out.trim().split('\n').pop().trim().split(/\s+/);
        let total = parseInt(cols[1]) * 1024;
        let used = parseInt(cols[2]) * 1024;
        let free = parseInt(cols[3]) * 1024;
        return { TOTAL: total, USED: used, FREE: free, MOUNT: cols[cols.length - 1] };
    } catch (e) {
        return null;
    }
}


function HOME() {
    RES.writeHead(200, {
        'Content-Type': 'text/html'
    });
    let files = [];
    let CSS = [];
    let JS = [
        '/static/js/libs/jquery-3.5.1.min.js',
        '/static/js/libs/vue.js',
        '/static/js/libs/http_vue_loader.js',
        '/static/js/libs/tooling-model.js',
        '/static/apps/file-browser/model.js',
        '/static/apps/file-browser/app.js|defer',
    ];

    static.HEAD(RES, "MPC / Force Server", CSS, JS);
    RES.write('<body>');
    static.MENU(REQ, RES);
    static.INCLUDE(RES, `${__dirname}/template.html`);

    static.CLOSE(RES);
    RES.end();
}

function LIST() {
    let $LISTING = {
        FILES: [],
        FOLDERS: [],
        UNCLES: []
    };
    if (!REQ.method == "POST") {
        RES.writeHead(503, {
            'Content-Type': 'text/plain'
        });
        RES.end('INVALID REQUEST');
    }
    let $body = '';
    REQ.on('data', chunk => {
        $body += chunk.toString();
    });
    REQ.on('end', () => {
        $pl = JSON.parse($body);
        $LISTING = getDir($pl.PATH);
        endJSON($LISTING);
    });


}

function endJSON($js) {
    RES.writeHead(200, {
        'Content-Type': 'text/json'
    });
    RES.end(JSON.stringify($js));
}


function FSCOMMAND() {
    $rsp = {
        RESULT: 'OK',
        MESSAGE: 'OK'
    }
    RES.writeHead(200, {
        'Content-Type': 'text/json'
    });
    if (REQ.method == "POST") {
        let $body = '';
        REQ.on('data', chunk => {
            $body += chunk.toString();
        });

        REQ.on('end', () => {
            $pl = JSON.parse($body);
            $ocmd = $pl.COMMAND;
            $source = $pl.SOURCE;
            $target = $pl.TARGET;
            try {
                let fpath = '';
                switch ($ocmd) {
                    case 'SAVE':
                        $rsp.MESSAGE = `${$target} Saved Successfully!`;
                        doSave($target, $pl.DATA, $rsp);
                        break;

                    case 'CREATE-FOLDER':
                        fpath = path.join($source, $target);
                        $rsp.MESSAGE = `Folder ${fpath} Created!`;
                        CreateFolder(fpath, $rsp);

                        break;
                    case 'DELETE':
                        $rsp.MESSAGE = `${$source} Deleted Successfully!`;
                        doDelete($source, $rsp);

                        break;
                    case 'COPY':
                        $rsp.MESSAGE = `Files/Folders Copied Successfully!`;
                        doCopy($source, $target, 'COPY', $rsp);

                        break;
                    case 'MOVE':
                        $rsp.MESSAGE = `Files/Folders Moved Successfully!`;
                        doCopy($source, $target, 'MOVE', $rsp);

                        break;
                    case 'RENAME':
                        $rsp.MESSAGE = `Renamed ${$source} >> ${$target}`;
                        doRename($source, $target, $rsp);
                        break;
                    case 'RESTORE':
                        $rsp.MESSAGE = `Restored ${$target} >> ${$source}`;
                        RESTORE($source, $target, $rsp);
                        break;
                    case 'UNZIP':

                        $rsp.MESSAGE = `UN-ZIPPED ${$source} >> ${$target}`;
                        doUNZIP($source, $target, $rsp);

                        break;
                    case 'SETFAV':

                        $rsp.MESSAGE = `Favorite Path Updated: ${$source} `;
                        setFAV($source);
                        break;

                }
            } catch (e) {
                console.log(e);
                $rsp.RESULT = "ERROR";
                $rsp.MESSAGE = `********************************
${e.message}
********************************`;
                RES.end(JSON.stringify($rsp));
                return;
            }
            // RES.end(JSON.stringify($rsp));
            return;
        });

        return;
    }

    //  RES.end();

}

function getXPMsamples($path) {
    let samples = [];
    d = fs.readFileSync($path).toString();
    //  console.log(d);
    if (d.indexOf('<Program type="Drum">') == -1 && d.indexOf('<Program type="Keygroup">') == -1)
        return samples;
    let nodes = d.match(/<SampleName>(.+)<\/SampleName>/g).map(m => path.join(path.dirname($path), m.replaceAll(/<(\/)*SampleName>/g, '')));
    nodes = nodes.filter((v, i) => nodes.indexOf(v) == i);
    nodes.forEach(n => {
        let n1 = n + ".wav"
        let n2 = n + ".WAV"
        if (fs.existsSync(n1)) samples.push(n1);
        else if (fs.existsSync(n2)) samples.push(n2);
    });

    return samples;

}


function doSave($path, $data, $msg) {
    data = Buffer.from($data, 'base64').toString();
    fs.writeFileSync($path, data);
    RES.end(JSON.stringify($msg));
}

function CreateFolder($path, $msg) {
    fs.mkdirSync($path);
    RES.end(JSON.stringify($msg));
}

function doDelete($path, $msg) {
    let $cmd = isDir($path) ? 'rm -rf ' : 'rm -f ';
    $cmd = $cmd + `"${$path}"`;
    helper.shellSync($cmd);
    RES.end(JSON.stringify($msg));
}

function RESTORE($source, $target, $msg) {
    helper.shellSync(`cp -f "${$source}" "${$target}"`);
    console.log('RESTORED');
    RES.end(JSON.stringify($msg));
}

function doCopy($sources, $target, $mode, $msg) {
    let $ccmd = $mode == 'MOVE' ? 'mv' : 'cp';
    let cmds = ['#!/bin/sh'];
    //  cmds.push(`set +B`);
    $sources.forEach(s => {
        let $factor = s.TYPE == 'FOLDER' && $mode != "MOVE" ? ' -r' : '';
        let c = `${$ccmd} ${$factor} "${s.PATH}" "${$target}/"`;
        cmds.push(c);
        if (s.TYPE == "FILE" && isProject(s.PATH)) {
            let $pname = projectDirName(path.basename(s.PATH));
            let $pdir = path.join(path.dirname(s.PATH), $pname);
            if (!$sources.map(p => p.PATH).includes($pdir)) {
                $factor = $mode != "MOVE" ? ' -r' : ' ';
                let c = `${$ccmd} ${$factor} "${$pdir}" "${$target}/"`;
                cmds.push(c);
            }
        }
        if (s.TYPE == "FILE" && isXPM(s.PATH)) {  //HANDLE XPM BY locating samples and copying them over..
            let fbase = path.join(path.dirname(s.PATH), path.basename(s.PATH, ".xpm"));
            let dsp = fbase + ".dspreset";
            let sfz = fbase + ".sfz";
            let akp = fbase.replace(/_KG$/, "").replace(/_KT$/, "") + ".akp";


            let sFiles = [];
            sFiles = static.CONFIG.COPY_SAMPLES_WITH_XPM == "1" ? getXPMsamples(s.PATH) : [];
            if (fs.existsSync(dsp)) sFiles.push(dsp);
            if (fs.existsSync(sfz)) sFiles.push(sfz);
            if (fs.existsSync(akp)) sFiles.push(akp);
            $update = $ccmd == "cp" ? " -u" : "";
            sFiles.forEach(src => {
                let c = `[[ -f '${src}' ]] && ${$ccmd} ${$update} '${src}' "${$target}/"`;
                cmds.push(c);
            });
        }
    });

    let $script = '/tmp/' + Date.now() + '_copy.sh';
    console.log("Script is", $script);
    //  cmds.push(`set -B`);
    try {
        fs.writeFileSync($script, cmds.join("\n"));
    } catch (e) {
        console.log(e);
        throw ({ message: 'Unable To Write Batch File to /tmp' });
    }
    //console.log(cmds.join('\n'));
    const { exec } = require('child_process');
    require('child_process').execSync(`chmod +x "${$script}"`);
    exec(`sh ${$script}`, { stdio: ['ignore'] }, (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            //    helper.shellSync(`rm -f ${$script}`);
            throw (stderr.toString());
        }
        helper.shellSync(`rm -f ${$script}`);
        RES.end(JSON.stringify($msg));
    });
}

function doSpectrogram() {

    let ret = {
        MESSAGE: '',
        ERROR: false,
    }

    //sxc = `sox --info`
    //let haveSox = helper.shellSync(sxc).toString();
    //console.log(haveSox);
    let $f = unescape(URL.slice(3).join("/"));
    let tfile = `${$f}.sgram.png`;
    ;
    let size = `1024x768`;
    let cmd = `ffmpeg -y -nostdin -hide_banner -loglevel 0 -i "${$f}"  -lavfi showspectrumpic=s=${size} "${tfile}" 2>/dev/null`;

    try {
        helper.shellSync(cmd).toString();
        ret.MESSAGE = tfile;

    } catch (e) {
        ret.MESSAGE = e.toString();;
        ret.ERROR = true;
    }

    RES.end(JSON.stringify(ret));

}
function setFAV($source) {
    let hadError = false;
    let tok = "BROWSER_FAV_";
    //console.log(static.CONFIG);
    let ofavs = Object.keys(static.CONFIG).filter(k => k.startsWith(tok)).map(k => static.CONFIG[k]);
    let favs = ofavs.map((f) => f.replace(/^[^:]+::/, ""));
    let exIndex = favs.indexOf($source);
    let ret = {
        RESULT: 'OK',
        MESSAGE: "Favorite Added!"
    };
    if (exIndex != -1) {
        static.CONFIG[`${tok}${exIndex + 1}`] = '';
        ret.MESSAGE = "Favorite Removed!"

    } else {
        let empty = favs.findIndex(f => f.trim() == '');
        if (empty == -1) {
            empty = favs.length; 0
        }
        static.CONFIG[`${tok}${empty + 1}`] = $source;

    }

    static.SAVECONFIG(static.CONFIG);

    RES.end(JSON.stringify(ret));

}


function doUNZIP($source, $target, $msg) {

    let hadError = false;
    const { spawn } = require('child_process');
    const uz = spawn('unzip', ['-qo', $source, '-d', $target]);
    uz.stderr.on('data', data => {
        $msg.RESULT = "ERROR";
        $msg.MESSAGE = data.toString();
        RES.end(JSON.stringify($msg));
        return;
    });

    uz.on('close', code => {
        if (hadError) return;
        RES.end(JSON.stringify($msg));
    });
}


function doRename($source, $target, $msg) {
    let $ccmd = 'mv';
    let cmds = ['#!/bin/sh'];
    let c = `${$ccmd} "${$source}" "${$target}"`;
    cmds.push(c);
    let fn = path.basename($source);
    let nfn = path.basename($target);
    if (isProject($source)) {
        if (isType(nfn, ".xpj")) {
            $pname = projectDirName(fn);
            $nname = projectDirName(nfn);
            $base = path.dirname($source);
            $nc = `${$ccmd} "${$base}/${$pname}" "${$base}/${$nname}"`;
            cmds.push($nc);

        } else {
            throw ({ message: 'Project Extention Renaming Not Allowed' });
            return;

        }
    }
    let $script = '/tmp/' + Date.now() + '_copy.sh';
    try {
        fs.writeFileSync($script, cmds.join("\n"));
    } catch (e) {
        console.log(e);
        throw ({ message: 'Unable To Write Batch File to /tmp' });
    }
    const { exec } = require('child_process');
    exec(`sh ${$script}`, { stdio: ['ignore'] }, (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            helper.shellSync(`rm -f ${$script}`);
            throw (stderr.toString());
        }
        helper.shellSync(`rm -f ${$script}`);
        console.log($msg);
        RES.end(JSON.stringify($msg));
    });

}


function sendERROR(msg) {
    RES.writeHead(503, 'content-type:text/plain');
    RES.end(msg);
}

function isType($path, EXT) {
    return $path.toLowerCase().endsWith(EXT.toLowerCase());
}
function isProject($path) {
    $file = path.basename($path);
    $dir = path.dirname($path);
    if (!isType($file, ".xpj")) return false;
    if (!isDir(path.join($dir, projectDirName($file)))) return false;
    return true;

}
function isXPM($path) {
    $file = path.basename($path);
    $dir = path.dirname($path);
    return isType($file, ".xpm") && fs.existsSync($path);

}
function projectDirName($file) {
    let fbase = $file.slice(0, -4);
    return `${fbase}_[ProjectData]`;

}
function isDir($path) {
    // if ($path.indexOf("@") > 0) $path = $path.split("@").slice(1).join("@");
    //console.log($path);
    return fs.existsSync($path) && fs.statSync($path).isDirectory();

}

function waitHeader() {
    $html = `
    <html>
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> Archive Download</title>
    </head>
    <style>
    pre {
    display:block;
    padding:16px;
    max-height: calc(100vh - 250px);
    overflow-y:scroll;
    border:1px dotted #000;
    font-size:10px;
   }
   .error {
       font-size:12px;
       font-weight:bold;
       margin:8px;
       color:red;
   }
   body {padding:16px;}
   .download{
       display:block;
       width:100%;
       background-color:#fff;
       height:32px;
       position:absolute;
       top:0px;
       left:16px;
       right:16px;
   }
    </style>
    </html>
    <body>
    <p>Generating Archive ... Please Wait..</p><hr/>    
    `;
    RES.write($html);

}
function DownloadDIR() {

    $d = static.CONFIG.DOWNLOADS_DIR || '';
    if ($d.trim() == '') $d = path.join(MOCKBA, 'Downloads');
    if (!isDir($d)) fs.mkdirSync($d);
    return $d;
}

function GENERATE_ARCHIVE($path) {
    let fn = path.basename($path);
    let dir = path.dirname($path);
    let $tar = '';
    if (isDir($path)) {
        $tar = `${DownloadDIR()}/${fn}.tar`;
        $cmd = `tar -cvf ${$tar} -C "${dir}" "${fn}"`;
        $opts = ['-cvf', `${$tar}`, '-C', `${dir}/${fn}`, '.'];

    }
    else { //project
        let bfn = fn.slice(0, -4);
        $tar = `${DownloadDIR()}/${bfn}.tar`;
        let pname = projectDirName(fn);
        $cmd = `tar -cvf ${$tar} -C "${dir}" "${fn}" ${pname}`;
        $opts = ['-cvf', `${$tar}`, '-C', `${dir}`, `${fn}`, `${pname}`];
    }


    waitHeader();
    const { spawn } = require('child_process');
    const tar = spawn('tar', $opts);
    let hadError = false;
    RES.write(`<pre>
Adding Files ....
`);
    tar.stdout.on('data', data => {
        RES.write(data);
    });
    tar.stderr.on('data', data => {
        hadError = true;
        RES.write(`</pre>

        <div class="error"><h2>ERROR</h2> ${data.toString()}</div>
        </body></html>
        `);

        console.log(data.toString());

    });
    tar.on('close', code => {
        if (hadError) return;
        RES.write('</pre>');
        let $tarname = path.basename($tar);
        writeArchivePost(`/file-browser/DOWNLOAD/${escape($tar)}`, $tarname);

    });

}
function writeArchivePost($url, $name) {
    $body = `
    <p> Archive Generated in ${DownloadDIR()}, You may want to Delete that after Downloading.</p>
    <h2 class="download"><a href="${$url}"> Download ${$name}</a></h2>
    </body></html>
    `;
    RES.end($body);
}

function DOWNLOAD() {
    $f = URL.slice(3).join("/");
    if (!$f || $f == undefined) {
        sendERROR('INVALID FILE');
        return;
    }
    let $file = unescape($f);
    if (!fs.existsSync($file)) {
        RES.writeHead(404, { "Content-Type": "text/plain" });
        RES.write("404 Not Found\n");
        RES.end();
        return;
    }
    $fn = $file.split('/').pop();
    if (isProject($file) || isDir($file)) {
        GENERATE_ARCHIVE($file);
        return;
    }

    let size = fs.statSync($file).size;
    RES.writeHead(200, {
        'Content-Length': size,
        'Content-disposition': 'attachment; filename="' + $fn + '"'
    });
    let fstream = fs.createReadStream($file);
    fstream.pipe(RES);
}

function UPLOAD() {
    let $rsp = { RESULT: 'OK', MESSAGE: 'OK' };
    let $target = unescape(URL.slice(3).join("/"));
    if (!$target || !isDir($target)) {
        RES.writeHead(200, { 'Content-Type': 'text/json' });
        RES.end(JSON.stringify({ RESULT: 'ERROR', MESSAGE: 'Invalid Target Directory' }));
        return;
    }
    $target = path.resolve($target);
    if (!$target.startsWith(BASE)) {
        RES.writeHead(200, { 'Content-Type': 'text/json' });
        RES.end(JSON.stringify({ RESULT: 'ERROR', MESSAGE: 'Invalid Target Directory' }));
        return;
    }

    let contentType = REQ.headers['content-type'] || '';
    let $bmatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/);
    if (!$bmatch) {
        RES.writeHead(200, { 'Content-Type': 'text/json' });
        RES.end(JSON.stringify({ RESULT: 'ERROR', MESSAGE: 'Invalid Upload Request' }));
        return;
    }
    let boundary = $bmatch[1] || $bmatch[2];

    let chunks = [];
    REQ.on('data', chunk => chunks.push(chunk));
    REQ.on('end', () => {
        try {
            let body = Buffer.concat(chunks);
            let parts = parseMultipart(body, boundary);
            let written = [];
            parts.forEach(p => {
                if (!p.filename) return;
                let segs = p.filename.replace(/\\/g, '/').split('/').filter(s => s && s != '.' && s != '..');
                if (!segs.length) return;
                let dest = path.resolve(path.join($target, ...segs));
                if (dest != $target && !dest.startsWith($target + path.sep)) return; // traversal guard
                fs.mkdirSync(path.dirname(dest), { recursive: true });
                fs.writeFileSync(dest, p.data);
                written.push(segs.join('/'));
            });
            $rsp.MESSAGE = `Uploaded ${written.length} File(s) to ${$target}`;
            $rsp.FILES = written;
            RES.writeHead(200, { 'Content-Type': 'text/json' });
            RES.end(JSON.stringify($rsp));
        } catch (e) {
            console.log(e);
            RES.writeHead(200, { 'Content-Type': 'text/json' });
            RES.end(JSON.stringify({ RESULT: 'ERROR', MESSAGE: e.message }));
        }
    });
}

function parseMultipart(buffer, boundary) {
    let boundaryBuf = Buffer.from('--' + boundary);
    let parts = [];
    let start = buffer.indexOf(boundaryBuf);
    while (start !== -1) {
        let next = buffer.indexOf(boundaryBuf, start + boundaryBuf.length);
        if (next === -1) break;
        let partBuf = buffer.slice(start + boundaryBuf.length, next);
        let headerEnd = partBuf.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
            let headerStr = partBuf.slice(0, headerEnd).toString('utf8');
            let data = partBuf.slice(headerEnd + 4, partBuf.length - 2);
            let nameMatch = headerStr.match(/name="([^"]*)"/);
            let filenameMatch = headerStr.match(/filename="([^"]*)"/);
            if (filenameMatch) {
                parts.push({
                    name: nameMatch ? nameMatch[1] : '',
                    filename: filenameMatch[1],
                    data
                });
            }
        }
        start = next;
    }
    return parts;
}