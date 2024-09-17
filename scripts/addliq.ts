import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {

    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

    const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

    
    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    
    const ethAmount = ethers.parseEther("10"); // 10 ETH for gas fees 
    await helpers.setBalance(TOKEN_HOLDER, ethAmount);

    
    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const DAI_Contract = await ethers.getContractAt("IERC20", DAI, impersonatedSigner); 
    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

    const AmoutUsdcDesired = ethers.parseUnits("100", 6); // 100USDC
    const AmountDaiDesired = ethers.parseUnits("100", 18); // 100DAI
    const AmountUsdcMin = ethers.parseUnits("80", 6); // 80USDC
    const AmountDaiMin = ethers.parseUnits("80", 18); // 80DAI

    
    await USDC_Contract.approve(ROUTER_ADDRESS, AmoutUsdcDesired);
    await DAI_Contract.approve(ROUTER_ADDRESS, AmountDaiDesired); 

    
    const usdcBalBefore = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBalBefore = await DAI_Contract.balanceOf(impersonatedSigner.address);

    const deadline = Math.floor(Date.now() / 1000) + (60 * 20); // 20 mins

    console.log("=========================================================");
    console.log("USDC balance before adding liquidity:", ethers.formatUnits(usdcBalBefore, 6));
    console.log("DAI balance before adding liquidity:", ethers.formatUnits(daiBalBefore, 18));

   
    await ROUTER.addLiquidity(
        USDC,
        DAI,
        AmoutUsdcDesired,
        AmountDaiDesired,
        AmountUsdcMin,
        AmountDaiMin,
        impersonatedSigner.address,
        deadline
    );

    
    const usdcBalAfter = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBalAfter = await DAI_Contract.balanceOf(impersonatedSigner.address);

    console.log("=========================================================");
    console.log("USDC balance after adding liquidity:", ethers.formatUnits(usdcBalAfter, 6));
    console.log("DAI balance after adding liquidity:", ethers.formatUnits(daiBalAfter, 18));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
