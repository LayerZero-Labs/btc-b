pragma solidity ^0.8.0;

import "@layerzerolabs/solidity-examples/contracts/token/oft/v2/fee/ProxyOFTWithFee.sol";

contract BTCbProxyOFT is ProxyOFTWithFee {
    constructor(address _token, address _lzEndpoint) ProxyOFTWithFee(_token, 8, _lzEndpoint){}
}