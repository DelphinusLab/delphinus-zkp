import { Field } from "delphinus-curves/src/field";
import { MerkleTree, PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { AddressSpace, getSpaceIndex } from "./address/space";

export class L2Storage extends MerkleTree {
  constructor(isInMemory = false) {
    super(isInMemory);
  }
}
