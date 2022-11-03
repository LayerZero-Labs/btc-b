pragma solidity ^0.8.0;

import "@layerzerolabs/solidity-examples/contracts/token/oft/v2/OFTV2.sol";

contract OFT is OFTV2 {
    constructor(string memory _name, string memory _symbol, address _lzEndpoint) OFTV2(_name, _symbol, 8, _lzEndpoint){}

    function decimals() public pure override returns (uint8){
        return 8;
    }
}