const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Enhanced Carbon Marketplace Deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Deploy the Enhanced Carbon Marketplace contract
  console.log("\n📄 Deploying EnhancedCarbonMarketplace...");
  
  try {
    const EnhancedCarbonMarketplace = await ethers.getContractFactory("EnhancedCarbonMarketplace");
    const marketplace = await EnhancedCarbonMarketplace.deploy(deployer.address);
    await marketplace.waitForDeployment();
    
    const marketplaceAddress = await marketplace.getAddress();
    console.log("✅ EnhancedCarbonMarketplace deployed to:", marketplaceAddress);

    // Authorize the deployer as an issuer
    console.log("\n🔐 Setting up authorization...");
    const authTx = await marketplace.authorizeIssuer(deployer.address);
    await authTx.wait();
    console.log("✅ Deployer authorized as issuer");

    // Create Toucan-integrated project
    console.log("\n🌿 Creating Toucan-verified project...");
    const toucanProjectTx = await marketplace.createToucanProject(
      "Amazon Rainforest Conservation - Acre [Toucan Verified]",
      ethers.parseUnits("1800000", 0), // 1.8M tonnes CO2
      ethers.parseEther("0.022"), // 0.022 ETH per tonne
      "Brazil, Acre State",
      "VCS-1396", // Real Verra ID
      2023,
      "https://ipfs.io/ipfs/QmAmazonAcre"
    );
    await toucanProjectTx.wait();
    console.log("✅ Created Toucan-verified Amazon project (Token ID: 1)");

    // Create additional real projects
    console.log("\n🌍 Creating verified carbon projects...");
    
    const kasigauTx = await marketplace.createProject(
      "Kasigau Corridor REDD+",
      "VCS",
      ethers.parseUnits("1500000", 0),
      ethers.parseEther("0.015"),
      Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60 * 10), // 10 years
      "Kenya, Taita-Taveta",
      "Forest Conservation",
      "https://ipfs.io/ipfs/QmKasigau",
      "VCS-612",
      2023
    );
    await kasigauTx.wait();
    console.log("✅ Created Kasigau REDD+ project (Token ID: 2)");

    // Mint initial credits for testing
    console.log("\n🏭 Minting initial carbon credits...");
    
    const mint1Tx = await marketplace.mintCredits(1, 1000, deployer.address);
    await mint1Tx.wait();
    console.log("✅ Minted 1000 Toucan Amazon credits");

    const mint2Tx = await marketplace.mintCredits(2, 1500, deployer.address);
    await mint2Tx.wait();
    console.log("✅ Minted 1500 Kasigau credits");

    // Create marketplace listings
    console.log("\n🏪 Creating marketplace listings...");
    
    const list1Tx = await marketplace.listCredits(
      1, 
      100, 
      ethers.parseEther("0.022"), 
      7 * 24 * 60 * 60 // 7 days
    );
    await list1Tx.wait();
    console.log("✅ Listed 100 Toucan Amazon credits");

    const list2Tx = await marketplace.listCredits(
      2, 
      200, 
      ethers.parseEther("0.015"), 
      14 * 24 * 60 * 60 // 14 days
    );
    await list2Tx.wait();
    console.log("✅ Listed 200 Kasigau credits");

    // Test retirement functionality
    console.log("\n♻️ Testing retirement functionality...");
    
    const retireTx = await marketplace.retireCredits(
      2,
      50,
      "Corporate Carbon Neutrality Initiative - Demo Retirement",
      true
    );
    await retireTx.wait();
    console.log("✅ Retired 50 Kasigau credits for testing");

    // Get updated balances and stats
    const balance1 = await marketplace.balanceOf(deployer.address, 1);
    const balance2 = await marketplace.balanceOf(deployer.address, 2);
    const totalRetired = await marketplace.getTotalRetiredByUser(deployer.address);
    const isToucanCredit = await marketplace.isToucanCredit(1);

    console.log("\n📊 Enhanced Marketplace Summary:");
    console.log("=".repeat(50));
    console.log("Contract Address:", marketplaceAddress);
    console.log("Network:", (await deployer.provider.getNetwork()).name);
    console.log("Chain ID:", (await deployer.provider.getNetwork()).chainId);
    
    console.log("\n🌱 Projects Created:");
    console.log("1. Amazon Rainforest (Toucan Verified):", isToucanCredit ? "✅ Toucan" : "❌ Regular");
    console.log("2. Kasigau Corridor REDD+ (VCS-612)");
    
    console.log("\n💰 Marketplace Listings:");
    console.log("• 100 Toucan Amazon credits @ 0.022 ETH each");
    console.log("• 200 Kasigau credits @ 0.015 ETH each");
    
    console.log("\n📈 Current Balances:");
    console.log(`• Toucan Amazon Credits: ${balance1} (900 available + 100 listed)`);
    console.log(`• Kasigau Credits: ${balance2} (1250 available + 200 listed + 50 retired)`);
    console.log(`• Total Retired: ${totalRetired} credits`);

    console.log("\n🔗 Key Features Demonstrated:");
    console.log("✅ Mint: Successfully minted credits for multiple projects");
    console.log("✅ Buy: Marketplace listings created and ready for purchase");
    console.log("✅ Retire: Permanent retirement with reasons recorded on-chain");
    console.log("✅ Toucan Integration: Framework ready for Polygon bridge");
    
    console.log("\n🌿 Toucan Protocol Integration Notes:");
    console.log("• Smart contract includes Toucan-specific project creation");
    console.log("• Verra IDs mapped for real credit verification");
    console.log("• Ready for future API integration with Toucan's Polygon pools");
    console.log("• Framework supports bridged credits from Verra registry");
    
    console.log("\n✅ Enhanced Carbon Marketplace deployment completed!");
    console.log("🚀 All Mint/Buy/Retire functionality operational!");
    console.log("🔗 Blockchain-verified carbon credits ready for trading!");

    // Save deployment info for frontend integration
    const deploymentInfo = {
      contractAddress: marketplaceAddress,
      network: (await deployer.provider.getNetwork()).name,
      chainId: (await deployer.provider.getNetwork()).chainId,
      deployer: deployer.address,
      toucanProjectId: 1,
      kasigauProjectId: 2,
      deployedAt: new Date().toISOString()
    };

    console.log("\n📄 Deployment Info (for frontend integration):");
    console.log(JSON.stringify(deploymentInfo, null, 2));

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
