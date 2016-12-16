import Web3 from 'web3';
import net from 'net';
import ipfsAPI from 'ipfs-api';


export default function () {
    let _web3API = null;
    let _ipfsAPI = null;

    const _connectWeb3 = () => {
        const web3 = new Web3();
        const socket = new net.Socket();
        const ipcPath = process.env.GETH_IPC_PATH;
        socket.setTimeout(0);
        socket.setEncoding('utf8');
        web3.setProvider(new Web3.providers.IpcProvider(ipcPath, socket));
        _web3API = web3;
    };

    const _connectIpfs = () => {
        const ipfsApiPath = (process.env.IPFS_API_ADDRESS) ? process.env.IPFS_API_ADDRESS : '/ip4/127.0.0.1/tcp/5001';
        _ipfsAPI = ipfsAPI(ipfsApiPath);
    };

    const get = () => {
        return { web3API: _web3API, ipfsAPI: _ipfsAPI }
    };
    const connect = (service) => {
        _connectWeb3();
        _connectIpfs();
    };

    const getIpfs = (ipfsHashChunks) => {
        return _web3API.toUtf8(ipfsHashChunks[0]) +
            _web3API.toUtf8(ipfsHashChunks[1]);
    };
    return { get, connect, getIpfs };
}