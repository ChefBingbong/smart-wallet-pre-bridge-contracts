pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AMMSwap {
     address public owner;
     IERC20 public inputToken;
     IERC20 public outputToken;

     constructor(address _inputToken, address _outputToken) {
          inputToken = IERC20(_inputToken);
          outputToken = IERC20(_outputToken);
     }

     // Swap inputToken for outputToken and send to receiver
     function swap(uint256 amount, address receiver) external {
          // Transfer inputToken from owner to contract
          inputToken.transferFrom(msg.sender, address(this), amount);

          // Calculate output amount based on simple exchange rate (for demonstration)
          uint256 outputAmount = amount * 3; // Example: double the input amount

          // Transfer outputToken to receiver
          outputToken.transfer(receiver, outputAmount);
     }

     // Owner can withdraw any accidentally sent tokens
     function withdrawToken(address token, address to, uint256 amount) external {
          require(msg.sender == owner, "Only owner can withdraw");
          IERC20(token).transfer(to, amount);
     }
}
