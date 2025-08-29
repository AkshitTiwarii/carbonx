import { ethers } from "hardhat";

async function main() {
  const Factory = await ethers.getContractFactory("CarbonCreditToken");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  console.log("CarbonCreditToken deployed at:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
