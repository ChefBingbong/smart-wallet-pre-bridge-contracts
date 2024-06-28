//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;

interface IWallet {
     event LogReceivedEther(address indexed _from, uint256 _amount);

     event LogCall(address indexed _contract, uint256 _value, bytes _data);

     event Approval(
          address indexed owner,
          address indexed token,
          address indexed spender,
          uint160 amount,
          uint48 expiration
     );

     event Permit(
          address indexed owner,
          address indexed token,
          address indexed spender,
          uint160 amount,
          uint48 expiration,
          uint48 nonce
     );

     struct UserOp {
          address to;
          uint256 amount;
          bytes data;
     }

     struct AllowanceOpDetails {
          address token;
          uint160 amount;
          uint48 expiration;
          uint48 nonce;
     }

     struct AllowanceOp {
          AllowanceOpDetails[] details;
          address spender;
          uint256 sigDeadline;
     }

     struct PackedAllowance {
          uint160 amount;
          uint48 expiration;
          uint48 nonce;
     }

     receive() external payable;

     function nonce() external view returns (uint256);

     function owner() external view returns (address);

     function exec(UserOp[] calldata userOps, AllowanceOp calldata allowanceOp, bytes memory _signature) external;

     function execFomEoa(UserOp[] calldata userOps) external;

     function allowance(
          address user,
          address token,
          address spender
     ) external view returns (uint160 amount, uint48 expiration, uint48 nonce);

     function approve(address token, address spender, uint160 amount, uint48 expiration) external;

     function transferFrom(address from, address to, uint160 amount, address token) external;
}
