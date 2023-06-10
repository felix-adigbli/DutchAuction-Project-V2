// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./NFTdutchauctiontoken.sol";
/**interface IERC721Token {
    function safeMint(address to, uint256 nftTokenId) external;
    function ownerOf(uint256 nftTokenId) external view  returns (uint256);
    function approve(address to, uint256 nftTokenId) external;
    function safeTransferFrom(address from, address to, uint256 nftTokenId) external;

    }*/

contract NFTDutchAuction {
    NFTDutchAuctionToken public nftContractToken;
    address payable public seller;
    address public ownerOfToken;
    address public erc721TokenAddress;
    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    uint256 public startBlock;
    uint256 public endBlock;
    uint256 public currentPrice;    
    uint256 public nftTokenId;


    bool public auctionEnded;

    //Seller Placed A bid

    constructor(
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement,
        uint256 _nftTokenId,
        address _erc721TokenAddress


    ) {
        seller = payable(msg.sender);
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;
        nftTokenId = _nftTokenId;
        erc721TokenAddress = _erc721TokenAddress;
        startBlock = block.number;
        endBlock = startBlock + numBlocksAuctionOpen;
        ownerOfToken = IERC721(_erc721TokenAddress).ownerOf(_nftTokenId);
        
        auctionEnded = false;     
        //check if the the deployer is the owner of the token.
     require(seller == ownerOfToken, "Sender is not the owner of token" );       


    }

    function placeBid() external payable {
            require(!auctionEnded, "Auction has ended");
        currentPrice = currentPrice = reservePrice + (endBlock - block.number) *  offerPriceDecrement; //get current price
        if (msg.value >= currentPrice) {
            auctionEnded = true;
            seller.transfer(msg.value); //Transfer bid to seller
           IERC721(erc721TokenAddress).safeTransferFrom(seller, msg.sender, nftTokenId);
            
        } else {
            payable(msg.sender).transfer(msg.value); //Transfer bid to sender
        }
    }
}
