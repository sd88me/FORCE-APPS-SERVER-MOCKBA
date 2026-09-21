/**
 * URL ENDPOINTS FOR THE APP
 * 
 */

module.exports = [
    {
        NAME: "Home",
        PATH: "./api/endpoints/home.js",
        PARAM: "/",
        URL: "/",
        HIDDEN: false,
        HOME: false,
        TARGET: "_self"
    },


    {
        NAME: "File Manager",
        PATH: "./api/endpoints/file-browser/index.js",
        PARAM: "/file-browser",
        URL: "/file-browser",
        HIDDEN: false,
        HOME: true,
        TARGET: "_self"
    },

    {
        NAME: "Arps Manager",
        PATH: "./api/endpoints/arp-manager/index.js",
        PARAM: "/arps",
        URL: "/arps",
        HIDDEN: false,
        HOME: false,
        TARGET: "_self"
    },
    {
        NAME: "Static Assets",
        PATH: "./api/endpoints/static.js",
        PARAM: "/static",
        URL: "/static",
        HIDDEN: true,
        HOME: false,
        TARGET: "_self"
    },
    {
        NAME: "Progression Builder",
        PATH: "./api/endpoints/progression-builder/index.js",
        PARAM: "/pbuilder",
        URL: "/pbuilder",
        HIDDEN: false,
        HOME: true,
        TARGET: "_self"

    },
    {
        NAME: "Projects",
        PATH: "./api/endpoints/projects/index.js",
        PARAM: "/projects",
        URL: "/projects",
        HIDDEN: true,
        HOME: true,
        TARGET: "_self"
    },
    {
        NAME: "Project Templates",
        PATH: "./api/endpoints/project-templates/index.js",
        PARAM: "/project-templates",
        URL: "/project-templates",
        HIDDEN: false,
        HOME: true,
        TARGET: "_self"
    },
    {
        NAME: "Captures",
        PATH: "./api/endpoints/captures/index.js",
        PARAM: "/captures",
        URL: "/captures",
        HIDDEN: false,
        HOME: true,
        TARGET: "_self"
    },
    {
        NAME: "TOOLING",
        PATH: "./api/endpoints/tooling/index.js",
        PARAM: "/tooling",
        URL: "/tooling",
        HIDDEN: true,
        HOME: false,
        TARGET: "_self"
    },
    {
        NAME: "Track Arranger",
        PATH: "./api/endpoints/track-arranger/index.js",
        PARAM: "/track-arranger",
        URL: "/track-arranger",
        HIDDEN: true,
        HOME: false,
        TARGET: "_self"
    },
    {
        NAME: "Module Manager",
        PATH: "./api/endpoints/moduler/index.js",
        PARAM: "/moduler",
        URL: "/moduler",
        HIDDEN: false,
        HOME: true,
        TARGET: "_self"

    },
    {
        NAME: "Helper Tools",
        PATH: "./api/endpoints/helpers/index.js",
        PARAM: "/helpers",
        URL: "/helpers",
        HIDDEN: false,
        HOME: true,
        TARGET: "_self"
    },
    {
        NAME: "Shell Console",
        PATH: "./api/endpoints/shell/index.js",
        PARAM: "/shell",
        URL: "/shell",
        HIDDEN: false,
        HOME: true,
        TARGET: "_self"
    },
    {
        NAME: "Config",
        PATH: "./api/endpoints/config/config.js",
        PARAM: "/config",
        URL: "/config",
        HIDDEN: false,
        HOME: true,
        TARGET: "_self"
    },

    {
        NAME: "Extra Prefs",
        PATH: "./api/endpoints/prefs/index.js",
        PARAM: "/prefs",
        URL: "/prefs",
        HIDDEN: false,
        HOME: true,
        TARGET: "_self"
    },

    {
        NAME: "Template",
        PATH: "./api/endpoints/app-template/index.js",
        PARAM: "/template",
        URL: "/template",
        HIDDEN: true,
        HOME: false,
        TARGET: "_self"
    },
    {
        NAME: "SSH",
        PATH: "./api/endpoints/xterm/index.js",
        PARAM: "/ssh",
        URL: "/ssh",
        HIDDEN: true,
        HOME: false,
        TARGET: "_self"
    },
    {
        NAME: "MidiLoop Control",
        PATH: "./api/endpoints/MIDILOOP/index.js",
        PARAM: "/MIDILOOP",
        URL: "/MIDILOOP",
        HIDDEN: false,
        HOME: true,
        TARGET: "MIDILOOP"
    },
    {
        NAME: "HARPIE4T Editor",
        PATH: "./api/endpoints/HARPIE4T/index.js",
        PARAM: "/HARPIE4T",
        URL: "/HARPIE4T",
        HIDDEN: false,
        HOME: true,
        TARGET: "HARPIE4T"
    },
    {
        NAME: "RiffMaker4T Editor",
        PATH: "./api/endpoints/RIFFMAKER4T/index.js",
        PARAM: "/RIFFMAKER4T",
        URL: "/RIFFMAKER4T",
        HIDDEN: false,
        HOME: true,
        TARGET: "RIFFMAKER4T"
    },
    {
        // Acid runs its own standalone server (not an in-process
        // nodeServer module -- see force-acid/web/README.md). URL/PARAM stay
        // a plain relative path on purpose (home.js's escape() call mangles
        // absolute "http://host:port" URLs -- see forceacid.js); clicking
        // this link hits nodeServer's own /forceacid route, which
        // forceacid.js immediately 302-redirects out to the real panel.
        NAME: "Acid",
        PATH: "./api/endpoints/forceacid.js",
        PARAM: "/forceacid",
        URL: "/forceacid",
        HIDDEN: false,
        HOME: true,
        TARGET: "FORCEACID"
    },
    {
        // Maze Voice runs its own standalone server (not an in-process
        // nodeServer module -- see force-maze/web/README or server.py). URL/
        // PARAM stay a plain relative path on purpose (home.js's escape()
        // call mangles absolute "http://host:port" URLs -- see
        // forcemaze.js); clicking this link hits nodeServer's own
        // /forcemaze route, which forcemaze.js immediately 302-redirects
        // out to the real panel.
        NAME: "Maze Voice",
        PATH: "./api/endpoints/forcemaze.js",
        PARAM: "/forcemaze",
        URL: "/forcemaze",
        HIDDEN: false,
        HOME: true,
        TARGET: "FORCEMAZE"
    },
    {
        // Maze Sequencer runs its own standalone server (not an
        // in-process nodeServer module -- see force-maze/maze-sequencer/
        // web/README or server.py). URL/PARAM stay a plain relative path
        // on purpose (home.js's escape() call mangles absolute
        // "http://host:port" URLs -- see forcemazeseq.js); clicking this
        // link hits nodeServer's own /forcemazeseq route, which
        // forcemazeseq.js immediately 302-redirects out to the real panel.
        NAME: "Maze Sequencer",
        PATH: "./api/endpoints/mazeseq.js",
        PARAM: "/mazeseq",
        URL: "/mazeseq",
        HIDDEN: false,
        HOME: true,
        TARGET: "MAZESEQ"
    },
    {
        // DX7 runs its own standalone server (not an in-process nodeServer
        // module -- see force-dx7/web/server.py). URL/PARAM stay a plain
        // relative path on purpose (home.js's escape() call mangles
        // absolute "http://host:port" URLs -- see forcedx7.js); clicking
        // this link hits nodeServer's own /forcedx7 route, which
        // forcedx7.js immediately 302-redirects out to the real panel.
        NAME: "DX7",
        PATH: "./api/endpoints/forcedx7.js",
        PARAM: "/forcedx7",
        URL: "/forcedx7",
        HIDDEN: false,
        HOME: true,
        TARGET: "FORCEDX7"
    },
    {
        // JV-880 runs its own standalone server (not an in-process
        // nodeServer module -- see force-jv880/web/server.py). URL/PARAM
        // stay a plain relative path on purpose (home.js's escape() call
        // mangles absolute "http://host:port" URLs -- see forcejv880.js);
        // clicking this link hits nodeServer's own /forcejv880 route, which
        // forcejv880.js immediately 302-redirects out to the real panel.
        NAME: "JV-880",
        PATH: "./api/endpoints/forcejv880.js",
        PARAM: "/forcejv880",
        URL: "/forcejv880",
        HIDDEN: false,
        HOME: true,
        TARGET: "FORCEJV880"
    }
,
    {
        NAME: "Kit Builder",
        PATH: "./api/endpoints/kitbuilder/index.js",
        PARAM: "/kit-builder",
        URL: "/kit-builder",
        HIDDEN: false,
        HOME: true,
        TARGET: "_self"
    }
];