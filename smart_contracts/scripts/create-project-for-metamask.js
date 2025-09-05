const { ethers } = require("hardhat");

async function main() {
    console.log("🌱 Creating a new project with your MetaMask account as issuer...");
    
    const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
    const metamaskAccount = "0x921157C12B66EaF21DA82F3e289eCDB6EF069Ea5";
    
    // Get the deployer account (contract owner)
    const [deployer] = await ethers.getSigners();
    console.log("📝 Using deployer account:", deployer.address);
    
    // Connect to the contract
    const CarbonCreditToken = await ethers.getContractFactory("CarbonCreditToken");
    const contract = CarbonCreditToken.attach(contractAddress);
    
    try {
        // First, let's impersonate the MetaMask account to create the project
        // This simulates creating a project from the frontend with your MetaMask account
        
        console.log("🎯 Creating project for MetaMask account:", metamaskAccount);
        
        // Get a signer for the MetaMask account (using hardhat's impersonateAccount)
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [metamaskAccount],
        });
        
        // Add some ETH to the account for gas
        await network.provider.send("hardhat_setBalance", [
            metamaskAccount,
            "0x56BC75E2D630E0000", // 100 ETH
        ]);
        
        const metamaskSigner = await ethers.getSigner(metamaskAccount);
        const contractWithMetaMask = contract.connect(metamaskSigner);
        
        // Create a new project with MetaMask account as issuer
        console.log("🏗️  Creating project...");
        const createTx = await contractWithMetaMask.createProject(
            "Solar Energy Carbon Offset Project",
            "VCS", // Verified Carbon Standard
            ethers.parseUnits("500", 0), // 500 tonnes CO2
            ethers.parseEther("0.015"), // 0.015 ETH per tonne
            Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // Expires in 1 year
            "California, USA",
            "Solar Energy",
            "https://api.carbonx.com/metadata/solar-project.json"
        );
        
        console.log("⏳ Transaction sent:", createTx.hash);
        const receipt = await createTx.wait();
        console.log("✅ Project created successfully!");
        
        // Get the new project ID
        const currentTokenId = await contract.getCurrentTokenId();
        console.log("🆔 New project ID:", currentTokenId.toString());
        
        // Get project details
        const newProject = await contract.projects(currentTokenId);
        console.log("\n🌟 New Project Details:");
        console.log("- Name:", newProject.name);
        console.log("- CO2 Tonnes:", newProject.co2Tonnes.toString());
        console.log("- Price per Tonne:", ethers.formatEther(newProject.pricePerTonne), "ETH");
        console.log("- Issuer:", newProject.issuer);
        console.log("- Location:", newProject.location);
        console.log("- Type:", newProject.projectType);
        
        console.log("\n🎉 Success! You can now mint credits for project", currentTokenId.toString());
        
    } catch (error) {
        console.error("❌ Error creating project:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
