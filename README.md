spawn-stream
============

Transform a stream by through a child process. 

    var SpawnStream = require('spawn-stream');
    
    var grepHello = SpawnStream('grep', ['hello'])
    fs.createReadStream('input.txt')
        .pipe(grepHello).pipe(fs.createWriteStream('output.txt', 'w');

    var ffmpeg = SpawnStream('ffmpeg', ['-i', '-', '-f', 'mp4', 'pipe:1']);
    fs.createReadStream('input.ts')
        .pipe(ffmpeg).pipe(fs.createWriteStream('output.mp4', 'w');
