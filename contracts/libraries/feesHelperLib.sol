// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

import {IPancakeV3Pool} from "../interfaces/pancakeswap/IPancakeV3Pool.sol";
import {IPancakeV3Factory} from "../interfaces/pancakeswap/IPancakeV3Factory.sol";
import {IPancakeV2Pair} from "../interfaces/pancakeswap/IPancakeV2Pair.sol";
import {IPancakeV2Factory} from "../interfaces/pancakeswap/IPancakeV2Factory.sol";

library PriceHelper {
  using UQ112x112 for uint224;

  enum TradeRoute {
    V2,
    V3
  }

  function quoteGasPriceInFeeAsset(
    address WETH,
    address quoteAsset,
    address v2Factory,
    address v3Factory,
    uint128 baseAmount
  ) internal view returns (uint256 amountOut) {
    if (block.chainid == 31337) return baseAmount;
    (TradeRoute route, address poolAddress) = getTradeRoute(WETH, quoteAsset, v2Factory, v3Factory);
    if (route == TradeRoute.V3) {
      return getV3Quote(poolAddress, baseAmount, true);
    } else if (route == TradeRoute.V2) {
      return getV2quote(poolAddress, false, baseAmount);
    }
  }

  function getTradeRoute(address _token0, address _token1, address _v2Factory, address _v3Factory) internal view returns (TradeRoute, address) {
    address v3Pool = IPancakeV3Factory(_v3Factory).getPool(_token0, _token1, 2500);
    address v2Pool = IPancakeV2Factory(_v2Factory).getPair(_token0, _token1);

    if (v3Pool != address(0)) {
      return (TradeRoute.V3, v3Pool);
    } else if (v2Pool != address(0)) {
      return (TradeRoute.V2, v2Pool);
    } else {
      revert("No pair found, Unable to estimate fees for trade");
    }
  }

  function getV2quote(address v2PairAddress, bool denominationTokenIs0, uint256 inputAmount) internal view returns (uint256 outputAmount) {
    (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast) = IPancakeV2Pair(v2PairAddress).getReserves();
    uint256 priceCumulativeLast = denominationTokenIs0
      ? IPancakeV2Pair(v2PairAddress).price1CumulativeLast()
      : IPancakeV2Pair(v2PairAddress).price0CumulativeLast();
    uint256 timeElapsed = block.timestamp - blockTimestampLast;
    priceCumulativeLast +=
      timeElapsed *
      uint256(UQ112x112.encode(denominationTokenIs0 ? reserve0 : reserve1).uqdiv(denominationTokenIs0 ? reserve1 : reserve0));

    uint256 amountInWithFee = inputAmount * 997;
    uint256 numerator = denominationTokenIs0 ? reserve1 : reserve0;
    uint256 denominator = denominationTokenIs0 ? reserve0 : reserve1;
    outputAmount = (amountInWithFee * numerator) / (denominator * 1000) + 1;
  }

  function getV3Quote(address pancakeV3Pool, uint128 baseAmount, bool inverse) internal view returns (uint256 quoteAmount) {
    (uint160 sqrtPriceX96, , , , , , ) = IPancakeV3Pool(pancakeV3Pool).slot0();
    if (sqrtPriceX96 <= type(uint128).max) {
      uint256 ratioX192 = uint256(sqrtPriceX96) * sqrtPriceX96;
      quoteAmount = !inverse ? mulDiv(ratioX192, baseAmount, 1 << 192) : mulDiv(1 << 192, baseAmount, ratioX192);
    } else {
      uint256 ratioX128 = mulDiv(sqrtPriceX96, sqrtPriceX96, 1 << 64);
      quoteAmount = !inverse ? mulDiv(ratioX128, baseAmount, 1 << 128) : mulDiv(1 << 128, baseAmount, ratioX128);
    }
  }

  function mulDiv(uint256 a, uint256 b, uint256 denominator) internal pure returns (uint256 result) {
    unchecked {
      uint256 prod0;
      uint256 prod1;
      assembly {
        let mm := mulmod(a, b, not(0))
        prod0 := mul(a, b)
        prod1 := sub(sub(mm, prod0), lt(mm, prod0))
      }
      if (prod1 == 0) {
        require(denominator > 0);
        assembly {
          result := div(prod0, denominator)
        }
        return result;
      }
      require(denominator > prod1);
      uint256 remainder;
      assembly {
        remainder := mulmod(a, b, denominator)
      }
      assembly {
        prod1 := sub(prod1, gt(remainder, prod0))
        prod0 := sub(prod0, remainder)
      }
      uint256 twos = (0 - denominator) & denominator;
      assembly {
        denominator := div(denominator, twos)
      }
      assembly {
        prod0 := div(prod0, twos)
      }
      assembly {
        twos := add(div(sub(0, twos), twos), 1)
      }
      prod0 |= prod1 * twos;
      uint256 inv = (3 * denominator) ^ 2;
      inv *= 2 - denominator * inv;
      inv *= 2 - denominator * inv;
      inv *= 2 - denominator * inv;
      inv *= 2 - denominator * inv;
      inv *= 2 - denominator * inv;
      inv *= 2 - denominator * inv;
      result = prod0 * inv;
      return result;
    }
  }
}

library UQ112x112 {
  uint224 constant Q112 = 2 ** 112;

  function encode(uint112 y) internal pure returns (uint224 z) {
    z = uint224(y) * Q112; // never overflows
  }

  function uqdiv(uint224 x, uint112 y) internal pure returns (uint224 z) {
    z = x / uint224(y);
  }
}
