import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Signature, Signer } from 'ethers';
import { MockProvider } from 'ethereum-waffle';

describe('DutchAuction', () => {
    let NFTdutchAuction;
    let nFTDutchAuctionToken;
    let reservePrice = 100 // ethers.BigNumber.from(100);
    let numBlocksAuctionOpen = 10 //ethers.BigNumber.from(10);
    let offerPriceDecrement = 5 //ethers.BigNumber.from(5);
    let nftTokenId = 0
    let erc721TokenAddress;
    let seller: Signer;
    let provider: MockProvider;
    let bidder1;
    let bidder2;
    let bidder3;
    let gasPrice;
    let gasLimit;
    let tokenOwner;

    let accounts;
    let deployer;
    let minter;






    beforeEach(async () => {
        let NFTDutchAuction = await ethers.getContractFactory('NFTDutchAuction', seller);
        const NFTDutchAuctionToken = await ethers.getContractFactory('NFTDutchAuctionToken', seller);
        [seller, bidder1, bidder2, bidder3] = await ethers.getSigners();
        const sellerAddress = await seller.getAddress()
        accounts = await ethers.getSigners();
        // Assign deployer and minter
        deployer = accounts[0];
        minter = accounts[1];
        //deploy ERC721Toke contract
        nFTDutchAuctionToken = await NFTDutchAuctionToken.deploy();
        await nFTDutchAuctionToken.deployed();

        //mint a token to the seller
        await nFTDutchAuctionToken.connect(deployer).safeMint(deployer.address, nftTokenId);
        console.log("owner of token 0 :", await nFTDutchAuctionToken.ownerOf(nftTokenId));
        //Assign Token contract to variable
        erc721TokenAddress = nFTDutchAuctionToken.address;

        console.log("deployed ERC721 Token contract adress: ", erc721TokenAddress);
        console.log("seller address: ", sellerAddress);
        console.log("deployer address: ", deployer.address);

        //deploy dutch auction with the parameters
        NFTdutchAuction = await NFTDutchAuction.deploy(
            reservePrice,
            numBlocksAuctionOpen,
            offerPriceDecrement,
            nftTokenId,
            erc721TokenAddress
        );

        await NFTdutchAuction.deployed();
        console.log("NFTDutchAuction contract adress: ", NFTdutchAuction.address);
        console.log("NFTduction Seller: ", await NFTdutchAuction.seller());

        //approve for ductch auction contract to be able to transfer token to bidwinner
        await nFTDutchAuctionToken.approve(NFTdutchAuction.address, nftTokenId);





        // Set an appropriate gas price and limit for accurate balance calculations
        gasPrice = await seller.provider.getGasPrice();
        gasLimit = await NFTdutchAuction.estimateGas.placeBid({ value: 0 });
        //tokenOwner = await nFTDutchAuctionToken.ownerOf();
        console.log("gas price:", gasPrice);
        console.log("gas limit: ", gasLimit);
        // console.log(tokenOwner)

    });

    describe('constructor', () => {
        it('should initialize contract variables correctly', async () => {
            expect(await NFTdutchAuction.seller()).to.equal(seller.address);
            expect(await NFTdutchAuction.reservePrice()).to.equal(reservePrice);
            expect(await NFTdutchAuction.numBlocksAuctionOpen()).to.equal(
                numBlocksAuctionOpen
            );
            expect(await NFTdutchAuction.offerPriceDecrement()).to.equal(
                offerPriceDecrement
            );
            const startBlock = await NFTdutchAuction.startBlock();
            expect(await NFTdutchAuction.startBlock()).to.equal(startBlock);
            expect(await NFTdutchAuction.endBlock()).to.equal(startBlock.add(numBlocksAuctionOpen));
            expect(await NFTdutchAuction.auctionEnded()).to.equal(false);
        });
    });


    describe('placeBid', () => {
        it('should reject bid if bid amout is less than the current price and balance trasfered back to bidder', async () => {
            const startBlock = await NFTdutchAuction.startBlock();
            const endBlock = startBlock + numBlocksAuctionOpen;
            const currentBock = await ethers.provider.getBlockNumber();
            const currentPrice = reservePrice + (endBlock - currentBock) * offerPriceDecrement;

            const bidAmount = reservePrice - 1;
            const sellerBalanceBefore = await seller.getBalance();
            const bidder1BalanceBefore = await bidder1.getBalance();

            const bidplaced = await NFTdutchAuction.connect(bidder1).placeBid({ value: bidAmount });
            const receipt = await bidplaced.wait();
            const gassused = receipt.gasUsed;//.mul(gasPrice);

            const sellerBalanceAfter = await seller.getBalance();
            const bidder1BalanceAfter = await bidder1.getBalance();

            console.log("bidder1 balance before: ", bidder1BalanceBefore);
            console.log("bidder1 balance after: ", bidder1BalanceAfter);
            console.log("gass used: ", gassused);
            console.log("seller balance after: ", sellerBalanceAfter);
            console.log("seller balance before: ", sellerBalanceBefore);

            expect(await NFTdutchAuction.auctionEnded()).to.equal(false);
            // Verify the auction balance transfers for uncessful bid
            expect(sellerBalanceAfter.sub(sellerBalanceBefore)).to.equal(0);
            expect(bidder1BalanceBefore.sub(bidder1BalanceAfter)).to.equal(gassused);

        })
    });

    describe('placeBid', () => {
        it('should allow a bid if the auction is still open and bid value is greater than or equal to the current price, and reject any bid after', async () => {
            const startBlock = await NFTdutchAuction.startBlock();
            const endBlock = startBlock + numBlocksAuctionOpen;
            const currentBock = await ethers.provider.getBlockNumber();
            const currentPrice = reservePrice + (endBlock - currentBock) * offerPriceDecrement;
            //const currentPrice1 = await dutchAuction.reservePrice() + ((await dutchAuction.endBlock()) - (await ethers.provider.getBlockNumber()))*(await dutchAuction.offerPriceDecrement())

            const bidAmount = currentPrice + 1;
            const sellerBalanceBefore = await seller.getBalance();
            const bidder2BalanceBefore = await bidder2.getBalance();

            //const tokenOwnerBeforeBid = await nFTDutchAuctionToken.ownerOf(0)
            const bidplaced = await NFTdutchAuction.connect(bidder2).placeBid({ value: bidAmount });
            const receipt = await bidplaced.wait();
            //const tokenOwnerafterBid = await nFTDutchAuctionToken.ownerOf(0)
            const gassused = receipt.gasUsed;//.mul(gasPrice);

            const sellerBalanceAfter = await seller.getBalance();
            const bidder2BalanceAfter = await bidder2.getBalance();
            console.log("bidder2 balance before:", bidder2BalanceBefore);
            console.log("bidder2 balance after:", bidder2BalanceAfter);
            console.log("gass used :", gassused);
            console.log("bid ammount:", bidAmount);
            console.log("remaining balance :", bidder2BalanceBefore.sub(bidder2BalanceAfter));
            console.log("the current block:", currentBock);
            console.log("seller balance after: ", sellerBalanceAfter);
            console.log("seller balance before: ", sellerBalanceBefore);
            //console.log("Token owner before bid: ", tokenOwnerBeforeBid);
            //console.log("Token owner after bid: ", tokenOwnerafterBid);



            expect(await NFTdutchAuction.auctionEnded()).to.equal(true);


            // Verify the auction balance transfers for successful bid
            expect(sellerBalanceAfter.sub(sellerBalanceBefore)).to.equal(bidAmount);


            expect(bidder2BalanceBefore.sub(bidder2BalanceAfter)).to.equal(gassused.add(bidAmount));
            // Try placing another bid after the auction has ended
            await expect(NFTdutchAuction.connect(bidder3).placeBid({ value: 100 })).to.be.revertedWith('Auction has ended');
        });

    });

    describe('placeBid', () => {
        it('Attempt to call the safeMint function as a non-owner and expect it to revert', async () => {


            // Attempt to call the safeMint function as a non-owner and expect it to revert
            await expect(
                nFTDutchAuctionToken.connect(minter).safeMint(deployer.address, 10)
            ).to.be.revertedWith("Ownable: caller is not the owner");

        });

    });

    describe('placeBid', () => {
        it('Owner of contract and owner of the token are different', async () => {


            let NFTDutchAuction = await ethers.getContractFactory('NFTDutchAuction', seller);
            let NFTdutchAuction;
            let nFTDutchAuctionToken;
            let reservePrice = 100 // ethers.BigNumber.from(100);
            let numBlocksAuctionOpen = 10 //ethers.BigNumber.from(10);
            let offerPriceDecrement = 5 //ethers.BigNumber.from(5);
            let nftTokenId = 0
            let erc721TokenAddress;

            //deploy ERC721Toke contract
            const NFTDutchAuctionToken = await ethers.getContractFactory('NFTDutchAuctionToken', seller);
            nFTDutchAuctionToken = await NFTDutchAuctionToken.deploy();
            await nFTDutchAuctionToken.deployed();

            //mint a token to the seller
            await nFTDutchAuctionToken.connect(deployer).safeMint(minter.address, nftTokenId);
            console.log("owner of token 0 :", await nFTDutchAuctionToken.ownerOf(nftTokenId));
            //Assign Token contract to variable
            erc721TokenAddress = nFTDutchAuctionToken.address;

            NFTdutchAuction = await NFTDutchAuction.deploy(
                reservePrice,
                numBlocksAuctionOpen,
                offerPriceDecrement,
                nftTokenId,
                erc721TokenAddress
            );

            expect((await NFTdutchAuction.deployed()).to.be.revertedWith('Sender is not the owner of token'));

        })
    })
});
