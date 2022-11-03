pragma solidity ^0.8.0;

import "@layerzerolabs/solidity-examples/contracts/mocks/MockToken.sol";

contract Token is MockToken {
    constructor(string memory _name, string memory _symbol) MockToken(_name, _symbol) {}

    function decimals() public pure override returns (uint8){
        return 8;
    }
}