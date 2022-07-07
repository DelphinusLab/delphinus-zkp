import { Field } from "delphinus-curves/src/field";
import BN from "bn.js";
import { calcAmount1ToPool } from "../src/circom/amount1ToPoolCalcHelper";

describe("test calcAmount1ToPool function", () => {
    test("test calcAmount1ToPool when liq0 is zero", async () => {
        jest.setTimeout(60000); //1 minute timeout

        const amount0 = new BN(500);
        const allowedAmount1 = new BN(1500);
        //liq0 is zero
        const liq0 = new BN(0);
        const liq1 = new BN(2000);
        const isSupply = true;
        const amount1ToPool = calcAmount1ToPool(amount0, allowedAmount1, liq0, liq1, isSupply);

        expect(amount1ToPool.toString()).toEqual("1500");
    });

    test("test calcAmount1ToPool when liq0 is not zero, isSupply is true and rem is zero", async () => {
        jest.setTimeout(60000); //1 minute timeout

        //amount0 * liq1 % liq0 == 0
        const amount0 = new BN(1000);
        const allowedAmount1 = new BN(1500);
        const liq0 = new BN(2000);
        const liq1 = new BN(3000);
        const isSupply = true;
        const amount1ToPool = calcAmount1ToPool(amount0, allowedAmount1, liq0, liq1, isSupply);

        expect(amount1ToPool.toString()).toEqual("1500");
    });

    test("test calcAmount1ToPool when liq0 is not zero, isSupply is true and rem is not zero", async () => {
        jest.setTimeout(60000); //1 minute timeout

        //amount0 * liq1 % liq0 == 1000
        const amount0 = new BN(1000);
        const allowedAmount1 = new BN(1600);
        const liq0 = new BN(2000);
        const liq1 = new BN(3041);
        const isSupply = true;
        const amount1ToPool = calcAmount1ToPool(amount0, allowedAmount1, liq0, liq1, isSupply);

        expect(amount1ToPool.toString()).toEqual("1521");
    });

    test("test calcAmount1ToPool when liq0 is not zero, isSupply is false", async () => {
        jest.setTimeout(60000); //1 minute timeout

        const amount0 = new BN(1000);
        const allowedAmount1 = new BN(1500);
        const liq0 = new BN(2000);
        const liq1 = new BN(3000);
        const isSupply = false;
        const amount1ToPool = calcAmount1ToPool(amount0, allowedAmount1, liq0, liq1, isSupply);

        expect(amount1ToPool.toString()).toEqual("1500");
    });
});
