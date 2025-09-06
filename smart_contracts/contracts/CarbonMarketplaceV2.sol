// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CarbonMarketplaceV2
 * @dev Enhanced ERC1155 implementation for carbon credits with Mint/Buy/Retire functionality
 * Includes Toucan Protocol integration planning
 */
contract CarbonMarketplaceV2 is ERC1155, Ownable, ReentrancyGuard {
    uint256 private _currentTokenId;
    uint256 private _currentListingId;
    uint256 private _totalCreditsRetired;
    
    struct CarbonProject {
        string name;
        string methodology; // VCS, Gold Standard, Toucan
        uint256 co2Tonnes;
        uint256 pricePerTonne;
        uint256 expiryDate;
        string location;
        string projectType;
        address issuer;
        bool isActive;
        string verraId;
        bool isToucanVerified;
    }
    
    struct Listing {
        uint256 tokenId;
        uint256 amount;
        uint256 pricePerToken;
        address seller;
        bool isActive;
        uint256 expiresAt;
    }
    
    struct RetirementRecord {
        uint256 tokenId;
        uint256 amount;
        address retiredBy;
        uint256 retiredAt;
        string reason;
    }
    
    mapping(uint256 => CarbonProject) public projects;
    mapping(uint256 => Listing) public listings;
    mapping(address => bool) public authorizedIssuers;
    mapping(address => mapping(uint256 => uint256)) public retiredCredits;
    mapping(uint256 => RetirementRecord[]) public retirementHistory;
    mapping(address => uint256) public totalRetiredByUser;
    mapping(string => uint256) public verraToTokenId;
    
    event ProjectCreated(uint256 indexed tokenId, string name, address indexed issuer, uint256 co2Tonnes, string verraId);
    event CreditsListed(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, uint256 amount, uint256 pricePerToken);
    event CreditsPurchased(uint256 indexed listingId, uint256 indexed tokenId, address indexed buyer, uint256 amount, uint256 totalPrice);
    event CreditsMinted(uint256 indexed tokenId, address indexed to, uint256 amount, address indexed issuer);
    event CreditsRetired(uint256 indexed tokenId, address indexed retiredBy, uint256 amount, string reason);
    event IssuerAuthorized(address indexed issuer);

    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {}

    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized issuer");
        _;
    }

    modifier validProject(uint256 tokenId) {
        require(tokenId > 0 && tokenId <= _currentTokenId, "Invalid project");
        require(projects[tokenId].isActive, "Project not active");
        _;
    }

    // ISSUER MANAGEMENT
    function authorizeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    // PROJECT CREATION
    function createProject(
        string memory name,
        string memory methodology,
        uint256 co2Tonnes,
        uint256 pricePerTonne,
        string memory location,
        string memory projectType,
        string memory verraId,
        bool isToucanVerified
    ) external onlyAuthorizedIssuer returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(co2Tonnes > 0, "CO2 tonnes must be > 0");
        
        _currentTokenId++;
        uint256 tokenId = _currentTokenId;
        
        projects[tokenId] = CarbonProject({
            name: name,
            methodology: methodology,
            co2Tonnes: co2Tonnes,
            pricePerTonne: pricePerTonne,
            expiryDate: block.timestamp + 365 days * 10,
            location: location,
            projectType: projectType,
            issuer: msg.sender,
            isActive: true,
            verraId: verraId,
            isToucanVerified: isToucanVerified
        });
        
        if (bytes(verraId).length > 0) {
            verraToTokenId[verraId] = tokenId;
        }
        
        emit ProjectCreated(tokenId, name, msg.sender, co2Tonnes, verraId);
        return tokenId;
    }

    // MINT FUNCTIONALITY
    function mintCredits(
        uint256 tokenId,
        uint256 amount,
        address to
    ) external onlyAuthorizedIssuer validProject(tokenId) {
        require(amount > 0, "Amount must be > 0");
        require(to != address(0), "Invalid recipient");
        
        CarbonProject storage project = projects[tokenId];
        require(project.issuer == msg.sender || msg.sender == owner(), "Not project issuer");
        
        _mint(to, tokenId, amount, "");
        emit CreditsMinted(tokenId, to, amount, msg.sender);
    }

    // MARKETPLACE FUNCTIONS
    function listCredits(
        uint256 tokenId,
        uint256 amount,
        uint256 pricePerToken,
        uint256 duration
    ) external validProject(tokenId) returns (uint256) {
        require(amount > 0, "Amount must be > 0");
        require(pricePerToken > 0, "Price must be > 0");
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");
        
        _currentListingId++;
        uint256 listingId = _currentListingId;
        
        listings[listingId] = Listing({
            tokenId: tokenId,
            amount: amount,
            pricePerToken: pricePerToken,
            seller: msg.sender,
            isActive: true,
            expiresAt: block.timestamp + duration
        });
        
        emit CreditsListed(listingId, tokenId, msg.sender, amount, pricePerToken);
        return listingId;
    }

    function buyCredits(uint256 listingId) external payable nonReentrant {
        require(listingId > 0 && listingId <= _currentListingId, "Invalid listing");
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.expiresAt > block.timestamp, "Listing expired");
        
        uint256 totalPrice = listing.amount * listing.pricePerToken;
        require(msg.value >= totalPrice, "Insufficient payment");
        require(listing.seller != msg.sender, "Cannot buy own listing");
        require(balanceOf(listing.seller, listing.tokenId) >= listing.amount, "Seller insufficient balance");
        
        _safeTransferFrom(listing.seller, msg.sender, listing.tokenId, listing.amount, "");
        
        uint256 platformFee = totalPrice * 2 / 100;
        uint256 sellerAmount = totalPrice - platformFee;
        
        (bool success, ) = payable(listing.seller).call{value: sellerAmount}("");
        require(success, "Payment transfer failed");
        
        if (msg.value > totalPrice) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalPrice}("");
            require(refundSuccess, "Refund failed");
        }
        
        listing.isActive = false;
        emit CreditsPurchased(listingId, listing.tokenId, msg.sender, listing.amount, totalPrice);
    }

    // RETIRE FUNCTIONALITY
    function retireCredits(
        uint256 tokenId,
        uint256 amount,
        string memory reason
    ) external validProject(tokenId) {
        require(amount > 0, "Amount must be > 0");
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");
        require(bytes(reason).length > 0, "Retirement reason required");
        
        _burn(msg.sender, tokenId, amount);
        
        retiredCredits[msg.sender][tokenId] += amount;
        totalRetiredByUser[msg.sender] += amount;
        _totalCreditsRetired += amount;
        
        retirementHistory[tokenId].push(RetirementRecord({
            tokenId: tokenId,
            amount: amount,
            retiredBy: msg.sender,
            retiredAt: block.timestamp,
            reason: reason
        }));
        
        emit CreditsRetired(tokenId, msg.sender, amount, reason);
    }

    // VIEW FUNCTIONS
    function getProject(uint256 tokenId) external view returns (CarbonProject memory) {
        require(tokenId > 0 && tokenId <= _currentTokenId, "Invalid project");
        return projects[tokenId];
    }

    function getActiveListing(uint256 listingId) external view returns (Listing memory) {
        require(listingId > 0 && listingId <= _currentListingId, "Invalid listing");
        require(listings[listingId].isActive, "Listing not active");
        return listings[listingId];
    }
    
    function getRetirementHistory(uint256 tokenId) external view returns (RetirementRecord[] memory) {
        return retirementHistory[tokenId];
    }
    
    function getUserRetiredCredits(address user, uint256 tokenId) external view returns (uint256) {
        return retiredCredits[user][tokenId];
    }
    
    function getTotalRetiredByUser(address user) external view returns (uint256) {
        return totalRetiredByUser[user];
    }
    
    function getTotalCreditsRetired() external view returns (uint256) {
        return _totalCreditsRetired;
    }

    function getCurrentTokenId() external view returns (uint256) {
        return _currentTokenId;
    }

    function getCurrentListingId() external view returns (uint256) {
        return _currentListingId;
    }

    function isToucanCredit(uint256 tokenId) external view returns (bool) {
        if (tokenId == 0 || tokenId > _currentTokenId) return false;
        return projects[tokenId].isToucanVerified;
    }

    // ADMIN FUNCTIONS
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    receive() external payable {}
}
