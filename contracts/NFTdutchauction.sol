// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./NFTdutchauctiontoken.sol";

contract NFTDutchAuction {
    NFTDutchAuctionToken public nftContractToken;
    address payable public seller;
    //address erc721TokenAddress;
    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    uint256 public startBlock;
    uint256 public endBlock;
    uint256 public currentPrice;    
    uint256 nftTokenId;

    bool public auctionEnded;

    //Seller Placed A bid

    constructor(
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement
        //uint256 _nftTokenId
        //address _erc721TokenAddress


    ) {
        seller = payable(msg.sender);
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;
        startBlock = block.number;
        endBlock = startBlock + numBlocksAuctionOpen;
        auctionEnded = false;
        nftTokenId = 0;
        // Mint a token to the address that deployed this contract
        nftContractToken = new NFTDutchAuctionToken();
        nftContractToken.mint(address(this));
        

    }

    //function for bidders to place bid and proccess the bid
    function placeBid() external payable {
            require(!auctionEnded, "Auction has ended");
        currentPrice =
            reservePrice +
            (endBlock - block.number) *
            offerPriceDecrement; //get current price
        if (msg.value >= currentPrice) {
            auctionEnded = true;
            seller.transfer(msg.value); //Transfer bid to seller
            nftContractToken.setApprovalForAll(seller, true );
            nftContractToken.transferFrom(address(this), msg.sender, nftTokenId); //transfer token to bidder
            
        } else {
            payable(msg.sender).transfer(msg.value); //Transfer bid to sender
        }
    }
}
