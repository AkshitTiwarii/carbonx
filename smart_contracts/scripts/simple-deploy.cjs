const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Starting deployment...');
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying with account:', deployer.address);
  
  // Get balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH');
  
  // Deploy contract
  console.log('📋 Deploying CarbonCreditToken...');
  const CarbonCreditToken = await ethers.getContractFactory('CarbonCreditToken');
  const carbonToken = await CarbonCreditToken.deploy();
  
  // Wait for deployment
  await carbonToken.waitForDeployment();
  const contractAddress = await carbonToken.getAddress();
  
  console.log('✅ Contract deployed to:', contractAddress);
  
  // Create sample projects
  console.log('🌱 Creating sample projects...');
  
  // First authorize the deployer as an issuer
  await carbonToken.authorizeIssuer(deployer.address);
  console.log('✅ Deployer authorized as issuer');
  
  // Project 1: Amazon Forest Conservation
  await carbonToken.createProject(
    'Amazon Rainforest Conservation Project', // name
    'VCS', // methodology
    1000, // 1000 tonnes
    ethers.parseEther('0.01'), // 0.01 ETH per tonne
    Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
    'Brazil', // location
    'Forest Conservation', // projectType
    'ipfs://QmExampleHash1' // metadataURI
  );
  
  // Project 2: Solar Energy Farm
  await carbonToken.createProject(
    'Solar Energy Farm Initiative', // name
    'Gold Standard', // methodology
    500, // 500 tonnes
    ethers.parseEther('0.008'), // 0.008 ETH per tonne
    Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
    'California, USA', // location
    'Renewable Energy', // projectType
    'ipfs://QmExampleHash2' // metadataURI
  );
  
  console.log('✅ Sample projects created successfully!');
  console.log('🌐 Contract Address:', contractAddress);
  console.log('🔗 Network: Hardhat Local (Chain ID: 31337)');
  console.log('📊 Sample Projects: 2 projects created');
  console.log('');
  console.log('🔧 Update your .env.local file:');
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => {
    console.log('🎉 Deployment completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
