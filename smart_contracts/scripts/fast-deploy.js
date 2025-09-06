// Simple script to deploy the contract
async function main() {
    const hre = require("hardhat");
    console.log("🌱 Deploying CarbonCreditToken contract...");
    
    try {
        // Deploy contract
        const CarbonCreditToken = await hre.ethers.getContractFactory("CarbonCreditToken");
        const carbonCreditToken = await CarbonCreditToken.deploy();
        await carbonCreditToken.waitForDeployment();
        
        const contractAddress = await carbonCreditToken.getAddress();
        console.log("✅ Contract deployed to:", contractAddress);
        
        // Create sample projects
        console.log("🌱 Creating sample Amazon project...");
        const amazonTx = await carbonCreditToken.createProject(
            "Amazon Rainforest Conservation Project",
            "VCS",
            "1000", // 1000 tonnes
            hre.ethers.parseEther("0.01"), // 0.01 ETH per tonne
            Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
            "Brazil, Amazon Basin",
            "Forest Conservation",
            "https://api.carbonx.com/metadata/amazon-project.json"
        );
        await amazonTx.wait();
        console.log("✅ Amazon project created");
        
        console.log("☀️ Creating sample Solar project...");
        const solarTx = await carbonCreditToken.createProject(
            "Solar Energy Farm - India",
            "Gold Standard",
            "500", // 500 tonnes
            hre.ethers.parseEther("0.008"), // 0.008 ETH per tonne
            Math.floor(Date.now() / 1000) + (2 * 365 * 24 * 60 * 60), // 2 years from now
            "Rajasthan, India",
            "Renewable Energy",
            "https://api.carbonx.com/metadata/solar-project.json"
        );
        await solarTx.wait();
        console.log("✅ Solar project created");
        
        console.log("\n🎉 Setup complete!");
        console.log("Contract Address:", contractAddress);
        console.log("\nUpdate your .env.local file with:");
        console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
        
        return contractAddress;
    } catch (error) {
        console.error("❌ Error:", error.message);
        throw error;
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { main };
