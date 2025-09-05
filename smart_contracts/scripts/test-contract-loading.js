const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing contract loading like the frontend does...");
    
    const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
    
    // Connect using the same method as frontend
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    
    // Get the deployer account (first account from hardhat)
    const [deployer] = await ethers.getSigners();
    
    // Use the same ABI as frontend
    const CONTRACT_ABI = [
        "function projects(uint256) view returns (string name, string methodology, uint256 co2Tonnes, uint256 pricePerTonne, uint256 expiryDate, string location, string projectType, address issuer, bool isActive, string metadataURI)",
        "function getCurrentTokenId() view returns (uint256)",
        "function createProject(string name, string methodology, uint256 co2Tonnes, uint256 pricePerTonne, uint256 expiryDate, string location, string projectType, string metadataURI) returns (uint256)",
        "function listings(uint256) view returns (uint256 tokenId, uint256 amount, uint256 pricePerToken, address seller, bool isActive, uint256 listedAt)",
        "function getCurrentListingId() view returns (uint256)",
        "function listCredits(uint256 tokenId, uint256 amount, uint256 pricePerToken) returns (uint256)",
        "function buyCredits(uint256 listingId) payable",
        "function balanceOf(address account, uint256 id) view returns (uint256)",
        "function mintCredits(uint256 tokenId, uint256 amount)",
        "function authorizeIssuer(address issuer)",
        "function authorizedIssuers(address) view returns (bool)"
    ];
    
    try {
        console.log("🔗 Connecting to contract...");
        const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
        
        console.log("📊 Getting current token ID...");
        const currentTokenId = await contract.getCurrentTokenId();
        console.log("Current token ID:", currentTokenId.toString());
        
        console.log("🏗️ Loading all projects...");
        const projects = [];
        
        for (let i = 1; i <= currentTokenId; i++) {
            try {
                console.log(`Loading project ${i}...`);
                const project = await contract.projects(i);
                
                const projectData = {
                    tokenId: i.toString(),
                    name: project.name,
                    methodology: project.methodology,
                    co2Tonnes: project.co2Tonnes.toString(),
                    pricePerTonne: ethers.formatEther(project.pricePerTonne),
                    expiryDate: project.expiryDate.toString(),
                    location: project.location,
                    projectType: project.projectType,
                    issuer: project.issuer,
                    isActive: project.isActive,
                    metadataURI: project.metadataURI
                };
                
                projects.push(projectData);
                console.log(`✅ Project ${i}:`, projectData.name);
                
            } catch (error) {
                console.error(`❌ Error loading project ${i}:`, error.message);
            }
        }
        
        console.log("\n📋 Final Projects Array:");
        console.log(JSON.stringify(projects, null, 2));
        
        console.log("\n🛒 Checking listings...");
        const currentListingId = await contract.getCurrentListingId();
        console.log("Current listing ID:", currentListingId.toString());
        
        if (currentListingId > 0) {
            for (let i = 1; i <= currentListingId; i++) {
                try {
                    const listing = await contract.listings(i);
                    console.log(`Listing ${i}:`, {
                        tokenId: listing.tokenId.toString(),
                        amount: listing.amount.toString(),
                        pricePerToken: ethers.formatEther(listing.pricePerToken),
                        seller: listing.seller,
                        isActive: listing.isActive
                    });
                } catch (error) {
                    console.error(`Error loading listing ${i}:`, error.message);
                }
            }
        } else {
            console.log("No listings found (this is normal if no one has listed credits for sale)");
        }
        
    } catch (error) {
        console.error("❌ Contract connection error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
