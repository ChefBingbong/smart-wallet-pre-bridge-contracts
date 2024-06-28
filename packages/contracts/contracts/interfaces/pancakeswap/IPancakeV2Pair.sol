// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

interface IPancakeV2Pair {
     function token0() external view returns (address);

     function token1() external view returns (address);

     function price0CumulativeLast() external view returns (uint256);

     function price1CumulativeLast() external view returns (uint256);

     function getReserves() external view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast);
}
