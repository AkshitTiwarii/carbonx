// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title GreenProof
 * @dev A super simple contract that logs eco-friendly actions for users.
 * Each user's address is linked to the number of actions they’ve done.
 */

// Solidity mapping → https://docs.soliditylang.org/en/latest/types.html#mappings
contract GreenProof {
    // mapping keeps count of actions per user address
    mapping(address => uint) public actionCount;

    // Solidity events → https://docs.soliditylang.org/en/latest/contracts.html#events
    event ActionLogged(address indexed user, string actionType);

    // Functions in Solidity → https://docs.soliditylang.org/en/latest/contracts.html#functions
    function logAction(string memory _type) public {
        // Increment the user's action count by 1
        actionCount[msg.sender]++;
        // Emit an event so it can be seen in transaction logs
        emit ActionLogged(msg.sender, _type);
    }
}