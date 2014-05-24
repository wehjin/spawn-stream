/**
 * Created by wehjin on 5/23/14.
 */

//ffmpeg -i test.mp4 -y -strict -2 -acodec aac -vcodec h264 -movflags frag_keyframe -f mp4 - > out.mp4

var through = require('through');
var spawn = require('child_process').spawn;
var fs = require('fs');

var child = spawn('ffmpeg', [
    '-i', '-',
    '-y',
    '-strict', '-2',
    '-acodec', 'aac',
    '-vcodec', 'h264',
    '-movflags', 'frag_keyframe',
    '-f', 'mp4',
    'pipe:1'
], {
    stdio: ['pipe', 'pipe', 'ignore']
});

var stream = through(function write(data) {
        child.stdin.write(data);
    },
    function end() {
        child.stdin.end();
    });

child.stdin.on('error', function (error) {
    stream.emit('error', error);
});

child.stdout.on('data', function (data) {
    stream.emit('data', data);
});

child.stdout.on('end', function () {
    stream.emit('end');
});

child.stdout.on('error', function (error) {
    stream.emit('error', error);
});

child.on('error', function (error) {
    stream.emit('error', error);
});

var outputStream = fs.createWriteStream('out_final.mp4', 'w');
fs.createReadStream('test_original.mp4').pipe(stream).pipe(outputStream);