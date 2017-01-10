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
        logsConnection.get().web3API.eth.defaultAccount = process.env.BOT_ADDR;

        watcher.watch((err, registered) => {
            currentBlock = registered.blockNumber;
            let profile = factory.classes.Profile.at(registered.args.profile);
            const reqFollow = factory.objects.feed.follow.request(registered.args.id, {gas: 500000}); //reqFollow.params[0]
            profile._hash.call(0, (err0, firstPart) => {
                profile._hash.call(1, (err1, secondPart) => {
                    logsConnection.get().web3API
                        .personal
                        .sendTransaction(reqFollow.params[0], process.env.BOT_PWD, (err, data) =>{
                            console.log('tx for following ', registered.args.id, err, data);
                        });
                    if (!err0 && !err1) {
                        const resource = logsConnection.getIpfs([firstPart, secondPart]);
                        console.log(resource, registered.args.profile);
                        logsConnection.get().ipfsAPI.object.get(resource, (errFinal, data) => {
                            if(!errFinal){
                                rows.push([
                                    logsConnection.get().web3API.toUtf8(registered.args.id),
                                    registered.args.profile,
                                    resource,
                                    JSON.stringify(data.data),
                                    count
                                ]);
                                draw();
                                count++;
                            }else{
                                console.log('error ', errFinal, logsConnection.get().web3API.toUtf8(registered.args.id));
                            }

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


