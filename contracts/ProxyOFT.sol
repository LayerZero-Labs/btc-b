import "@layerzerolabs/solidity-examples/contracts/token/oft/v2/ProxyOFTV2.sol";

contract ProxyOFT is ProxyOFTV2 {
    constructor(address _token, address _lzEndpoint) ProxyOFTV2(_token, 8, _lzEndpoint){}
}