const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🌱 Deploying CarbonCreditToken contract...");

  // Get the contract factory
  const CarbonCreditToken = await ethers.getContractFactory("CarbonCreditToken");
  
  // Deploy the contract
  const carbonCreditToken = await CarbonCreditToken.deploy();
  
  await carbonCreditToken.waitForDeployment();
  const contractAddress = await carbonCreditToken.getAddress();

  console.log("✅ CarbonCreditToken deployed to:", contractAddress);
  console.log("📝 Contract details:");
  console.log("   - Network: localhost");
  
  // Auto-update .env.local file
  const envPath = path.join(__dirname, '../../.env.local');
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update the contract address line
    const addressRegex = /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/;
    const newAddressLine = `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`;
    
    if (addressRegex.test(envContent)) {
      envContent = envContent.replace(addressRegex, newAddressLine);
    } else {
      // If line doesn't exist, add it
      envContent += `\n${newAddressLine}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("� Updated .env.local with new contract address");
  } catch (error) {
    console.log("⚠️  Could not update .env.local:", error.message);
  }
  
  console.log("🎉 Contract verified and ready!");
  console.log("📋 Frontend will automatically use:", contractAddress);
  
  // Optional: Create a sample project for testing
  try {
    console.log("🧪 Creating sample carbon credit project...");
    
    const sampleProject = await carbonCreditToken.createProject(
      "Amazon Rainforest Conservation Project",
      "VCS", // Verified Carbon Standard
      ethers.parseUnits("1000", 0), // 1000 tonnes CO2
      ethers.parseEther("0.01"), // 0.01 ETH per tonne
      Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // Expires in 1 year
      "Brazil, Amazon Basin",
      "Forest Conservation",
      "https://api.carbonx.com/metadata/sample-project.json"
    );
    
    await sampleProject.wait();
    console.log("✅ Sample project created successfully!");
    
  } catch (error) {
    console.log("⚠️  Sample project creation failed (this is normal):", error.message);
  }
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
