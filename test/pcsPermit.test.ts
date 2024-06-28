import { ethers } from "hardhat";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
// import { it } from "mocha";
// import { SmartWallet, SmartWalletFactory, ABC, XYZ } from "../../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  type SmartWallet,
  type SmartWalletFactory,
  type ABC,
  type XYZ,
  type ECDSAWalletFactory,
  type ECDSAWalletFactory__factory,
  type SmartWalletFactory__factory,
  type IWallet,
  type ECDSAWallet,
  type Permit2__factory,
  type Permit2,
  type AMMSwap,
  type AMMSwap__factory,
  SmartWallet__factory,
  ECDSAWallet__factory,
  PQR,
} from "../typechain-types";
import { sign } from "../utils/sign";
import { AllowanceOp, UserOp } from "../utils/types";
import {
  AllowanceTransfer,
  generatePermitTypedData,
  getPermit2Address,
  MaxAllowanceExpiration,
  MaxAllowanceTransferAmount,
  PERMIT_EXPIRATION,
  PERMIT_SIG_EXPIRATION,
  type PermitBatch,
  PermitBatchTransferFrom,
  SignatureTransfer,
  toDeadline,
  Witness,
} from "@pancakeswap/permit2-sdk";
import { constants } from "ethers";
import { PermitTransferFrom } from "@pancakeswap/permit2-sdk";
import { Console } from "console";
import { ERC20Token } from "@pancakeswap/sdk";
import { maxUint256, zeroAddress } from "viem";

describe("Permit2 Signature Transfer", () => {
  // const PERMIT2_ADDRESS = getPermit2Address(97);
  let OWNER: SignerWithAddress;
  let BOB: SignerWithAddress;

  // ALICE
  let ALICE: SignerWithAddress;

  // Forwarder
  let factory: ECDSAWalletFactory;
  let permit2: Permit2;

  // Wallets
  let OWNERWallet: ECDSAWallet;
  let bobWallet: ECDSAWallet;
  let amm: AMMSwap;

  let abc: ABC;
  let xyz: XYZ;
  let pqr: PQR;

  before(async () => {
    [OWNER, ALICE, BOB] = await ethers.getSigners();
    console.log(OWNER.address, ALICE.address, BOB.address);
    console.log(await ethers.provider.getNetwork());
    await deployERC20();
    const { abc, xyz, pqr } = await deployERC20();
    //     const Permit2 = (await ethers.getContractFactory("Permit2")) as Permit2__factory;
    //     permit2 = await Permit2.connect(OWNER).deploy();
    //     await permit2.deployed();

    const Wallet = (await ethers.getContractFactory(
      "SmartWalletFactory",
    )) as SmartWalletFactory__factory;

    const wallet = await Wallet.connect(OWNER).deploy(
      abc.address,
      xyz.address,
      pqr.address,
      [abc.address, xyz.address, pqr.address],
    );
    await wallet.deployed();

    const WalletFactory = (await ethers.getContractFactory(
      "ECDSAWalletFactory",
    )) as ECDSAWalletFactory__factory;

    factory = await WalletFactory.connect(OWNER).deploy(wallet.address);
    await factory.deployed();

    console.log("FACTORY", wallet.address);
    console.log("ECDSAFACTORY", factory.address);

    //     abc.connect(OWNER).transfer(xyz)
    //     AMMSwap
    const AMM = (await ethers.getContractFactory(
      "AMMSwap",
    )) as AMMSwap__factory;

    amm = await AMM.connect(OWNER).deploy(abc.address, xyz.address);
    await amm.deployed();
    abc.connect(OWNER).transfer(amm.address, "100000000000000000000");
    xyz.connect(OWNER).transfer(amm.address, "100000000000000000000");

    // Setup user accounts
    // await abc.transfer(OWNER.address, "100000000000000000000");
    // await xyz.transfer(OWNER.address, "1000000000000000000000000");
  });

  async function deployERC20() {
    const ABC = await ethers.getContractFactory("ABC");
    abc = (await ABC.deploy()) as ABC;
    await abc.deployed();

    const XYZ = await ethers.getContractFactory("XYZ");
    xyz = (await XYZ.deploy()) as ABC;
    await xyz.deployed();

    const PQR = await ethers.getContractFactory("PQR");
    pqr = (await PQR.deploy()) as ABC;
    await pqr.deployed();

    return { abc, xyz, pqr };
  }

  // ----- UPDATE PARNER -----
  it("User should be able to create a wallet for themselves.", async () => {
    await abc.transfer(ALICE.address, "100000000000000000000");
    await xyz.transfer(ALICE.address, "100000000000000000000");

    const alicewal = await factory.walletAddress(ALICE.address, 0);
    await factory
      .connect(ALICE)
      .createWallet(ALICE.address, { value: 15000000000 });

    OWNERWallet = (await ethers.getContractAt(
      "ECDSAWallet",
      alicewal,
    )) as ECDSAWallet;
    //     console.log(ALICEWallet);
    // expect(await ALICEWallet.OWNER()).to.equal(ALICE.address);
  });

  it("User should be able to deposit", async () => {
    await abc.connect(OWNER).burn("9999999000000000000000");

    const ownerwal = await factory.walletAddress(ALICE.address, 0);
    await abc.connect(ALICE).approve(ownerwal, MaxAllowanceTransferAmount); // approve max
    await xyz.connect(ALICE).approve(ownerwal, MaxAllowanceTransferAmount); // approve max

    //     await factory.connect(ALICE).createWallet(ALICE.address, { value: 15000000000 });

    //     const OWNERwallet = (await ethers.getContractAt("ECDSAWallet", ownerwal)) as ECDSAWallet;
    const amount = BigInt(1 * 10 ** 18);

    console.log(OWNERWallet, ownerwal);
    console.log(await xyz.balanceOf(ALICE.address));
    console.log(await abc.balanceOf(ALICE.address));

    console.log(await abc.balanceOf(OWNER.address));
    console.log(await xyz.balanceOf(OWNER.address));

    const reciever = ALICE.address;
    const transferWallet = await OWNERWallet.connect(
      OWNER,
    ).populateTransaction.transferFrom(
      ALICE.address,
      ownerwal,
      amount,
      abc.address,
    );
    const approveAMM = await abc
      .connect(OWNER)
      .populateTransaction.approve(amm.address, amount);
    const swapAmm = await amm
      .connect(OWNER)
      .populateTransaction.swap(amount, reciever);
    //     const transferWallet2 = await OWNERWallet.connect(OWNER).populateTransaction.transferFrom(
    //          ALICE.address,
    //          OWNER.address,
    //          amount + 100000000000000000n,
    //          abc.address,
    //     );
    const op = [
      {
        to: transferWallet.to,
        amount: 0n,
        data: transferWallet.data,
      },
      {
        to: approveAMM.to,
        amount: 0n,
        data: approveAMM.data,
      },
      {
        to: swapAmm.to,
        amount: 0n,
        data: swapAmm.data,
      },
      //    {
      //         to: transferWallet2.to,
      //         amount: 0n,
      //         data: transferWallet2.data,
      //    },
    ] as UserOp[];

    const alOp = {
      details: [
        {
          token: abc.address,
          amount: MaxAllowanceTransferAmount,
          expiration: BigInt(toDeadline(PERMIT_EXPIRATION).toString()),
          nonce: 0n,
        },
        {
          token: abc.address,
          amount: MaxAllowanceTransferAmount,
          expiration: BigInt(toDeadline(PERMIT_EXPIRATION).toString()),
          nonce: 1n,
        },
      ],
      spender: ownerwal,
      sigDeadline: BigInt(toDeadline(PERMIT_SIG_EXPIRATION)),
    } as AllowanceOp;

    const signeduop = await sign(op, alOp, 0n, ALICE, 31337, ownerwal);

    const exec = await OWNERWallet.connect(OWNER).populateTransaction.exec(
      signeduop.values.userOps,
      signeduop.values.allowanceOp,
      signeduop.signature,
    );
    const alicewal = await factory.walletAddress(ALICE.address, 0);

    const xx = await OWNER.sendTransaction(exec);
    const r = await xx.wait(1);
    //     console.log(r);

    console.log(await xyz.balanceOf(ALICE.address));
    console.log(await abc.balanceOf(ALICE.address));

    console.log(await abc.balanceOf(OWNER.address));
    console.log(await xyz.balanceOf(OWNER.address));
    //     console.log(
    //          await permit2
    //               .connect(ALICE)
    //               .approve(xyz.address, factory.address, MaxAllowanceTransferAmount, MaxAllowanceExpiration),
    //     );
    //     console.log(await OWNERWallet.(ALICE.address, abc.address, BOB.address));
    const x = await SmartWallet__factory.connect(alicewal, ALICE);
    console.log(
      await x.allowance(ALICE.address, abc.address, ownerwal),
      "hhhhh",
    );
    console.log(
      await x.allowance(ALICE.address, xyz.address, ownerwal),
      "hhhhh",
    );

    //     console.log(await abc.allowance(ALICE.address, OWNER.address));

    // await factory.connect(ALICE).withdrawERC20(abc.address, 500, OWNERwallet.address);
    console.log(await abc.balanceOf(alicewal));
    //     console.log(await factory.tokenBalancesByUser(alicewal, abc.address));

    // console.log(factory.signer);

    // expect(await vault.tokenBalancesByUser(user.address, abc.address), amount);
    // expect(await erc20.balanceOf(OWNER.address), 0);
    // expect(await erc20.balanceOf(vault.address), amount);
  });
});
