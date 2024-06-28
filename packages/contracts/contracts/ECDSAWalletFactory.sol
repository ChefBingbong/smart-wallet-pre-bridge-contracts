//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;

import "./ECDSAWallet.sol";
import "./SmartWalletFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract ECDSAWalletFactory is Ownable {
     SmartWalletFactory factory;
     ECDSAWallet wallet;

     constructor(SmartWalletFactory _factory) {
          wallet = new ECDSAWallet();
          wallet.__ECDSAWallet_init(address(0));

          factory = _factory;
     }

     function createWallet(address _owner) external payable returns (IWallet) {
          return
               factory.createWallet{value: msg.value}(
                    address(wallet),
                    abi.encodeWithSelector(ECDSAWallet.__ECDSAWallet_init.selector, _owner)
               );
     }

     function walletAddress(address _owner, uint256 _nonce) public view returns (address) {
          return
               factory.walletAddress(
                    address(wallet),
                    abi.encodeWithSelector(ECDSAWallet.__ECDSAWallet_init.selector, _owner),
                    _nonce
               );
     }
}
