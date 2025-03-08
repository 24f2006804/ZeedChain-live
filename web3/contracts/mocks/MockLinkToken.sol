// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockLinkToken is ERC20 {
    constructor() ERC20("Chainlink Token", "LINK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool success) {
        require(transfer(to, value), "LINK transfer failed");
        return true;
    }
}