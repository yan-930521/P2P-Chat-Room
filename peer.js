class P2P {
    constructor(config) {
        this.config = {
            name: null,
            avatar: null,
            host: null
        };

        for (let c in this.config) {
            this.config[c] = config.get(c);
        }

        this.uuid = this._uuid();

        this.ondata = (msg) => {
            console.log(msg);
        }

        this.ownConfig = null;
    }

    init = async () => {
        if (this.config.host) {
            await this._createPeer(null);
            this.connect(this.config.host);
        } else {
            this._createPeer(this.uuid);
        }

    }

    send = (msg) => {
        if (this.connection) this.connection.send(msg);
    }

    _createPeer = (uuid) => {
        return new Promise((res, rej) => {
            this.peer = new Peer(uuid, { debug: 3 });
            this.connection = null;
            this.peer.on('open', (id) => {
                console.log('ID: ' + id);
                res();
            });
            this.peer.on('connection', (conn) => {
                console.log("new connection created");
                this.connection = conn;
                this.connection.on("data", (data) => {
                    if (this.ondata) this.ondata(data);
                });
            });
            this.peer.on('disconnected', () => {
                console.log('Connection lost. Please reconnect');
                this.peer.reconnect();
            });
            this.peer.on('close', () => {
                console.log('Connection destroyed');
            });
            this.peer.on('error', (err) => {
                console.log(err);
            });
        })
    }

    connect = (uuid) => {
        this.connection = this.peer.connect(uuid, {
            reliable: true
        });

        console.log("Connecting to: " + this.connection.peer);

        this.connection.on('data', (data) => {
            if (this.ondata) this.ondata(data);
        });
        this.connection.on('open', () => {
            console.log("Connected to: " + this.connection.peer);
            this.send({
                config: this.ownConfig,
                type: "CONFIG"
            });
        });
        this.connection.on('close', () => {
            console.log("Connection closed");
        });

    }


    _uuid = () => {
        let d = Date.now();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

}