// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title EnhancedCarbonMarketplace
 * @dev Enhanced ERC1155 implementation for carbon credits with Mint/Buy/Retire functionality
 * Includes integration plans for Toucan Protocol (Verra credits on Polygon)
 * Each token ID represents a different carbon credit project
 * Each token = 1 Carbon Credit = 1 ton CO₂ offset
 */
contract EnhancedCarbonMarketplace is ERC1155, Ownable, ReentrancyGuard, Pausable {
    // Counters
    uint256 private _currentTokenId;
    uint256 private _currentListingId;
    uint256 private _totalCreditsRetired;
    
    // Carbon Credit Project Structure
    struct CarbonProject {
        string name;
        string methodology; // VCS, Gold Standard, CDM, Toucan
        uint256 co2Tonnes;
        uint256 pricePerTonne; // in wei
        uint256 expiryDate;
        string location;
        string projectType; // Forest, Renewable Energy, etc.
        address issuer;
        bool isActive;
        string metadataURI;
        string verraId; // For Toucan integration
        bool isToucanVerified;
        uint256 vintage; // Year of credit generation
    }
    
    // Marketplace Listing Structure
    struct Listing {
        uint256 tokenId;
        uint256 amount;
        uint256 pricePerToken; // in wei
        address seller;
        bool isActive;
        uint256 listedAt;
        uint256 expiresAt;
    }
    
    // Retirement Record
    struct RetirementRecord {
        uint256 tokenId;
        uint256 amount;
        address retiredBy;
        uint256 retiredAt;
        string reason; // Retirement reason/purpose
        bool isPermanent;
    }
    
    // Storage
    mapping(uint256 => CarbonProject) public projects;
    mapping(uint256 => Listing) public listings;
    mapping(address => bool) public authorizedIssuers;
    mapping(address => mapping(uint256 => uint256)) public retiredCredits; // user => tokenId => amount
    mapping(uint256 => RetirementRecord[]) public retirementHistory; // tokenId => retirement records
    mapping(address => uint256) public totalRetiredByUser;
    
    // Toucan Protocol Integration (for future implementation)
    mapping(string => uint256) public verraToTokenId; // Verra ID to our token ID
    mapping(uint256 => bool) public toucanBridgedCredits; // Track credits from Toucan
    address public toucanPoolAddress; // Toucan TCO2 pool address (will be set for Polygon)
    
    // Events
    event ProjectCreated(
        uint256 indexed tokenId,
        string name,
        address indexed issuer,
        uint256 co2Tonnes,
        uint256 pricePerTonne,
        string verraId
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
    
    event CreditsMinted(
        uint256 indexed tokenId,
        address indexed to,
        uint256 amount,
        address indexed issuer
    );
    
    event CreditsRetired(
        uint256 indexed tokenId,
        address indexed retiredBy,
        uint256 amount,
        string reason,
        bool isPermanent
    );
    
    event ListingCancelled(uint256 indexed listingId);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    event ToucanIntegrationEnabled(address indexed poolAddress);
    
    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {
        // Initialize with some default projects for testing
    }

    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized issuer");
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
        require(listings[listingId].expiresAt > block.timestamp, "Listing expired");
        _;
    }

    // =======================
    // ISSUER MANAGEMENT
    // =======================
    
    function authorizeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    function revokeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }

    // =======================
    // PROJECT CREATION
    // =======================
    
    function createProject(
        string memory name,
        string memory methodology,
        uint256 co2Tonnes,
        uint256 pricePerTonne,
        uint256 expiryDate,
        string memory location,
        string memory projectType,
        string memory metadataURI,
        string memory verraId,
        uint256 vintage
    ) external onlyAuthorizedIssuer whenNotPaused returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(co2Tonnes > 0, "CO2 tonnes must be > 0");
        require(expiryDate > block.timestamp, "Expiry must be in future");
        require(vintage <= block.timestamp / 365 days + 1970, "Invalid vintage year");
        
        _currentTokenId++;
        uint256 tokenId = _currentTokenId;
        
        bool isToucan = keccak256(bytes(methodology)) == keccak256(bytes("Toucan"));
        
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
            metadataURI: metadataURI,
            verraId: verraId,
            isToucanVerified: isToucan,
            vintage: vintage
        });
        
        // Map Verra ID to token ID for Toucan integration
        if (bytes(verraId).length > 0) {
            verraToTokenId[verraId] = tokenId;
        }
        
        emit ProjectCreated(tokenId, name, msg.sender, co2Tonnes, pricePerTonne, verraId);
        return tokenId;
    }

    // =======================
    // MINT FUNCTIONALITY
    // =======================
    
    function mintCredits(
        uint256 tokenId,
        uint256 amount,
        address to
    ) external onlyAuthorizedIssuer validProject(tokenId) whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        require(to != address(0), "Invalid recipient");
        
        CarbonProject storage project = projects[tokenId];
        require(project.issuer == msg.sender || msg.sender == owner(), "Not project issuer");
        require(block.timestamp < project.expiryDate, "Project expired");
        
        // Mint the tokens
        _mint(to, tokenId, amount, "");
        
        emit CreditsMinted(tokenId, to, amount, msg.sender);
    }
    
    function batchMintCredits(
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        address to
    ) external onlyAuthorizedIssuer whenNotPaused {
        require(tokenIds.length == amounts.length, "Array length mismatch");
        require(to != address(0), "Invalid recipient");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(tokenIds[i] > 0 && tokenIds[i] <= _currentTokenId, "Invalid project");
            require(projects[tokenIds[i]].isActive, "Project not active");
            
            CarbonProject storage project = projects[tokenIds[i]];
            require(project.issuer == msg.sender || msg.sender == owner(), "Not project issuer");
            require(block.timestamp < project.expiryDate, "Project expired");
        }
        
        _mintBatch(to, tokenIds, amounts, "");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            emit CreditsMinted(tokenIds[i], to, amounts[i], msg.sender);
        }
    }

    // =======================
    // MARKETPLACE FUNCTIONS
    // =======================
    
    function listCredits(
        uint256 tokenId,
        uint256 amount,
        uint256 pricePerToken,
        uint256 duration
    ) external validProject(tokenId) whenNotPaused returns (uint256) {
        require(amount > 0, "Amount must be > 0");
        require(pricePerToken > 0, "Price must be > 0");
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");
        require(duration > 0 && duration <= 30 days, "Invalid duration");
        
        _currentListingId++;
        uint256 listingId = _currentListingId;
        
        listings[listingId] = Listing({
            tokenId: tokenId,
            amount: amount,
            pricePerToken: pricePerToken,
            seller: msg.sender,
            isActive: true,
            listedAt: block.timestamp,
            expiresAt: block.timestamp + duration
        });
        
        emit CreditsListed(listingId, tokenId, msg.sender, amount, pricePerToken);
        return listingId;
    }

    function buyCredits(uint256 listingId) external payable validListing(listingId) nonReentrant whenNotPaused {
        Listing storage listing = listings[listingId];
        uint256 totalPrice = listing.amount * listing.pricePerToken;
        
        require(msg.value >= totalPrice, "Insufficient payment");
        require(listing.seller != msg.sender, "Cannot buy own listing");
        
        // Check seller still has the tokens
        require(balanceOf(listing.seller, listing.tokenId) >= listing.amount, "Seller insufficient balance");
        
        // Transfer tokens from seller to buyer
        _safeTransferFrom(listing.seller, msg.sender, listing.tokenId, listing.amount, "");
        
        // Transfer payment to seller (with 2% platform fee)
        uint256 platformFee = totalPrice * 2 / 100;
        uint256 sellerAmount = totalPrice - platformFee;
        
        (bool success, ) = payable(listing.seller).call{value: sellerAmount}("");
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

    // =======================
    // RETIRE FUNCTIONALITY
    // =======================
    
    function retireCredits(
        uint256 tokenId,
        uint256 amount,
        string memory reason,
        bool isPermanent
    ) external validProject(tokenId) whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");
        require(bytes(reason).length > 0, "Retirement reason required");
        
        // Burn the tokens (permanent retirement)
        _burn(msg.sender, tokenId, amount);
        
        // Record retirement
        retiredCredits[msg.sender][tokenId] += amount;
        totalRetiredByUser[msg.sender] += amount;
        _totalCreditsRetired += amount;
        
        // Add to retirement history
        retirementHistory[tokenId].push(RetirementRecord({
            tokenId: tokenId,
            amount: amount,
            retiredBy: msg.sender,
            retiredAt: block.timestamp,
            reason: reason,
            isPermanent: isPermanent
        }));
        
        emit CreditsRetired(tokenId, msg.sender, amount, reason, isPermanent);
    }
    
    function batchRetireCredits(
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        string memory reason,
        bool isPermanent
    ) external whenNotPaused {
        require(tokenIds.length == amounts.length, "Array length mismatch");
        require(bytes(reason).length > 0, "Retirement reason required");
        
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(tokenIds[i] > 0 && tokenIds[i] <= _currentTokenId, "Invalid project");
            require(projects[tokenIds[i]].isActive, "Project not active");
            require(amounts[i] > 0, "Amount must be > 0");
            require(balanceOf(msg.sender, tokenIds[i]) >= amounts[i], "Insufficient balance");
            
            totalAmount += amounts[i];
        }
        
        // Burn all tokens
        _burnBatch(msg.sender, tokenIds, amounts);
        
        // Record retirements
        for (uint256 i = 0; i < tokenIds.length; i++) {
            retiredCredits[msg.sender][tokenIds[i]] += amounts[i];
            
            retirementHistory[tokenIds[i]].push(RetirementRecord({
                tokenId: tokenIds[i],
                amount: amounts[i],
                retiredBy: msg.sender,
                retiredAt: block.timestamp,
                reason: reason,
                isPermanent: isPermanent
            }));
            
            emit CreditsRetired(tokenIds[i], msg.sender, amounts[i], reason, isPermanent);
        }
        
        totalRetiredByUser[msg.sender] += totalAmount;
        _totalCreditsRetired += totalAmount;
    }

    // =======================
    // TOUCAN PROTOCOL INTEGRATION
    // =======================
    
    function setToucanPoolAddress(address poolAddress) external onlyOwner {
        toucanPoolAddress = poolAddress;
        emit ToucanIntegrationEnabled(poolAddress);
    }
    
    function createToucanProject(
        string memory name,
        uint256 co2Tonnes,
        uint256 pricePerTonne,
        string memory location,
        string memory verraId,
        uint256 vintage,
        string memory metadataURI
    ) external onlyAuthorizedIssuer returns (uint256) {
        require(bytes(verraId).length > 0, "Verra ID required for Toucan credits");
        
        _currentTokenId++;
        uint256 tokenId = _currentTokenId;
        
        projects[tokenId] = CarbonProject({
            name: name,
            methodology: "Toucan",
            co2Tonnes: co2Tonnes,
            pricePerTonne: pricePerTonne,
            expiryDate: block.timestamp + 365 days * 10, // 10 year expiry
            location: location,
            projectType: "Verra Registry",
            issuer: msg.sender,
            isActive: true,
            metadataURI: metadataURI,
            verraId: verraId,
            isToucanVerified: true,
            vintage: vintage
        });
        
        // Map Verra ID to token ID for Toucan integration
        verraToTokenId[verraId] = tokenId;
        
        toucanBridgedCredits[tokenId] = true;
        
        emit ProjectCreated(tokenId, name, msg.sender, co2Tonnes, pricePerTonne, verraId);
        return tokenId;
    }

    // =======================
    // VIEW FUNCTIONS
    // =======================
    
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

    function isProjectActive(uint256 tokenId) external view returns (bool) {
        if (tokenId == 0 || tokenId > _currentTokenId) return false;
        return projects[tokenId].isActive && projects[tokenId].expiryDate > block.timestamp;
    }
    
    function isToucanCredit(uint256 tokenId) external view returns (bool) {
        return toucanBridgedCredits[tokenId];
    }

    // =======================
    // ADMIN FUNCTIONS
    // =======================
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }

    function cancelListing(uint256 listingId) external validListing(listingId) {
        require(listings[listingId].seller == msg.sender || msg.sender == owner(), "Not authorized");
        
        listings[listingId].isActive = false;
        emit ListingCancelled(listingId);
    }

    function deactivateProject(uint256 tokenId) external onlyOwner {
        require(tokenId > 0 && tokenId <= _currentTokenId, "Invalid project");
        projects[tokenId].isActive = false;
    }

    function updateProjectMetadata(uint256 tokenId, string memory newMetadataURI) external {
        require(tokenId > 0 && tokenId <= _currentTokenId, "Invalid project");
        require(projects[tokenId].issuer == msg.sender || msg.sender == owner(), "Not authorized");
        
        projects[tokenId].metadataURI = newMetadataURI;
    }

    // Platform fee withdrawal
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // Override URI function to support individual token metadata
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(tokenId > 0 && tokenId <= _currentTokenId, "Invalid token ID");
        
        if (bytes(projects[tokenId].metadataURI).length > 0) {
            return projects[tokenId].metadataURI;
        }
        
        return super.uri(tokenId);
    }

    // Receive function to accept Ether
    receive() external payable {}
}
