import { verify } from "./utils/verify";

async function main() {
     await verify({
          name: "SmartWalletFactory",
          path: "contracts/SmartWalletFactory.sol:SmartWalletFactory",
     });
}

main()
     .then(() => process.exit(0))
     .catch((error) => {
          console.error(error);
          process.exit(1);
     });
export { verify };
