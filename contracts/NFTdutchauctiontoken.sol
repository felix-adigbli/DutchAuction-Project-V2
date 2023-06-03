// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract NFTDutchAuctionToken is ERC721PresetMinterPauserAutoId {
    constructor() ERC721PresetMinterPauserAutoId("NFTDutchAuctionToken", "DUT", "https://northeastern.edu/NFTdutchauction") {}

}