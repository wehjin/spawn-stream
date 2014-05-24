/**
 * Created by wehjin on 5/24/14.
 */

var should = require("chai").should();
var SpawnStream = require('../index.js');
var fs = require('fs');

describe("SpawnStream", function () {
    it("should write and emit data", function (done) {

        var output = "";
        var stream = new SpawnStream('cat', null, {debug: true});

        /*
         fs.createReadStream('tests/testdata1.txt')
         .pipe(SpawnStream('cat'))
         */
        stream
            .on('data', function (data) {
                output += data.toString();
            })
            .on('end', function () {
                output.should.equal("hellogoodbyewut");
                done();
            })
            .on('error', function (err) {
                should.not.exist(err);
                done();
            });
        stream.write('hello');
        stream.write('goodbye');
        stream.write('wut');
        stream.end();
    });
});