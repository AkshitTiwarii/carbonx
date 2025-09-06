const { ethers } = require("hardhat");

async function main() {
    console.log("🌱 Deploying CarbonCreditToken contract...");
    
    // Deploy the contract
    const CarbonCreditToken = await ethers.getContractFactory("CarbonCreditToken");
    const carbonCreditToken = await CarbonCreditToken.deploy();
    await carbonCreditToken.waitForDeployment();
    
    const contractAddress = await carbonCreditToken.getAddress();
    console.log("✅ Contract deployed to:", contractAddress);
    
    // Create sample Amazon project
    console.log("🌱 Creating Amazon Rainforest project...");
    const amazonTx = await carbonCreditToken.createProject(
        "Amazon Rainforest Conservation Project",
        "VCS",
        ethers.parseUnits("1000", 0), // 1000 tonnes
        ethers.parseEther("0.01"), // 0.01 ETH per tonne
        Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
        "Brazil, Amazon Basin",
        "Forest Conservation",
        "https://api.carbonx.com/metadata/amazon-project.json"
    );
    await amazonTx.wait();
    console.log("✅ Amazon project created");
    
    // Create sample Solar project
    console.log("☀️ Creating Solar Energy project...");
    const solarTx = await carbonCreditToken.createProject(
        "Solar Energy Farm - India",
        "Gold Standard",
        ethers.parseUnits("500", 0), // 500 tonnes
        ethers.parseEther("0.008"), // 0.008 ETH per tonne
        Math.floor(Date.now() / 1000) + (2 * 365 * 24 * 60 * 60), // 2 years from now
        "Rajasthan, India",
        "Renewable Energy",
        "https://api.carbonx.com/metadata/solar-project.json"
    );
    await solarTx.wait();
    console.log("✅ Solar project created");
    
    console.log("🎉 Setup complete!");
    console.log("Contract Address:", contractAddress);
    console.log("Update your .env.local file with:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
