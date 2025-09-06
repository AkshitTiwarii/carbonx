import { ethers } from 'ethers';

// Smart contract ABI (corrected to match actual contract functions)
const CONTRACT_ABI = [
  // Project struct and functions
  "function projects(uint256) view returns (string name, string methodology, uint256 co2Tonnes, uint256 pricePerTonne, uint256 expiryDate, string location, string projectType, address issuer, bool isActive, string metadataURI)",
  "function getCurrentTokenId() view returns (uint256)",
  "function createProject(string name, string methodology, uint256 co2Tonnes, uint256 pricePerTonne, uint256 expiryDate, string location, string projectType, string metadataURI) returns (uint256)",
  
  // Marketplace functions
  "function listings(uint256) view returns (uint256 tokenId, uint256 amount, uint256 pricePerToken, address seller, bool isActive, uint256 listedAt)",
  "function getCurrentListingId() view returns (uint256)",
  "function listCredits(uint256 tokenId, uint256 amount, uint256 pricePerToken) returns (uint256)",
  "function buyCredits(uint256 listingId) payable",
  
  // ERC1155 functions
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function mintCredits(uint256 tokenId, uint256 amount)",
  
  // Authorization
  "function authorizeIssuer(address issuer)",
  "function authorizedIssuers(address) view returns (bool)",
  
  // Events
  "event ProjectCreated(uint256 indexed tokenId, string name, address indexed issuer, uint256 co2Tonnes, uint256 pricePerTonne)",
  "event CreditsListed(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, uint256 amount, uint256 pricePerToken)",
  "event CreditsPurchased(uint256 indexed listingId, uint256 indexed tokenId, address indexed buyer, uint256 amount, uint256 totalPrice)"
];

export interface ContractProject {
  tokenId: string;
  name: string;
  methodology: string;
  co2Tonnes: string;
  pricePerTonne: string;
  expiryDate: string;
  location: string;
  projectType: string;
  issuer: string;
  isActive: boolean;
  metadataURI: string;
}

export interface ContractListing {
  listingId: string;
  tokenId: string;
  amount: string;
  pricePerToken: string;
  seller: string;
  isActive: boolean;
  listedAt: string;
}

class CarbonCreditContract {
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  async initialize(provider: any, retryCount = 0, maxRetries = 3): Promise<void> {
    if (!provider) throw new Error('Provider not available');
    
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    console.log('Initializing contract with address:', contractAddress);
    
    if (!contractAddress) throw new Error('Contract address not configured');

    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      this.signer = await ethersProvider.getSigner();
      
      console.log('Signer address:', await this.signer.getAddress());
      console.log('Network:', await ethersProvider.getNetwork());
      
      this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.signer);
      
      // Test contract connection by calling a simple view function with timeout
      const connectionTest = Promise.race([
        this.contract.getCurrentTokenId(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ]);
      
      const currentTokenId = await connectionTest;
      console.log('Contract connected successfully! Current token ID:', currentTokenId.toString());
    } catch (error) {
      console.error('Contract connection test failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // If it's a circuit breaker error and we haven't exhausted retries
      if (errorMessage.includes('circuit breaker') && retryCount < maxRetries) {
        console.log(`Retrying connection in ${(retryCount + 1) * 2} seconds... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
        return this.initialize(provider, retryCount + 1, maxRetries);
      }
      throw new Error('Failed to connect to contract: ' + errorMessage);
    }
  }

  async getProjects(): Promise<ContractProject[]> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const currentTokenId = await this.contract.getCurrentTokenId();
    const projects: ContractProject[] = [];
    
    for (let i = 1; i <= currentTokenId; i++) {
      try {
        const project = await this.contract.projects(i);
        projects.push({
          tokenId: i.toString(),
          name: project.name,
          methodology: project.methodology,
          co2Tonnes: project.co2Tonnes.toString(),
          pricePerTonne: ethers.formatEther(project.pricePerTonne),
          expiryDate: project.expiryDate.toString(),
          location: project.location,
          projectType: project.projectType,
          issuer: project.issuer,
          isActive: project.isActive,
          metadataURI: project.metadataURI
        });
      } catch (error) {
        console.error(`Error loading project ${i}:`, error);
      }
    }
    
    return projects;
  }

  async getListings(): Promise<ContractListing[]> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const currentListingId = await this.contract.getCurrentListingId();
    const listings: ContractListing[] = [];
    
    for (let i = 1; i <= currentListingId; i++) {
      try {
        const listing = await this.contract.listings(i);
        if (listing.isActive) {
          listings.push({
            listingId: i.toString(),
            tokenId: listing.tokenId.toString(),
            amount: listing.amount.toString(),
            pricePerToken: ethers.formatEther(listing.pricePerToken),
            seller: listing.seller,
            isActive: listing.isActive,
            listedAt: listing.listedAt.toString()
          });
        }
      } catch (error) {
        console.error(`Error loading listing ${i}:`, error);
      }
    }
    
    return listings;
  }

  async getUserBalance(userAddress: string, tokenId: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const balance = await this.contract.balanceOf(userAddress, tokenId);
    return balance.toString();
  }

  async createProject(projectData: {
    name: string;
    methodology: string;
    co2Tonnes: string;
    pricePerTonne: string;
    expiryDate: string;
    location: string;
    projectType: string;
    metadataURI: string;
  }) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const priceInWei = ethers.parseEther(projectData.pricePerTonne);
    const expiryTimestamp = Math.floor(new Date(projectData.expiryDate).getTime() / 1000);
    
    const tx = await this.contract.createProject(
      projectData.name,
      projectData.methodology,
      projectData.co2Tonnes,
      priceInWei,
      expiryTimestamp,
      projectData.location,
      projectData.projectType,
      projectData.metadataURI || `https://api.carbonx.com/metadata/${Date.now()}.json`
    );
    
    return await tx.wait();
  }

  async mintCredits(tokenId: string, amount: string, pricePerTonne: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const totalPrice = ethers.parseEther((parseFloat(amount) * parseFloat(pricePerTonne)).toString());
    
    const tx = await this.contract.mintCredits(tokenId, amount, {
      value: totalPrice
    });
    
    return await tx.wait();
  }

  async buyCredits(listingId: string, amount: string, pricePerToken: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const totalPrice = ethers.parseEther((parseFloat(amount) * parseFloat(pricePerToken)).toString());
    
    const tx = await this.contract.buyCredits(listingId, amount, {
      value: totalPrice
    });
    
    return await tx.wait();
  }
}

export const carbonCreditContract = new CarbonCreditContract();
