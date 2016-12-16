import connection from './connection.service';
import contracts from '@akashaproject/contracts.js';
import { writeFileSync } from 'fs';
import { headerProfile } from './header';
import debounce from 'lodash.debounce';
const settings = require('./settings.json');
const Table = require('tty-table');

const logsConnection = connection();
const lastRecord = settings[settings.length - 1];
let count = lastRecord.count;
let currentBlock = lastRecord.fromBlock;
const tail = () => {
    let rows = [];
    logsConnection.connect('tail');
    const draw = debounce(() => {
        const t2 = Table(headerProfile,rows,{
            borderStyle : 1,
            paddingBottom : 0,
            headerAlign : "center",
            align : "center"
        });

        const str2 = t2.render();
        console.log(str2);
        rows = [];
    }, 8000);
    const run = () => {
        const factory = new contracts.Class(logsConnection.get().web3API);
        const watcher = factory.objects.registry.Register({}, {fromBlock: lastRecord.fromBlock, toBlock: 'latest'});
        watcher.watch((err, registered) => {
            currentBlock = registered.blockNumber;
            let profile = factory.classes.Profile.at(registered.args.profile);
            profile._hash.call(0, (err0, firstPart) => {
                profile._hash.call(1, (err1, secondPart) => {
                    if (!err0 && !err1) {
                        const resource = logsConnection.getIpfs([firstPart, secondPart]);
                        logsConnection.get().ipfsAPI.object.get(resource, (errFinal, data) => {
                            rows.push([
                                logsConnection.get().web3API.toUtf8(registered.args.id),
                                registered.args.profile,
                                resource,
                                JSON.stringify(data.data),
                                count
                            ]);
                            draw();
                            count++;
                        });
                    }
                })
            });
        });
    };
    setTimeout(run, 2000);
};

tail();
const writeToSettings = (code) => {
    settings.push({fromBlock: currentBlock, count: count});
    const newData = JSON.stringify(settings);
    writeFileSync(__dirname + '/settings.json', newData);
    process.exit();
};

process.on('SIGTERM', writeToSettings);
process.on('SIGINT', writeToSettings);


