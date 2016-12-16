'use strict';

var _connection = require('./connection.service');

var _connection2 = _interopRequireDefault(_connection);

var _contracts = require('@akashaproject/contracts.js');

var _contracts2 = _interopRequireDefault(_contracts);

var _fs = require('fs');

var _header = require('./header');

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var settings = require('./settings.json');
var Table = require('tty-table');

var logsConnection = (0, _connection2.default)();
var lastRecord = settings[settings.length - 1];
var count = lastRecord.count;
var currentBlock = lastRecord.fromBlock;
var tail = function tail() {
    var rows = [];
    logsConnection.connect('tail');
    var draw = (0, _lodash2.default)(function () {
        var t2 = Table(_header.headerProfile, rows, {
            borderStyle: 1,
            paddingBottom: 0,
            headerAlign: "center",
            align: "center"
        });

        var str2 = t2.render();
        console.log(str2);
        rows = [];
    }, 8000);
    var run = function run() {
        var factory = new _contracts2.default.Class(logsConnection.get().web3API);
        var watcher = factory.objects.registry.Register({}, { fromBlock: lastRecord.fromBlock, toBlock: 'latest' });
        watcher.watch(function (err, registered) {
            currentBlock = registered.blockNumber;
            var profile = factory.classes.Profile.at(registered.args.profile);
            profile._hash.call(0, function (err0, firstPart) {
                profile._hash.call(1, function (err1, secondPart) {
                    if (!err0 && !err1) {
                        (function () {
                            var resource = logsConnection.getIpfs([firstPart, secondPart]);
                            logsConnection.get().ipfsAPI.object.get(resource, function (errFinal, data) {
                                rows.push([logsConnection.get().web3API.toUtf8(registered.args.id), registered.args.profile, resource, JSON.stringify(data.data), count]);
                                draw();
                                count++;
                            });
                        })();
                    }
                });
            });
        });
    };
    setTimeout(run, 2000);
};

tail();
var writeToSettings = function writeToSettings(code) {
    settings.push({ fromBlock: currentBlock, count: count });
    var newData = JSON.stringify(settings);
    (0, _fs.writeFileSync)(__dirname + '/settings.json', newData);
    process.exit();
};

process.on('SIGTERM', writeToSettings);
process.on('SIGINT', writeToSettings);
//# sourceMappingURL=index.js.map