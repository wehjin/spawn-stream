spawn-stream
============

Use a child process to transform a node-js stream. 

    var SpawnStream = require('spawn-stream');
    
    var grepHello = SpawnStream('grep', ['hello'])
    fs.createReadStream('input.txt')
        .pipe(grepHello).pipe(fs.createWriteStream('output.txt', 'w');

    var ffmpeg = SpawnStream('ffmpeg', ['-i', '-', '-f', 'mp4', 'pipe:1']);
    fs.createReadStream('input.ts')
        .pipe(ffmpeg).pipe(fs.createWriteStream('output.mp4', 'w');
