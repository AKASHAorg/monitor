import connection from './connection.service';
import contracts from '@akashaproject/contracts.js';
const Table = require('tty-table/automattic-cli-table');

const logsConnection = connection();
/* col widths */
const userTable = new Table({
    head: ['ID', 'Contract', 'Hash', 'Data', 'Error', 'Total Watched']
});

const tail = () => {
    let count = 1;
    logsConnection.connect('tail');
    const run = () => {
        const factory = new contracts.Class(logsConnection.get().web3API);
        const watcher = factory.objects.registry.Register({}, {});
        watcher.watch((err, registered) => {
            let profile = factory.classes.Profile.at(registered.args.profile);
            console.log(userTable.toString());
            profile._hash.call(0, (err0, firstPart) => {
                profile._hash.call(1, (err1, secondPart) => {
                    if (!err0 && !err1) {
                        const resource = logsConnection.getIpfs([firstPart, secondPart]);
                        logsConnection.get().ipfsAPI.object.get(resource, (errFinal, data) => {
                            userTable.push([
                                registered.args.id,
                                registered.args.profile,
                                resource,
                                JSON.stringify(data),
                                errFinal,
                                count
                            ])
                        });
                    }
                })
            });
        });
    };
    setTimeout(run, 2000);
};

tail();



