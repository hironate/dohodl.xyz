// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

abstract contract UniswapFactoryAndPositionManagerHelper {
    error InvalidTokenAddressZero();

    function getSqrtPriceX96(
        uint256 amountA,
        uint256 amountB
    ) internal pure returns (uint160) {
        uint256 sqrtPrice = (Math.sqrt(amountA) * (2 ** 96)) /
            Math.sqrt(amountB);
        return uint160(sqrtPrice);
    }

    function formatTokenInOrder(
        address tokenA,
        address tokenB,
        uint256 tokenA_amount,
        uint256 tokenB_amount
    )
        internal
        pure
        returns (
            address newTokenA,
            address newTokenB,
            uint256 new_tokenA_amount,
            uint256 new_tokenB_amount
        )
    {
        if (tokenA < tokenB) {
            return (tokenA, tokenB, tokenA_amount, tokenB_amount);
        } else {
            return (tokenB, tokenA, tokenB_amount, tokenA_amount);
        }
    }

    function createAndInitializePool(
        address factoryContract,
        address tokenA,
        address tokenB,
        uint24 fee,
        uint160 sqrtx96
    ) internal returns (address pool) {
        if (tokenA == address(0) || tokenB == address(0))
            revert InvalidTokenAddressZero();

        // Create the pool
        pool = IUniswapV3Factory(factoryContract).createPool(
            tokenA,
            tokenB,
            fee
        );

        IUniswapV3Pool(pool).initialize(sqrtx96);
    }

    function addLiquidity(
        address positionManager,
        address tokenA,
        uint256 tokenA_amount,
        address tokenB,
        uint256 tokenB_amount,
        uint24 fee
    ) internal returns (uint256 mintId) {
        (tokenA, tokenB, tokenA_amount, tokenB_amount) = formatTokenInOrder(
            tokenA,
            tokenB,
            tokenA_amount,
            tokenB_amount
        );

        // Approve the position manager to spend WETH and presale tokens
        TransferHelper.safeApprove(
            tokenA,
            address(positionManager),
            tokenA_amount
        );
        TransferHelper.safeApprove(
            tokenB,
            address(positionManager),
            tokenB_amount
        );

        INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager
            .MintParams({
                token0: tokenA,
                token1: tokenB,
                fee: fee,
                tickLower: -887200,
                tickUpper: 887200,
                amount0Desired: tokenA_amount,
                amount1Desired: tokenB_amount,
                amount0Min: 0,
                amount1Min: 0,
                recipient: msg.sender, // Liquidity tokens are sent to the project manager
                deadline: block.timestamp + 100000 // Set a reasonable deadline
            });

        (uint256 id, , , ) = INonfungiblePositionManager(positionManager).mint(
            params
        );
        return id;
    }
}

interface INonfungiblePositionManager {
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    function mint(
        MintParams calldata params
    )
        external
        payable
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        );
}

interface IWETH {
    function deposit() external payable;
}
