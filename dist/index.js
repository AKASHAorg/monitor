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
        logsConnection.get().web3API.eth.defaultAccount = process.env.BOT_ADDR ? process.env.BOT_ADDR : '0xd06a3090ae7c17970dd785bce846c13a98e9f43b';
        watcher.watch(function (err, registered) {
            currentBlock = registered.blockNumber;
            var profile = factory.classes.Profile.at(registered.args.profile);
            var reqFollow = factory.objects.feed.follow.request(registered.args.id, { gas: 500000 }); //reqFollow.params[0]
            profile._hash.call(0, function (err0, firstPart) {
                profile._hash.call(1, function (err1, secondPart) {

                    /*logsConnection.get().web3API
                        .personal
                        .sendTransaction(reqFollow.params[0], (process.env.BOT_PWD) ? process.env.BOT_PWD: '^ItA&TT$QQbj', (err, data) =>{
                            console.log('tx for following ', registered.args.id, err, data);
                        });
                        */
                    if (!err0 && !err1) {
                        (function () {
                            var resource = logsConnection.getIpfs([firstPart, secondPart]);
                            console.log(resource, registered.args.profile);
                            logsConnection.get().ipfsAPI.object.get(resource, function (errFinal, data) {
                                if (!errFinal) {
                                    rows.push([logsConnection.get().web3API.toUtf8(registered.args.id), registered.args.profile, resource, JSON.stringify(data.data), count]);
                                    draw();
                                    count++;
                                } else {
                                    console.log('error ', errFinal, logsConnection.get().web3API.toUtf8(registered.args.id));
                                }
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