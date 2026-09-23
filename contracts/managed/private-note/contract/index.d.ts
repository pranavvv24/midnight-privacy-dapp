import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  privateNote(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, string];
}

export type ImpureCircuits<PS> = {
  setPrivateNote(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  getNote(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, string>;
}

export type ProvableCircuits<PS> = {
  setPrivateNote(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  getNote(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, string>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  setPrivateNote(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  getNote(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, string>;
}

export type Ledger = {
  readonly publicNote: string;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
