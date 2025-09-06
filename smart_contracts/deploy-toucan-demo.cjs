const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying CarbonMarketplaceV2 with Toucan Integration to Hardhat Network...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  try {
    // Deploy CarbonMarketplaceV2
    console.log("\n📦 Deploying CarbonMarketplaceV2...");
    const CarbonMarketplaceV2 = await ethers.getContractFactory("CarbonMarketplaceV2");
    const marketplace = await CarbonMarketplaceV2.deploy(deployer.address);
    await marketplace.waitForDeployment();
    
    const marketplaceAddress = await marketplace.getAddress();
    console.log("✅ CarbonMarketplaceV2 deployed to:", marketplaceAddress);

    // Authorize deployer as issuer
    console.log("\n🔐 Authorizing deployer as carbon credit issuer...");
    const authTx = await marketplace.authorizeIssuer(deployer.address);
    await authTx.wait();
    console.log("✅ Deployer authorized as issuer");

    // Create some demo Toucan projects
    console.log("\n🌱 Creating Toucan-verified carbon credit projects...");
    
    const projects = [
      {
        name: "Rimba Raya Biodiversity Reserve",
        methodology: "VM0007",
        co2Tonnes: 500000,
        pricePerTonne: ethers.parseEther("12.5"),
        location: "Indonesia",
        projectType: "REDD+",
        verraId: "VCS-191",
        isToucanVerified: true
      },
      {
        name: "Kichwa Indigenous Territory Conservation", 
        methodology: "VM0015",
        co2Tonnes: 750000,
        pricePerTonne: ethers.parseEther("8.75"),
        location: "Peru",
        projectType: "Forest Conservation",
        verraId: "VCS-674",
        isToucanVerified: true
      },
      {
        name: "Wind Power Project Maharashtra",
        methodology: "AMS-I.D",
        co2Tonnes: 1000000,
        pricePerTonne: ethers.parseEther("5.25"),
        location: "India",
        projectType: "Renewable Energy",
        verraId: "CDM-1234",
        isToucanVerified: false
      }
    ];

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      console.log(`  📋 Creating project: ${project.name}...`);
      
      const tx = await marketplace.createProject(
        project.name,
        project.methodology,
        project.co2Tonnes,
        project.pricePerTonne,
        project.location,
        project.projectType,
        project.verraId,
        project.isToucanVerified
      );
      await tx.wait();
      
      console.log(`  ✅ Project ${i + 1} created (Verra ID: ${project.verraId})`);
    }

    // Mint some carbon credits for demonstration
    console.log("\n🪙 Minting carbon credits for demonstration...");
    
    for (let i = 1; i <= 3; i++) {
      const amount = ethers.parseEther((Math.random() * 1000 + 500).toFixed(0));
      const tx = await marketplace.mintCredits(i, amount, deployer.address);
      await tx.wait();
      console.log(`  ✅ Minted ${ethers.formatEther(amount)} credits for project ${i}`);
    }

    // Create marketplace listings
    console.log("\n🏪 Creating marketplace listings...");
    
    for (let i = 1; i <= 3; i++) {
      const listingAmount = ethers.parseEther((Math.random() * 100 + 50).toFixed(0));
      const pricePerCredit = ethers.parseEther((Math.random() * 15 + 5).toFixed(2));
      const duration = 30 * 24 * 60 * 60; // 30 days
      
      const tx = await marketplace.listCredits(i, listingAmount, pricePerCredit, duration);
      await tx.wait();
      console.log(`  ✅ Listed ${ethers.formatEther(listingAmount)} credits from project ${i} at $${ethers.formatEther(pricePerCredit)} each`);
    }

    // Demonstrate retirement functionality
    console.log("\n🔥 Demonstrating carbon credit retirement...");
    
    const retireAmount = ethers.parseEther("10");
    const retireTx = await marketplace.retireCredits(
      1, 
      retireAmount, 
      "Demo retirement via CarbonX platform"
    );
    await retireTx.wait();
    console.log(`  ✅ Retired ${ethers.formatEther(retireAmount)} credits from project 1`);

    // Get retirement history
    const retirements = await marketplace.getRetirementHistory(deployer.address);
    console.log(`  📊 Total retirements by deployer: ${retirements.length}`);

    console.log("\n🎉 Deployment and setup complete!");
    console.log("\n📋 Summary:");
    console.log("================================");
    console.log(`Contract Address: ${marketplaceAddress}`);
    console.log(`Network: Hardhat (localhost)`);
    console.log(`Projects Created: ${projects.length}`);
    console.log(`Credits Minted: Available in all projects`);
    console.log(`Marketplace Listings: 3 active listings`);
    console.log(`Demo Retirement: 10 credits retired`);
    console.log("Toucan Integration: ✅ Framework implemented");
    console.log("================================");
    
    console.log("\n🌐 Next Steps:");
    console.log("1. Start the frontend: npm run dev");
    console.log("2. Visit: http://localhost:3000/toucan-demo");
    console.log("3. Connect your wallet to interact with the marketplace");
    console.log("4. The Toucan SDK integration is ready for Polygon mainnet");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
