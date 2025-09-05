const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting complete contract setup...");
  
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Using deployer account:", deployer.address);
  console.log("Contract address:", contractAddress);
  
  // Connect to the deployed contract
  const CarbonCreditToken = await hre.ethers.getContractFactory("CarbonCreditToken");
  const contract = CarbonCreditToken.attach(contractAddress);
  
  try {
    // Step 1: Authorize the deployer as an issuer (should already be authorized as they deployed)
    console.log("📋 Checking if deployer is authorized as issuer...");
    const isAuthorized = await contract.authorizedIssuers(deployer.address);
    console.log("Deployer is authorized:", isAuthorized);
    
    if (!isAuthorized) {
      console.log("🔐 Authorizing deployer as issuer...");
      const authTx = await contract.authorizeIssuer(deployer.address);
      await authTx.wait();
      console.log("✅ Deployer authorized as issuer");
    }
    
    // Step 2: Create a sample project
    console.log("🌱 Creating sample project...");
    const createTx = await contract.createProject(
      "Renewable Energy Forest Project",
      "Afforestation and reforestation in degraded lands",
      "1000", // 1000 tonnes CO2
      hre.ethers.parseEther("0.1"), // 0.1 ETH per tonne
      Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
      "Amazon Rainforest, Brazil", 
      "Afforestation",
      "https://example.com/metadata.json"
    );
    
    const receipt = await createTx.wait();
    console.log("✅ Project created! Transaction hash:", receipt.hash);
    
    // Get the project token ID from the event
    const projectEvent = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed && parsed.name === 'ProjectCreated';
      } catch {
        return false;
      }
    });
    
    if (projectEvent) {
      const parsedEvent = contract.interface.parseLog(projectEvent);
      const tokenId = parsedEvent.args.tokenId.toString();
      console.log("📋 Project token ID:", tokenId);
      
      // Step 3: Mint some credits for the project
      console.log("💰 Minting carbon credits...");
      const mintTx = await contract.mintCredits(tokenId, "100"); // Mint 100 credits
      await mintTx.wait();
      console.log("✅ Minted 100 carbon credits for project", tokenId);
      
      // Step 4: List some credits for sale
      console.log("🏪 Listing credits for sale...");
      const listTx = await contract.listCredits(
        tokenId, 
        "50", // List 50 credits
        hre.ethers.parseEther("0.15") // 0.15 ETH per credit
      );
      await listTx.wait();
      console.log("✅ Listed 50 credits for sale");
    }
    
    // Step 5: Check current state
    console.log("📊 Current contract state:");
    const currentTokenId = await contract.getCurrentTokenId();
    console.log("- Current token ID:", currentTokenId.toString());
    
    const currentListingId = await contract.getCurrentListingId();
    console.log("- Current listing ID:", currentListingId.toString());
    
    const balance = await contract.balanceOf(deployer.address, 1);
    console.log("- Deployer's credits balance:", balance.toString());
    
    console.log("🎉 Setup completed successfully!");
    console.log("");
    console.log("📋 Summary:");
    console.log("- Contract deployed and configured");
    console.log("- Sample project created"); 
    console.log("- Credits minted and listed for sale");
    console.log("- Ready for frontend testing!");
    
  } catch (error) {
    console.error("❌ Setup failed:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("✅ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Setup failed:", error.message);
    process.exit(1);
  });
