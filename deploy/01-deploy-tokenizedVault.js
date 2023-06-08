const alfajorescUsdTokenAddress = '0x874069fa1eb16d44d622f2e0ca25eea172369bc1';

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    await deploy('TokenizedVault', {
      from: deployer,
      args: [alfajorescUsdTokenAddress, "Raiz Vault Token", "RVT"],
      log: true,
    });
  };
  module.exports.tags = ['TokenizedVault'];