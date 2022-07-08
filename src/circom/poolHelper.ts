import { Field } from "delphinus-curves/src/field";
import BN from "bn.js";

export function calcAmount1ToPool(
    amount0: BN,
    liq0: BN,
    liq1: BN,
    isSupply: boolean
) {
    const quotient = amount0.mul(liq1).div(liq0);
    const rem = amount0.mul(liq1).mod(liq0);
    if(isSupply) {
        if(rem.eqn(0)){
            return new Field(quotient);
        } else {
            return new Field(quotient).add(new Field(1));
        }
    } else {
        return new Field(quotient);
    } 
}

export function isPoolEmpty(liq0: BN) {
    if(liq0.eqn(0)) {
        return true;
    } else {
        return false;
    }
}
