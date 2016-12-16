'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    var _web3API = null;
    var _ipfsAPI = null;

    var _connectWeb3 = function _connectWeb3() {
        var web3 = new _web2.default();
        var socket = new _net2.default.Socket();
        var ipcPath = process.env.GETH_IPC_PATH;
        socket.setTimeout(0);
        socket.setEncoding('utf8');
        web3.setProvider(new _web2.default.providers.IpcProvider(ipcPath, socket));
        _web3API = web3;
    };

    var _connectIpfs = function _connectIpfs() {
        var ipfsApiPath = process.env.IPFS_API_ADDRESS ? process.env.IPFS_API_ADDRESS : '/ip4/127.0.0.1/tcp/5001';
        _ipfsAPI = (0, _ipfsApi2.default)(ipfsApiPath);
    };

    var get = function get() {
        return { web3API: _web3API, ipfsAPI: _ipfsAPI };
    };
    var connect = function connect(service) {
        _connectWeb3();
        _connectIpfs();
    };

    var getIpfs = function getIpfs(ipfsHashChunks) {
        return _web3API.toUtf8(ipfsHashChunks[0]) + _web3API.toUtf8(ipfsHashChunks[1]);
    };
    return { get: get, connect: connect, getIpfs: getIpfs };
};

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _ipfsApi = require('ipfs-api');

var _ipfsApi2 = _interopRequireDefault(_ipfsApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=connection.service.js.map