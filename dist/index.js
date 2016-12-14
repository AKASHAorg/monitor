'use strict';

var _connection = require('./connection.service');

var _connection2 = _interopRequireDefault(_connection);

var _contracts = require('@akashaproject/contracts.js');

var _contracts2 = _interopRequireDefault(_contracts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Table = require('tty-table/automattic-cli-table');

var logsConnection = (0, _connection2.default)();
/* col widths */
var userTable = new Table({
    head: ['ID', 'Contract', 'Hash', 'Data', 'Error', 'Total Watched']
});

var tail = function tail() {
    var count = 1;
    logsConnection.connect('tail');
    var run = function run() {
        var factory = new _contracts2.default.Class(logsConnection.get().web3API);
        var watcher = factory.objects.registry.Register({}, {});
        watcher.watch(function (err, registered) {
            var profile = factory.classes.Profile.at(registered.args.profile);
            console.log(userTable.toString());
            profile._hash.call(0, function (err0, firstPart) {
                profile._hash.call(1, function (err1, secondPart) {
                    if (!err0 && !err1) {
                        (function () {
                            var resource = logsConnection.getIpfs([firstPart, secondPart]);
                            logsConnection.get().ipfsAPI.object.get(resource, function (errFinal, data) {
                                userTable.push([registered.args.id, registered.args.profile, resource, JSON.stringify(data), errFinal, count]);
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
//# sourceMappingURL=index.js.map