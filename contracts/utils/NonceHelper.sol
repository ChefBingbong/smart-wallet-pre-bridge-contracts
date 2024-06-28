// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

// import "../permit2/interfaces/ISignatureTransfer.sol";

// helper contract to calculate nonce for permit sigs
contract Permit2NonceFinder {
     // ISignatureTransfer public immutable permit2;
     // constructor(address _permit2) {
     //       permit2 = ISignatureTransfer(_permit2);
     // }
     // function nextNonce(address owner) external view returns (uint256 nonce) {
     //       nonce = _nextNonce(owner, 0, 0);
     // }
     // function nextNonceAfter(address owner, uint256 start) external view returns (uint256 nonce) {
     //       uint248 word = uint248(start >> 8);
     //       uint8 pos = uint8(start);
     //       if (pos == type(uint8).max) {
     //             // If the position is 255, we need to move to the next word
     //             word++;
     //             pos = 0;
     //       } else {
     //             // Otherwise, we just move to the next position
     //             pos++;
     //       }
     //       nonce = _nextNonce(owner, word, pos);
     // }
     // function _nextNonce(address owner, uint248 word, uint8 pos) internal view returns (uint256 nonce) {
     //       while (true) {
     //             uint256 bitmap = permit2.nonceBitmap(owner, word);
     //             if (bitmap == type(uint256).max) {
     //                   // If so, move to the next word
     //                   ++word;
     //                   pos = 0;
     //                   continue;
     //             }
     //             if (pos != 0) {
     //                   bitmap = bitmap >> pos;
     //             }
     //             // Find the first zero bit in the bitmap
     //             while (bitmap & 1 == 1) {
     //                   bitmap = bitmap >> 1;
     //                   ++pos;
     //             }
     //             return _nonceFromWordAndPos(word, pos);
     //       }
     // }
     // function _nonceFromWordAndPos(uint248 word, uint8 pos) internal pure returns (uint256 nonce) {
     //       // The last 248 bits of the word are the nonce bits
     //       nonce = uint256(word) << 8;
     //       // The first 8 bits of the word are the position inside the word
     //       nonce |= pos;
     // }
}
