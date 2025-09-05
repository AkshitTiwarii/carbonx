// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CarbonCreditToken
 * @dev ERC1155 implementation for carbon credits with metadata and marketplace
 * Each token ID represents a different carbon credit project
 * Each token = 1 Carbon Credit = 1 ton CO₂ offset
 */
contract CarbonCreditToken is ERC1155, Ownable, ReentrancyGuard {
    // Simple counters instead of Counters library (removed in OpenZeppelin v5)
    uint256 private _currentTokenId;
    uint256 private _currentListingId;
    
    // Carbon Credit Project Structure
    struct CarbonProject {
        string name;
        string methodology; // VCS, Gold Standard, CDM, etc.
        uint256 co2Tonnes;
        uint256 pricePerTonne; // in wei
        uint256 expiryDate;
        string location;
        string projectType; // Forest, Renewable Energy, etc.
        address issuer;
        bool isActive;
        string metadataURI;
    }
    
    // Marketplace Listing Structure
    struct Listing {
        uint256 tokenId;
        uint256 amount;
        uint256 pricePerToken; // in wei
        address seller;
        bool isActive;
        uint256 listedAt;
    }
    
    // Storage
    mapping(uint256 => CarbonProject) public projects;
    mapping(uint256 => Listing) public listings;
    mapping(address => bool) public authorizedIssuers;
    
    // Events
    event ProjectCreated(
        uint256 indexed tokenId,
        string name,
        address indexed issuer,
        uint256 co2Tonnes,
        uint256 pricePerTonne
    );
    
    event CreditsListed(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 amount,
        uint256 pricePerToken
    );
    
    event CreditsPurchased(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 amount,
        uint256 totalPrice
    );
    
    event ListingCancelled(uint256 indexed listingId);
    
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);

    // Constructor
    constructor() ERC1155("https://api.carbonx.com/metadata/{id}.json") Ownable(msg.sender) {
        // Initialize counters
        _currentTokenId = 0;
        _currentListingId = 0;
        
        // Authorize contract owner as issuer
        authorizedIssuers[msg.sender] = true;
        emit IssuerAuthorized(msg.sender);
    }

    // Modifiers
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not authorized issuer");
        _;
    }

    modifier validProject(uint256 tokenId) {
        require(tokenId > 0 && tokenId <= _currentTokenId, "Invalid project");
        require(projects[tokenId].isActive, "Project not active");
        _;
    }

    modifier validListing(uint256 listingId) {
        require(listingId > 0 && listingId <= _currentListingId, "Invalid listing");
        require(listings[listingId].isActive, "Listing not active");
        _;
    }

    // Issuer Management
    function authorizeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    function revokeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }

    // Project Creation
    function createProject(
        string memory name,
        string memory methodology,
        uint256 co2Tonnes,
        uint256 pricePerTonne,
        uint256 expiryDate,
        string memory location,
        string memory projectType,
        string memory metadataURI
    ) external onlyAuthorizedIssuer returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(co2Tonnes > 0, "CO2 tonnes must be > 0");
        require(expiryDate > block.timestamp, "Expiry must be in future");
        
        _currentTokenId++;
        uint256 tokenId = _currentTokenId;
        
        projects[tokenId] = CarbonProject({
            name: name,
            methodology: methodology,
            co2Tonnes: co2Tonnes,
            pricePerTonne: pricePerTonne,
            expiryDate: expiryDate,
            location: location,
            projectType: projectType,
            issuer: msg.sender,
            isActive: true,
            metadataURI: metadataURI
        });
        
        emit ProjectCreated(tokenId, name, msg.sender, co2Tonnes, pricePerTonne);
        return tokenId;
    }

    // Mint Carbon Credits
    function mintCredits(
        uint256 tokenId,
        uint256 amount
    ) external onlyAuthorizedIssuer validProject(tokenId) {
        require(amount > 0, "Amount must be > 0");
        require(projects[tokenId].issuer == msg.sender, "Not project issuer");
        
        _mint(msg.sender, tokenId, amount, "");
    }

    // Batch mint for multiple recipients
    function batchMintCredits(
        uint256 tokenId,
        address[] memory recipients,
        uint256[] memory amounts
    ) external onlyAuthorizedIssuer validProject(tokenId) {
        require(recipients.length == amounts.length, "Array length mismatch");
        require(projects[tokenId].issuer == msg.sender, "Not project issuer");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(amounts[i] > 0, "Amount must be > 0");
            _mint(recipients[i], tokenId, amounts[i], "");
        }
    }

    // Marketplace Functions
    function listCredits(
        uint256 tokenId,
        uint256 amount,
        uint256 pricePerToken
    ) external validProject(tokenId) returns (uint256) {
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be > 0");
        require(pricePerToken > 0, "Price must be > 0");
        
        _currentListingId++;
        uint256 listingId = _currentListingId;
        
        listings[listingId] = Listing({
            tokenId: tokenId,
            amount: amount,
            pricePerToken: pricePerToken,
            seller: msg.sender,
            isActive: true,
            listedAt: block.timestamp
        });
        
        emit CreditsListed(listingId, tokenId, msg.sender, amount, pricePerToken);
        return listingId;
    }

    function buyCredits(uint256 listingId) external payable validListing(listingId) nonReentrant {
        Listing storage listing = listings[listingId];
        uint256 totalPrice = listing.amount * listing.pricePerToken;
        
        require(msg.value >= totalPrice, "Insufficient payment");
        require(listing.seller != msg.sender, "Cannot buy own listing");
        
        // Check seller still has the tokens
        require(balanceOf(listing.seller, listing.tokenId) >= listing.amount, "Seller insufficient balance");
        
        // Transfer tokens from seller to buyer
        _safeTransferFrom(listing.seller, msg.sender, listing.tokenId, listing.amount, "");
        
        // Transfer payment to seller
        (bool success, ) = payable(listing.seller).call{value: totalPrice}("");
        require(success, "Payment transfer failed");
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalPrice}("");
            require(refundSuccess, "Refund failed");
        }
        
        // Mark listing as inactive
        listing.isActive = false;
        
        emit CreditsPurchased(listingId, listing.tokenId, msg.sender, listing.amount, totalPrice);
    }

    function cancelListing(uint256 listingId) external validListing(listingId) {
        require(listings[listingId].seller == msg.sender, "Not listing owner");
        
        listings[listingId].isActive = false;
        emit ListingCancelled(listingId);
    }

    // View Functions
    function getProject(uint256 tokenId) external view returns (CarbonProject memory) {
        require(tokenId > 0 && tokenId <= _currentTokenId, "Invalid project");
        return projects[tokenId];
    }

    function getActiveListing(uint256 listingId) external view returns (Listing memory) {
        require(listingId > 0 && listingId <= _currentListingId, "Invalid listing");
        require(listings[listingId].isActive, "Listing not active");
        return listings[listingId];
    }

    function getCurrentTokenId() external view returns (uint256) {
        return _currentTokenId;
    }

    function getCurrentListingId() external view returns (uint256) {
        return _currentListingId;
    }

    function isProjectActive(uint256 tokenId) external view returns (bool) {
        if (tokenId == 0 || tokenId > _currentTokenId) return false;
        return projects[tokenId].isActive && projects[tokenId].expiryDate > block.timestamp;
    }

    // Override URI function to support individual token metadata
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(tokenId > 0 && tokenId <= _currentTokenId, "Invalid token ID");
        
        if (bytes(projects[tokenId].metadataURI).length > 0) {
            return projects[tokenId].metadataURI;
        }
        
        return super.uri(tokenId);
    }

    // Admin Functions
    function deactivateProject(uint256 tokenId) external onlyOwner {
        require(tokenId > 0 && tokenId <= _currentTokenId, "Invalid project");
        projects[tokenId].isActive = false;
    }

    function updateProjectMetadata(uint256 tokenId, string memory newMetadataURI) external {
        require(tokenId > 0 && tokenId <= _currentTokenId, "Invalid project");
        require(projects[tokenId].issuer == msg.sender || msg.sender == owner(), "Not authorized");
        
        projects[tokenId].metadataURI = newMetadataURI;
    }

    // Emergency withdrawal for contract owner
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // Receive function to accept Ether
    receive() external payable {}
}
