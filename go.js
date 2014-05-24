/**
 * Created by wehjin on 5/23/14.
 */

var util = require('util');
var stream = require('stream');
var Duplex = stream.Duplex;
var PassThrough = stream.PassThrough;
var spawn = require('child_process').spawn;
var fs = require('fs');

util.inherits(SpawnStream, Duplex);

function SpawnStream(command, arguments, options) {
    if (!(this instanceof SpawnStream))
        return new SpawnStream(command, arguments);

    var spawnOptions = (options && options['spawn']) ? options['spawn'] : {};
    spawnOptions.stdio = ['pipe', 'pipe', 'ignore'];
    var child = spawn(command, arguments, spawnOptions);

    var streamOptions = (options && options['stream']) ? options['stream'] : {};
    this._reader = new PassThrough(streamOptions);
    this._writer = new PassThrough(streamOptions);
    Duplex.call(this, streamOptions);

    this.connectPassThroughError();
    this.connectChild(child);

    this._readableState = this._reader._readableState;
    this._writableState = this._writer._writableState;

}

SpawnStream.prototype.connectPassThroughError = function () {
    this._reader.on('error', this.emit.bind(this));
    this._writer.on('error', this.emit.bind(this));
};

SpawnStream.prototype.connectChild = function (child) {
    child.on('error', this.emit.bind(this));
    child.stdout.pipe(this._reader);
    this._writer.pipe(child.stdin);
    this._reader.read(0);
    this._writer.read(0);
    child.stdout.read(0);
};

SpawnStream.prototype.getTarget = function (event) {
    switch (event) {
        case 'readable':
        case 'data':
        case 'end':
        case 'close':
            return this._reader;
        case 'drain':
        case 'finish':
        case 'pipe':
        case 'unpipe':
            return this._writer;
        default:
            return this;
    }
};

SpawnStream.prototype.on = SpawnStream.prototype.addListener = function (event, listener) {
    var target = this.getTarget(event);
    if (target === this) {
        return Duplex.prototype.on.call(this, event, listener);
    } else {
        target.on(event, listener);
        return this;
    }
};

SpawnStream.prototype.once = function (event, listener) {
    var target = this.getTarget(event);
    if (target === this) {
        return Duplex.prototype.once.call(this, event, listener);
    } else {
        target.once(event, listener);
        return this;
    }
};

SpawnStream.prototype.removeListener = function (event, listener) {
    var target = this.getTarget(event);
    if (target === this) {
        return Duplex.prototype.removeListener.call(this, event, listener);
    } else {
        target.removeListener(event, listener);
        return this;
    }
};

SpawnStream.prototype.removeAllListeners = function (event) {
    Duplex.prototype.removeListener.call(this, event);
    if (event) {
        var target = this.getTarget(event);
        if (target === this) {
            return Duplex.prototype.removeAllListeners(event);
        } else {
            target.removeAllListeners(event);
            return this;
        }
    } else {
        Duplex.prototype.removeAllListeners(event);
        this._reader.removeAllListeners(event);
        this._writer.removeAllListeners(event);
        this.connectPassThroughError();
        return this;
    }
};

SpawnStream.prototype.listeners = function (event) {
    var target = this.getTarget(event);
    if (target === this) {
        return Duplex.prototype.listeners.call(this, event);
    } else {
        return target.listeners(event);
    }
};

SpawnStream.prototype.emit = function (event) {
    var target = this.getTarget(event);
    if (target === this) {
        return Duplex.prototype.emit.apply(this, arguments);
    } else {
        return target.emit.apply(target, arguments);
    }
};

SpawnStream.prototype.pipe = function (destination, options) {
    return this._reader.pipe(destination, options);
};

SpawnStream.prototype.setEncoding = function (encoding) {
    return this._reader.setEncoding(encoding);
};

SpawnStream.prototype.read = function (size) {
    return this._reader.read(size);
};

SpawnStream.prototype.end = function (chunk, encoding, callback) {
    return this._writer.end(chunk, encoding, callback);
};

SpawnStream.prototype.write = function (chunk, encoding, callback) {
    return this._writer.write(chunk, encoding, callback);
};


var arguments = [
    '-i', '-',
    '-y',
    '-strict', '-2',
    '-acodec', 'aac',
    '-vcodec', 'h264',
    '-movflags', 'frag_keyframe',
    '-f', 'mp4',
    'pipe:1'
];

var cmd = 'ffmpeg';
var h264Stream = new SpawnStream(cmd, arguments);

var outputStream = fs.createWriteStream('out_final.mp4', 'w');
fs.createReadStream('test_original.mp4').pipe(h264Stream).pipe(outputStream);