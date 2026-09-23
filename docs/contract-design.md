# Contract Design

## Purpose

The `PrivateNote` contract serves as an introductory demonstration of the Midnight Network's privacy-first capabilities for Level 1 — New Moon. It is a learning contract designed to show how a user can provide a private value to the network and explicitly choose to disclose it to the public ledger.

## Public Ledger State

The public state is represented by `publicNote`, an `Opaque<"string">` value.

- **What it represents:** Information that has been intentionally made public and stored directly on the Midnight blockchain.
- **Why it is public:** To demonstrate the end result of a controlled disclosure flow, where private data is selectively revealed.
- **What happens when data is stored there:** Any node or user observing the ledger can read this value transparently without requiring permission.

## Private Witness

The private witness is represented by the `privateNote()` callback function.

- **What it represents:** A function executed locally on the user's machine (off-chain) that supplies a secret string to the zero-knowledge circuit.
- **Why it is private:** The data is evaluated during proof generation in the user's local environment, meaning the original value is never broadcasted over the network or stored on the ledger unless explicitly disclosed.
- **How the contract receives the value:** During the circuit's execution, the proving environment invokes this witness callback to inject the private value into the circuit logic.

## disclose()

The `disclose()` function explicitly reveals private circuit data.

- **What disclose() is being used for:** In the `setPrivateNote()` circuit, `disclose()` takes the private string obtained from the witness and transforms it into public data.
- **Why we intentionally disclose this value:** To demonstrate that data on Midnight defaults to being private, and it requires a deliberate, explicit action (`disclose`) by the smart contract logic to declassify it.
- **What the privacy tradeoff is:** Once `disclose()` is called and the data is assigned to `publicNote`, the zero-knowledge properties for that specific data are waived, and the value becomes permanently visible on the public ledger.

## Data Flow

Private input
    ↓
Private witness (`privateNote()`)
    ↓
Circuit (`setPrivateNote()`)
    ↓
`disclose()`
    ↓
Public state (`publicNote`)

## Why This Matters

This contract illustrates the fundamental privacy model of the Midnight Network:
1. **Privacy by Default:** Data supplied by the user (via the witness) remains entirely off-chain and private.
2. **Selective Disclosure:** The smart contract logic explicitly defines when and what data can be moved from the private domain into the public domain using the `disclose()` operation.
3. **Trustless Execution:** The network cryptographically verifies the execution of the circuit using zero-knowledge proofs, guaranteeing the logic ran correctly without ever seeing the private inputs.
