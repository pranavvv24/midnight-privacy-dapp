/**
 * Test suite for contracts/private-note.compact
 *
 * These tests exercise the ACTUAL compiled contract artefacts under
 * contracts/managed/private-note/ using the @midnight-ntwrk/compact-runtime
 * simulator.  No Midnight node, proof-server, wallet, or network is required.
 *
 * Tested behaviours:
 *   A — Initial public ledger state is an empty string after construction
 *   B — setPrivateNote() discloses the private witness value into publicNote
 *   C — getNote() reads back the correct disclosed value
 *   D — A second setPrivateNote() call with a different witness replaces the value
 */

import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

// ── compact-runtime ─────────────────────────────────────────────────────────
import {
  createCircuitContext,
  createConstructorContext,
  emptyZswapLocalState,
  dummyContractAddress,
} from '@midnight-ntwrk/compact-runtime';

// ── Generated contract (compiled by the Compact toolchain) ──────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractPath = path.resolve(
  __dirname,
  '..',
  'contracts',
  'managed',
  'private-note',
  'contract',
  'index.js',
);
// pathToFileURL handles Windows drive-letter paths correctly
const { Contract, ledger } = await import(pathToFileURL(contractPath).href);

// ── Tiny test runner (no extra dependencies) ────────────────────────────────
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// ── Helper: build a fresh contract instance ─────────────────────────────────
/**
 * Creates a contract instance whose privateNote witness always returns `value`.
 * Returns the initial state objects produced by contract.initialState().
 */
function makeContractWithWitness(value) {
  const contract = new Contract({
    /**
     * privateNote witness — called inside setPrivateNote().
     * Signature: (WitnessContext<Ledger, PS>) => [PS, string]
     * We leave the private state unchanged (empty object) and supply a string.
     */
    privateNote: (ctx) => [ctx.currentPrivateState, value],
  });
  return contract;
}

function initialiseContract(contract) {
  const zswap = emptyZswapLocalState();
  const constructorCtx = createConstructorContext({}, zswap.coinPublicKey);
  return contract.initialState(constructorCtx);
}

/**
 * Build a CircuitContext from a contract state snapshot, ready for circuit calls.
 */
function makeCircuitCtx(contractState, privateState) {
  const zswap = emptyZswapLocalState();
  return createCircuitContext(
    dummyContractAddress(),
    zswap.coinPublicKey,
    contractState.data,
    privateState,
  );
}

// ── Test A — Initial ledger state ───────────────────────────────────────────
console.log('\nTest A — Initial public ledger state');
test('publicNote is empty string after construction', () => {
  const contract = makeContractWithWitness('Hello Midnight');
  const { currentContractState } = initialiseContract(contract);
  const l = ledger(currentContractState.data);
  assert.equal(l.publicNote, '', `Expected '' but got '${l.publicNote}'`);
});

// ── Test B — Private witness → disclose ─────────────────────────────────────
console.log('\nTest B — setPrivateNote() discloses the witness value');
test('setPrivateNote() updates publicNote via disclose()', () => {
  const WITNESS_VALUE = 'Hello Midnight';
  const contract = makeContractWithWitness(WITNESS_VALUE);
  const { currentContractState, currentPrivateState } = initialiseContract(contract);

  const ctx = makeCircuitCtx(currentContractState, currentPrivateState);
  const { context: updatedCtx } = contract.circuits.setPrivateNote(ctx);

  const updatedLedger = ledger(updatedCtx.currentQueryContext.state);
  assert.equal(
    updatedLedger.publicNote,
    WITNESS_VALUE,
    `Expected '${WITNESS_VALUE}' but got '${updatedLedger.publicNote}'`,
  );
});

// ── Test C — getNote() read circuit ──────────────────────────────────────────
console.log('\nTest C — getNote() returns the disclosed value');
test('getNote() returns the value that was set via setPrivateNote()', () => {
  const WITNESS_VALUE = 'Hello Midnight';
  const contract = makeContractWithWitness(WITNESS_VALUE);
  const { currentContractState, currentPrivateState } = initialiseContract(contract);

  // Step 1: call setPrivateNote
  const setCtx = makeCircuitCtx(currentContractState, currentPrivateState);
  const { context: afterSetCtx } = contract.circuits.setPrivateNote(setCtx);

  // Step 2: call getNote on the updated state
  const getCtx = createCircuitContext(
    dummyContractAddress(),
    emptyZswapLocalState().coinPublicKey,
    afterSetCtx.currentQueryContext.state.state,
    afterSetCtx.currentPrivateState,
  );
  const { result: noteValue } = contract.circuits.getNote(getCtx);

  assert.equal(
    noteValue,
    WITNESS_VALUE,
    `Expected '${WITNESS_VALUE}' but got '${noteValue}'`,
  );
});

// ── Test D — Second witness value replaces the first ─────────────────────────
console.log('\nTest D — A different private witness replaces publicNote');
test('setPrivateNote() with "Privacy First" updates publicNote correctly', () => {
  // First disclosure: 'Hello Midnight'
  const contract1 = makeContractWithWitness('Hello Midnight');
  const { currentContractState, currentPrivateState } = initialiseContract(contract1);

  const ctx1 = makeCircuitCtx(currentContractState, currentPrivateState);
  const { context: afterFirst } = contract1.circuits.setPrivateNote(ctx1);

  // Verify first disclosure
  const ledgerAfterFirst = ledger(afterFirst.currentQueryContext.state);
  assert.equal(ledgerAfterFirst.publicNote, 'Hello Midnight');

  // Second disclosure with a NEW witness value — re-use same state
  const contract2 = makeContractWithWitness('Privacy First');
  const ctx2 = createCircuitContext(
    dummyContractAddress(),
    emptyZswapLocalState().coinPublicKey,
    afterFirst.currentQueryContext.state.state,
    afterFirst.currentPrivateState,
  );
  const { context: afterSecond } = contract2.circuits.setPrivateNote(ctx2);

  const ledgerAfterSecond = ledger(afterSecond.currentQueryContext.state);
  assert.equal(
    ledgerAfterSecond.publicNote,
    'Privacy First',
    `Expected 'Privacy First' but got '${ledgerAfterSecond.publicNote}'`,
  );
});

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n────────────────────────────────────────');
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
console.log('All tests passed ✓');
