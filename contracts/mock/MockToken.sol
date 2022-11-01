// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
        _mint(msg.sender, 1000000000 * (10 ** decimals()));
    }

    function decimals() override public view returns (uint8) {
        return 8;
    }

    function mint(address _to, uint256 _amount) public {
        _mint(_to, _amount);
    }
}
