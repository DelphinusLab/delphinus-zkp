import { Field } from "delphinus-curves/src/field";
export enum AddressSpace {
  Balance = 0,
  Pool = 1,
  Share = 2,
  Account = 3,
}

export function getSpaceIndex (space: AddressSpace) {
    return (space << 30)
}

export function toNumber(v: number | Field) {
  return v instanceof Field ? v.v.toNumber() : v;
}
