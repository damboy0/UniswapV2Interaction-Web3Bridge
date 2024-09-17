import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");


async function main(){

    //next remove liquidity::

//     address tokenA,
//   address tokenB,
//   uint liquidity,
//   uint amountAMin,
//   uint amountBMin,
//   address to,
//   uint deadline


    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

    const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const DAI_Contract = await ethers.getContractAt("IERC20", DAI, impersonatedSigner); 
    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);


    const deadline = Math.floor(Date.now() / 1000) + (60 * 20); // 0 mins

    const USDCDAI_PAIR_ADDRESS = "0xB20bd5D04BE54f870D5C0d3cA85d82b34B836405"; 



    const LP_Contract = await ethers.getContractAt("IERC20", USDCDAI_PAIR_ADDRESS, impersonatedSigner);

    const lpBalance = await LP_Contract.balanceOf(impersonatedSigner.address); //balance of impersonator
    console.log("LP token balance:", ethers.formatUnits(lpBalance, 18));

    const AmountUsdcMin = ethers.parseUnits("80", 6); // 80USDC
    const AmountDaiMin = ethers.parseUnits("80", 18); // 80DAI


    await LP_Contract.approve(ROUTER_ADDRESS, lpBalance);

    await ROUTER.removeLiquidity(
        USDC,
        DAI,
        lpBalance,          // liquidity Amount to remove
        AmountUsdcMin,      
        AmountDaiMin,       
        impersonatedSigner.address,  
        deadline            
    );


    const usdcBalAfterRemove = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBalAfterRemove = await DAI_Contract.balanceOf(impersonatedSigner.address);

    console.log("USDC balance after removing liquidity:", ethers.formatUnits(usdcBalAfterRemove, 6));
    console.log("DAI balance after removing liquidity:", ethers.formatUnits(daiBalAfterRemove, 18));

}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});