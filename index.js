/**
 * Created by wehjin on 5/23/14.
 */

var util = require('util');
var stream = require('stream');
var Transform = stream.Transform;
var spawn = require('child_process').spawn;

util.inherits(SpawnStream, Transform);

module.exports = SpawnStream;

function SpawnStream(command, commandArguments, options) {
    if (!(this instanceof SpawnStream))
        return new SpawnStream(command, arguments);

    var streamOptions = (options && options['stream']) ? options['stream'] : {};
    Transform.call(this, streamOptions);

    var spawnOptions = (options && options['spawn']) ? options['spawn'] : {};
    spawnOptions.stdio = ['pipe', 'pipe', 'ignore'];
    this.command = command;
    this.commandArguments = commandArguments;
    this.spawnOptions = spawnOptions;
}

SpawnStream.prototype._transform = function (chunk, encoding, callback) {
    if (!this.child) {
        var transform = this;
        var child = spawn(this.command, this.commandArguments, this.spawnOptions);
        this.child = child;
        this.stdoutDidEnd = false;

        // When we get data on stdout, push it downstream.  But if we get an end, do
        // not push it downstream stream yet.  Mark it so that we know it occurred in
        // _flush.  Pass through any error.
        child.stdout
            .on('data', function (data) {
                transform.push(data);
            })
            .on('end', function (data) {
                if (data) {
                    transform.push(data);
                }
                transform.stdoutDidEnd = true;
            })
            .on('error', this.emit.bind(this));

        // Pass through errors from stdin and the child.
        child.stdin.on('error', this.emit.bind(this));
        child.on('error', this.emit.bind(this));
    }

    // Pass data from upstream to the child.
    this.child.stdin.write(chunk, encoding);
    callback();
};

SpawnStream.prototype._flush = function (callback) {
    var transform = this;

    function onEnd() {
        transform.child.kill();
        delete transform.child;
        callback();
    }

    if (!this.child) {
        callback();
    } else if (this.stdoutDidEnd) {
        this.child.stdin.end();
        onEnd();
    } else {
        this.child.stdin.end();
        this.child.stdout.once('end', onEnd);
    }
};
