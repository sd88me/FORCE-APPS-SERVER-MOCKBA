let Model = {
    PATH: '/media',
    CACHE: [],
    FILES: [],
    FOLDERS: [],
    UNCLES: [],
    FAVS: [],
    UPDATED: false,
    SORTBY: 'name',
    SORTNUMERIC: false,
    SORTDESC: false,
    TOOLING_OPERATIONS: TOOLING_OPERATIONS,
    CONFIG: {},
    DISK: null,
    CLIPBOARD: {
        PATH: '',
        OPERARATION: "COPY",
        NODES: []

    },
    READONLY: [
        '/media/acvs-synths',
        '/media/az01-internal',
    ],

    browse(path) {
        Model.PATH = path;
        Model.refresh();
    },
    refresh() {
        fetch("/file-browser/LIST", {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({ PATH: Model.PATH })
        })
            .then((response) => {
                response.json().then(data => {
                    Model.FILES = data.FILES;
                    Model.FOLDERS = data.FOLDERS;
                    Model.UNCLES = data.UNCLES;
                    Model.FAVS = data.FAVS;
                    Model.CONFIG = data.CONFIG;
                    Model.DISK = data.DISK;
                    Model.isExpansionRoot = data.isExpansionRoot;
                    Model.isExpansion = data.isExpansion;
                    Model.EXMETA = data.EXMETA;
                    Model.doSorting(Model.SORTBY, Model.SORTNUMERIC, true);

                    Model.update();

                });
            }).catch((e => console.log(e.message)));

    },
    sortFlat(arr, fld, numbered) {
        arr.sort((a, b) => {
            if (!numbered) return compare(a[fld], b[fld]);
            return Number(a[fld]) - Number(b[fld]);
        });

    },
    doSorting(fld, numbered, forced = false) {
        Model.SORTNUMERIC = numbered;
        Model.SORTBY = fld;

        let nonFolder = ['size', 'type'];

        this.sortFlat(Model.FILES, fld, numbered);

        if (nonFolder.includes(fld)) {
            this.sortFlat(Model.FOLDERS, 'name', false);
        } else {
            this.sortFlat(Model.FOLDERS, fld, numbered);
        }

        if (Model.SORTDESC) {

            Model.FILES = Model.FILES.reverse();
            if (nonFolder.includes(fld)) {
                this.sortFlat(Model.FOLDERS, 'name', false);
            }
            else {
                Model.FOLDERS = Model.FOLDERS.reverse();
            }
        }

        Model.update();

    },

    update() {
        Model.UPDATED = true;
        setTimeout(() => { Model.UPDATED = false }, 500);
    }

};

function compare(a, b) {
    try {
        a = a.toLowerCase();
        b = b.toLowerCase();

        if (a < b) return -1;
        if (a > b) return 1;
    } catch (e) { }
    return 0;
}

(async () => {
    Model.refresh();
    // let res = await fetch('/config/LOAD');
    //  let result = await res.json();
    //Model.CONFIG = result;
})();