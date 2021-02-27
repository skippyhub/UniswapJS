// https://www.youtube.com/watch?v=0Im5iaYoz1Y
// npm init -y
// node i @uniswap/sdk
// node install ethers or swap to truffel?
const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent} = require ('@uniswap/sdk');
const ethers = require('ethers');
// Choose which network to use.
//     MAINNET = 1,
//     ROPSTEN = 3,
//     RINKEBY = 4,
//     GÖRLI = 5,
//     KOVAN = 42
const chainId = ChainId.MAINNET;
// DIA token address NOT CHECKSUMMED, should do.
const tokenAddress ='0x6b175474e89094c44da98b954eedeac495271d0f';

const init = async () => {
    // Create an object of the token from the blockchain 
    const dia = await Fetcher.fetchTokenData(chainId,tokenAddress);

    // create an object of the Wrapped ether from the blockchain
    const weth=WETH[chainId]
    // create a uniswap trading pair.
    const pair = await Fetcher.fetchPairData(dia,weth);
    // create a routed pair with the input weth.
    const route = new Route([pair], weth);
    // this is to propose to the route amount to calculate expected trade execute
    const tokenAmount = new TokenAmount(weth, '10000000000000000');
    const trade = new Trade(route, tokenAmount, TradeType.EXACT_INPUT);

    // from the routed pair these are the mid prices
    console.log(route.midPrice.toSignificant(6));
    console.log(route.midPrice.invert().toSignificant(6));

    // from the trade proposal using the route show the execute and next mid price.
    console.log(trade.executionPrice.toSignificant(6));
    console.log(trade.nextMidPrice.toSignificant(6));

    // calculate the slip tolerance, how much diviation you want from your buying price.
    const slippageTolerance = new Percent('50', '10000');
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;

    // the paths of the tokens address. 
    const path = [weth.address, dia.address];
    const to ='';
    const deadline = Math.floor((Date.now()/1000)+ 60*20);
    const value = trade.inputAmount.raw;

    const provider = ethers.getDefaultProvider('mainnet',{
        // enter a ETH node network. check out infura or alchamey
        // this is where it is good to have your own node
        // to provide anonymous transactions. hidden in your node
        
        //uncomment and place your api. NO NODE API WILL ASK FOR YOUR PRIVATE KEY! 
        //infura: 'https://api'
    });

    const signer = new ethers.Wallet(PRIVATE_KEY);
    const account = signer.connect(provider);
    const uniswap = new ethers.Contract(
        // the router from uniswap, router 2.0 at address
        '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
        // send a contract message with the uniswap function uniswap.swapExactETHForTokens.
         ,['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts);']
         ,account
         );
    

    // make the transaction this will match the above message in the uniswap ethers.contact.message message
    const tx = await uniswap.swapExactETHForTokens(
        amountOutMin,
        path,
        address,
        deadline,
        {value, gasPrice: 20e9}
    );

    // wait for the transaction to be processed.
    const reciept = await tx.wait();
    console.log('Transaction in block ${receipt.blockNumber}');

    

}

init();
