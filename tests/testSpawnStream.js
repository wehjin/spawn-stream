/**
 * Created by wehjin on 5/24/14.
 */

var should = require("chai").should();
var SpawnStream = require('../index.js');

describe("SpawnStream", function () {
    it("should write and emit data", function (done) {
        var stream = SpawnStream('cat');
        var output = "";
        stream.on('data', function (data) {
            output += data.toString();
        });
        stream.on('end', function () {
            output.should.equal("hellogoodbyewut");
            done();
        });
        stream.on('error', function (err) {
            should.not.exist(err);
            done();
        });
        stream.write('hello');
        stream.write('goodbye');
        stream.write('wut');
        stream.end();
    });
});