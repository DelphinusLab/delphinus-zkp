import { Field } from "delphinus-curves/src/field";
export enum AddressSpace {
  Balance = 0,
  Pool = 1,
  Share = 2,
  Meta = 3,
}

export enum MetaType {
  Account = 0,
  NFT = 1,
}

export function getSpaceIndex (space: AddressSpace) {
    return (space << 30)
}

export function toNumber(v: number | Field) {
  return v instanceof Field ? v.v.toNumber() : v;
}

export function getMetaAddress (index:number | Field, meta: MetaType) {
  return (AddressSpace.Meta << 30) | (toNumber(index) << 10) | (meta << 6)
}
