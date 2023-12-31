import { utils, Wallet,Provider } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

export default async function (hre: HardhatRuntimeEnvironment) {
  // Private key of the account used to deploydock
  const provider = new Provider("http://localhost:3050/");
  const wallet = new Wallet("0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110");
  const deployer = new Deployer(hre, wallet);
  const factoryArtifact = await deployer.loadArtifact("AAFactory");
  const aaArtifact = await deployer.loadArtifact("TwoUserMultisig");

  // Getting the bytecodeHash of the account
  const bytecodeHash = utils.hashBytecode(aaArtifact.bytecode);
 // Deploy AccountRegistry
 const registryArtifact = await deployer.loadArtifact("AccountRegistry");
 const registry = (await deployer.deploy(registryArtifact, []));
 console.log(`registry: "${registry.address}",`)

 // Deploy ModuleManager
 const moduleManagerArtifact = await deployer.loadArtifact("ModuleManager");
 const moduleManager = (await deployer.deploy(moduleManagerArtifact, [wallet.address, registry.address]));
 console.log(`moduleManager: "${moduleManager.address}",`)
  const factory = await deployer.deploy(
    factoryArtifact,
    [bytecodeHash,moduleManager.address,registry.address],
    undefined,
    [
      // Since the factory requires the code of the multisig to be available,
      // we should pass it here as well.
      aaArtifact.bytecode,
    ]
  );

  console.log(`AA factory address: ${factory.address}`);
}
