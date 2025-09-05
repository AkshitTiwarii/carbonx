const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying and setting up contract in one go...");
  
  try {
    // Step 1: Deploy the contract
    console.log("📋 Deploying CarbonCreditToken...");
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    const CarbonCreditToken = await hre.ethers.getContractFactory("CarbonCreditToken");
    const contract = await CarbonCreditToken.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log("✅ Contract deployed to:", contractAddress);
    
    // Step 2: Update .env.local with the new address
    const fs = require('fs');
    const path = require('path');
    try {
      const envPath = path.join(__dirname, '../../.env.local');
      let envContent = fs.readFileSync(envPath, 'utf8');
      envContent = envContent.replace(
        /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`
      );
      fs.writeFileSync(envPath, envContent);
      console.log("✅ Updated .env.local with new contract address");
    } catch (error) {
      console.log("⚠️  Could not update .env.local, please manually set:", contractAddress);
    }
    
    // Step 3: Create a sample project
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
      
      // Step 4: Mint some credits for the project
      console.log("💰 Minting carbon credits...");
      const mintTx = await contract.mintCredits(tokenId, "100"); // Mint 100 credits
      await mintTx.wait();
      console.log("✅ Minted 100 carbon credits for project", tokenId);
      
      // Step 5: List some credits for sale
      console.log("🏪 Listing credits for sale...");
      const listTx = await contract.listCredits(
        tokenId, 
        "50", // List 50 credits
        hre.ethers.parseEther("0.15") // 0.15 ETH per credit
      );
      await listTx.wait();
      console.log("✅ Listed 50 credits for sale");
    }
    
    // Step 6: Check current state
    console.log("📊 Current contract state:");
    const currentTokenId = await contract.getCurrentTokenId();
    console.log("- Current token ID:", currentTokenId.toString());
    
    const currentListingId = await contract.getCurrentListingId();
    console.log("- Current listing ID:", currentListingId.toString());
    
    if (currentTokenId > 0) {
      const balance = await contract.balanceOf(deployer.address, 1);
      console.log("- Deployer's credits balance:", balance.toString());
    }
    
    console.log("");
    console.log("🎉 Complete setup finished successfully!");
    console.log("📋 Contract Address:", contractAddress);
    console.log("🌐 Frontend should now load real blockchain data!");
    
    return contractAddress;
    
  } catch (error) {
    console.error("❌ Setup failed:", error);
    throw error;
  }
}

main()
  .then((address) => {
    console.log("✅ SUCCESS! Contract ready at:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 FAILED:", error.message);
    process.exit(1);
  });
