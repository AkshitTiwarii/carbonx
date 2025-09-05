const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  
  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    const CarbonCreditToken = await hre.ethers.getContractFactory("CarbonCreditToken");
    console.log("Got contract factory...");
    
    const contract = await CarbonCreditToken.deploy();
    console.log("Deploy transaction sent...");
    
    await contract.waitForDeployment();
    console.log("Deployment confirmed...");
    
    const address = await contract.getAddress();
    console.log("✅ Contract deployed to:", address);
    
    return address;
  } catch (error) {
    console.error("❌ Deployment error:", error);
    throw error;
  }
}

main()
  .then((address) => {
    console.log("🎉 SUCCESS! Contract address:", address);
    console.log("Please update your .env.local file with this address");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 FAILED:", error.message);
    process.exit(1);
  });
