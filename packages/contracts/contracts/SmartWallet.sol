//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./interfaces/IWallet.sol";
import "./libraries/feesHelperLib.sol";

// this contract is the base implementation of the Smart wallet as serves as
// a template that can be built upon in inheriting implementation contracts that can
// add therir own custom functionalities
abstract contract SmartWallet is UUPSUpgradeable, IWallet {
  receive() external payable {
    emit LogReceivedEther(msg.sender, msg.value);
  }

  function __SmartWallet_init() public initializer {
    __SmartWallet_init_unchained();
  }

  function __SmartWallet_init_unchained() internal onlyInitializing {
    if (address(this).balance > 0) {
      emit LogReceivedEther(msg.sender, address(this).balance);
    }
  }

  // virtual functions that are rquired to be implemented
  function _incrementNonce() internal virtual;

  function nonce() public view virtual returns (uint256);

  function owner() public view virtual returns (address);

  // really an optional param but required for users who may want
  // to calculate gasCost for sending fees atomically or for preforming other cleanup
  // utilities after an smart wallet call has finished
  function _walletExecCallback(uint256 execGasUse, AllowanceOp memory allowanceOp) internal virtual;

  // integrators can have flexibility do define their own
  // verify protocol, perhaps args should be dynamic too
  function _verify(UserOp[] memory userOps, AllowanceOp memory allowanceOp, bytes memory _signature) internal virtual;

  function exec(UserOp[] calldata userOps, AllowanceOp calldata allowanceOp, bytes calldata _signature) external {
    uint256 gasStart = gasleft();
    _verify(userOps, allowanceOp, _signature);
    _incrementNonce();

    for (uint32 i = 0; i < userOps.length; i++) {
      require(address(this).balance >= userOps[i].amount, "SmartWallet: insufficient base asset balance");
      _call(payable(userOps[i].to), userOps[i].amount, userOps[i].data);
    }

    _walletExecCallback(gasStart, allowanceOp);
  }

  // if user wants to execute themselves we dont need sig or verify
  function execFomEoa(UserOp[] calldata userOps) external {
    for (uint32 i = 0; i < userOps.length; i++) {
      require(address(this).balance >= userOps[i].amount, "SmartWallet: insufficient base asset balance");
      _call(payable(userOps[i].to), userOps[i].amount, userOps[i].data);
    }
  }

  function _call(address payable _contract, uint256 _value, bytes memory _data) internal {
    (bool ok, bytes memory resp) = _contract.call{value: _value}(_data);

    emit LogCall(_contract, _value, _data);
    if (!ok) {
      assembly {
        revert(add(resp, 32), mload(resp))
      }
    }
  }

  function _authorizeUpgrade(address) internal view override {
    require(msg.sender == address(this));
  }
}
