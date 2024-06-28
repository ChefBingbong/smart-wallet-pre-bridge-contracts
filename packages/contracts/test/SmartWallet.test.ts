import { ethers } from "hardhat";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
// import { it } from "mocha";
// import { SmartWallet, SmartWalletFactory, ABC, XYZ } from "../../typechain-types";
import type {
     SmartWallet,
     SmartWalletFactory,
     ABC,
     XYZ,
     ECDSAWalletFactory,
     ECDSAWalletFactory__factory,
     SmartWalletFactory__factory,
     IWallet,
     ECDSAWallet,
} from "../typechain-types";
import { UserOp, sign } from "./utils/sign";

describe.skip("SmartWallet", () => {
     // Users
     let ALICE: SignerWithAddress;
     let BOB: SignerWithAddress;

     // Owner
     let OWNER: SignerWithAddress;

     // Forwarder
     let factory: ECDSAWalletFactory;
     let wallet: ECDSAWalletFactory;

     // Wallets
     let aliceWallet: ECDSAWallet;
     let bobWallet: ECDSAWallet;

     let abc: ABC;
     let xyz: XYZ;

     before(async () => {
          [OWNER, ALICE, BOB] = await ethers.getSigners();

          console.log("owner", OWNER.address);
          console.log("ALICE", ALICE.address);

          // deploy token
          const ABC = await ethers.getContractFactory("ABC");
          abc = (await ABC.deploy()) as ABC;
          await abc.deployed();

          // deploy XYZ
          const XYZ = await ethers.getContractFactory("XYZ");
          xyz = (await XYZ.deploy()) as XYZ;
          await xyz.deployed();

          // deploy Wallet implementation
          const Wallet = (await ethers.getContractFactory("SmartWalletFactory")) as SmartWalletFactory__factory;
          const wallet = await Wallet.connect(OWNER).deploy();
          await wallet.connect(OWNER).deployed();

          // await wallet.(OWNER.address);

          // deploy WalletFactory
          const WalletFactory = (await ethers.getContractFactory("ECDSAWalletFactory")) as ECDSAWalletFactory__factory;
          factory = await WalletFactory.connect(OWNER).deploy(wallet.address);
          await factory.connect(OWNER).deployed();

          console.log("FACTORY", wallet.address);
          console.log("ECDSAFACTORY", factory.address);
          console.log("ABC", abc.address);

          // Setup user accounts
          await abc.transfer(ALICE.address, "100000000000000000000");
          await xyz.transfer(ALICE.address, "1000000000000000000000000");
     });

     // ----- UPDATE PARNER -----
     it("User should be able to create a wallet for themselves.", async () => {
          const aliceWalletAddress = await factory.walletAddress(OWNER.address, 0);
          await factory.createWallet(OWNER.address);
          aliceWallet = (await ethers.getContractAt("ECDSAWallet", aliceWalletAddress)) as ECDSAWallet;
          expect(await aliceWallet.owner()).to.equal(OWNER.address);
     });

     // it("User should be able to create a wallet for someone else.", async () => {
     //       await factory.connect(ALICE).createWallet(BOB.address);
     //       const bobWalletAddress = await factory.walletAddress(BOB.address, 0);
     //       bobWallet = (await ethers.getContractAt(
     //             "ECDSAWallet",
     //             bobWalletAddress
     //       )) as ECDSAWallet;
     //       expect(await bobWallet.owner()).to.equal(BOB.address);
     // });

     it("User should be able to do any call through the wallet.", async () => {
          await abc.connect(ALICE).transfer(aliceWallet.address, "100000000");
          expect(await abc.balanceOf(aliceWallet.address)).to.equal("100000000");
          const tx = await abc.populateTransaction.transfer(ALICE.address, "100000000");
          await aliceWallet.connect(ALICE).call(abc.address, tx.data!);
          expect(await abc.balanceOf(aliceWallet.address)).to.equal("0");
     });

     // it("User should be able to send funds to the wallet before and after creation.", async () => {
     //       const aliceNewWalletAddr = await factory.wallet(ALICE.address, 1);
     //       await ALICE.sendTransaction({
     //             to: aliceNewWalletAddr,
     //             value: "100000000",
     //       });
     //       await abc.connect(ALICE).transfer(aliceNewWalletAddr, "100000000");
     //       expect(await abc.balanceOf(aliceNewWalletAddr)).to.equal("100000000");
     //       expect(await ethers.provider.getBalance(aliceNewWalletAddr)).to.equal(
     //             "100000000"
     //       );
     //       await factory.connect(ALICE).createWallet(ALICE.address);
     //       await ALICE.sendTransaction({
     //             to: aliceNewWalletAddr,
     //             value: "100000000",
     //       });
     //       await abc.connect(ALICE).transfer(aliceNewWalletAddr, "100000000");
     //       expect(await abc.balanceOf(aliceNewWalletAddr)).to.equal("200000000");
     //       expect(await ethers.provider.getBalance(aliceNewWalletAddr)).to.equal(
     //             "200000000"
     //       );

     //       const aliceNewWallet = (await ethers.getContractAt(
     //             "SmartWallet",
     //             aliceNewWalletAddr
     //       )) as SmartWallet;
     //       const tx = await abc.populateTransaction.transfer(
     //             ALICE.address,
     //             "200000000"
     //       );
     //       await aliceNewWallet.connect(ALICE).call(abc.address, tx.data!);
     //       await aliceNewWallet
     //             .connect(ALICE)
     //             .callWithValue(ALICE.address, "200000000", "0x");

     //       expect(await abc.balanceOf(aliceNewWalletAddr)).to.equal("0");
     //       expect(await ethers.provider.getBalance(aliceNewWalletAddr)).to.equal(
     //             "0"
     //       );
     // });
});
