//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzepplin/contracts/token/ERC20/ERC20.sol";
contract ERC20Token is ERC20 {
    constructor() ERC20("@gauranshigupta", "GG") {
        _mint(msg.sender, 5000 ** 18);
    }
}
