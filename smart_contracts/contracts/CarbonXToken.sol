// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CarbonXToken (CXB)
 * @dev ERC20 implementation for fungible carbon credits
 * 1 CXB = 1 ton CO₂ offset
 * This token is designed for DeFi integration and DEX trading
 */
contract CarbonXToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    
    // Token metrics
    uint256 public totalCarbonOffset; // Total CO2 tonnes offset
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 million tokens max
    
    // Verification and tracking
    mapping(address => bool) public authorizedIssuers;
    mapping(address => uint256) public issuedAmounts;
    
    // Carbon project tracking
    struct CarbonProject {
        string name;
        string methodology;
        string location;
        uint256 offsetAmount;
        uint256 timestamp;
        bool verified;
    }
    
    CarbonProject[] public carbonProjects;
    mapping(uint256 => address) public projectIssuers;
    
    // Events
    event ProjectAdded(uint256 indexed projectId, string name, uint256 offsetAmount, address issuer);
    event TokensMinted(address indexed to, uint256 amount, uint256 indexed projectId);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    event CarbonOffset(address indexed account, uint256 amount);
    
    constructor() ERC20("CarbonX Token", "CXB") Ownable(msg.sender) {
        // Owner is automatically authorized issuer
        authorizedIssuers[msg.sender] = true;
        emit IssuerAuthorized(msg.sender);
    }
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not authorized issuer");
        _;
    }
    
    /**
     * @dev Authorize a new carbon credit issuer
     */
    function authorizeIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        require(!authorizedIssuers[issuer], "Already authorized");
        
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }
    
    /**
     * @dev Revoke issuer authorization
     */
    function revokeIssuer(address issuer) external onlyOwner {
        require(authorizedIssuers[issuer], "Not an authorized issuer");
        
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }
    
    /**
     * @dev Add a new carbon offset project
     */
    function addProject(
        string memory name,
        string memory methodology,
        string memory location,
        uint256 offsetAmount
    ) external onlyAuthorizedIssuer returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(offsetAmount > 0, "Offset amount must be > 0");
        
        uint256 projectId = carbonProjects.length;
        
        carbonProjects.push(CarbonProject({
            name: name,
            methodology: methodology,
            location: location,
            offsetAmount: offsetAmount,
            timestamp: block.timestamp,
            verified: true
        }));
        
        projectIssuers[projectId] = msg.sender;
        
        emit ProjectAdded(projectId, name, offsetAmount, msg.sender);
        return projectId;
    }
    
    /**
     * @dev Mint carbon tokens based on verified offsets
     */
    function mintFromProject(
        address to,
        uint256 amount,
        uint256 projectId
    ) external onlyAuthorizedIssuer nonReentrant {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");
        require(projectId < carbonProjects.length, "Invalid project ID");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        CarbonProject storage project = carbonProjects[projectId];
        require(project.verified, "Project not verified");
        require(projectIssuers[projectId] == msg.sender, "Not project issuer");
        
        _mint(to, amount);
        issuedAmounts[msg.sender] += amount;
        totalCarbonOffset += amount / 10**18; // Convert to tonnes
        
        emit TokensMinted(to, amount, projectId);
    }
    
    /**
     * @dev Mint tokens directly (for authorized issuers)
     */
    function mint(address to, uint256 amount) external onlyAuthorizedIssuer nonReentrant {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(to, amount);
        issuedAmounts[msg.sender] += amount;
        totalCarbonOffset += amount / 10**18; // Convert to tonnes
    }
    
    /**
     * @dev Burn tokens to claim carbon offset
     */
    function offsetCarbon(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        totalCarbonOffset -= amount / 10**18; // Convert to tonnes
        
        emit CarbonOffset(msg.sender, amount);
    }
    
    /**
     * @dev Get project details
     */
    function getProject(uint256 projectId) external view returns (
        string memory name,
        string memory methodology,
        string memory location,
        uint256 offsetAmount,
        uint256 timestamp,
        bool verified
    ) {
        require(projectId < carbonProjects.length, "Invalid project ID");
        
        CarbonProject storage project = carbonProjects[projectId];
        return (
            project.name,
            project.methodology,
            project.location,
            project.offsetAmount,
            project.timestamp,
            project.verified
        );
    }
    
    /**
     * @dev Get project issuer separately to avoid stack too deep
     */
    function getProjectIssuer(uint256 projectId) external view returns (address) {
        require(projectId < carbonProjects.length, "Invalid project ID");
        return projectIssuers[projectId];
    }
    
    /**
     * @dev Get total number of projects
     */
    function getProjectCount() external view returns (uint256) {
        return carbonProjects.length;
    }
    
    /**
     * @dev Get issuer's total issued amount
     */
    function getIssuedAmount(address issuer) external view returns (uint256) {
        return issuedAmounts[issuer];
    }
    
    /**
     * @dev Override decimals to represent 1 token = 1 tonne
     */
    function decimals() public view virtual override returns (uint8) {
        return 18; // Standard ERC20 decimals for DeFi compatibility
    }
    
    /**
     * @dev Emergency pause functionality
     */
    bool public paused = false;
    
    function pause() external onlyOwner {
        paused = true;
    }
    
    function unpause() external onlyOwner {
        paused = false;
    }
    
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(!paused, "Contract is paused");
        super._update(from, to, amount);
    }
}
