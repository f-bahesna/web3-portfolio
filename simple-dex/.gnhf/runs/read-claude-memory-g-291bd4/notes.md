# gnhf run: read-claude-memory-g-291bd4

Objective: see .gnhf/runs/read-claude-memory-g-291bd4/prompt.md

## Iteration Log

### Iteration 2

**Summary:** Fixed a critical smart-contract bug in SimpleDEX.swapDogeToArbi (it multiplied by `rate` instead of dividing, wildly overpaying users and draining the DEX's arbiFake reserves) and added a full SimpleDEX.t.sol test suite (7 tests) covering both swap directions, insufficient-liquidity reverts, and owner-only functions.

**Changes:**
- Fixed smart_contracts/src/SimpleDEX.sol swapDogeToArbi: changed `arbiAmount = dogeAmount * rate` to `arbiAmount = dogeAmount / rate` so it correctly inverts swapArbiToDoge's `dogeAmount = arbiAmount * rate` (rate means '1 arbiFake = rate dogeFake'); previously every doge->arbi swap paid out rate^2 times too much arbiFake.
- Added smart_contracts/test/SimpleDEX.t.sol with 7 tests: swapArbiToDoge, swapDogeToArbi, a round-trip inverse-consistency test that would have failed against the old buggy code, insufficient-liquidity reverts for both swap directions, and onlyOwner checks for setRate/withdraw.
- Verified full test suite (13 tests across 3 files) passes and `forge build` succeeds.

**Learnings:**
- smart_contracts/ has no lib/ dependencies committed and no working .gitmodules at the repo root, even though CI (test.yml) does `checkout --recursive` expecting submodules; foundry.lock is a soldeer lock file but foundry.toml has no [dependencies] section so `forge soldeer install` fails with 'not connected'. Workaround: `forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts@v5.4.0` from smart_contracts/ works (clones via git) but stages lib/ as git submodules and creates a stray .gitmodules one directory ABOVE simple-dex (at .../web3/.gitmodules) since simple-dex itself isn't the git repo root - must `rm -rf smart_contracts/lib` and remove that outer .gitmodules after testing, or it pollutes the diff.
- The frontend (client/src/App.jsx) never calls swapDogeToArbi at all currently - selecting the DFAKE pair shows 'The pair still in maintenance' - so this bug was invisible in the UI but present in the deployed/deployable contract surface.
- `forge fmt --check` already fails repo-wide on pre-existing files (comment indentation, missing trailing newlines) unrelated to this change - worth a dedicated readability/formatting cleanup iteration later, but out of scope for this bug-fix iteration.
- No SimpleDEX test coverage existed before this iteration; only faucet tests existed for the two ERC20 tokens.

### Iteration 3

**Summary:** Enabled the previously-blocked DogeFake->ArbiFake swap direction in the DEX frontend and fixed the buying-amount preview to use the correct rate math for each swap direction.

**Changes:**
- Removed the 'The pair still in maintenance' block in client/src/App.jsx that hard-blocked selling DFAKE (dogeFake); replaced the AFAKE-only swapArbiToDoge handler with a direction-aware handleSwap that approves the correct sell token (arbiFake or dogeFake) and calls the matching contract method (swapArbiToDoge or swapDogeToArbi) based on the selected token
- Fixed the 'Buying' amount preview which always computed amount * rate regardless of swap direction (correct only for AFAKE->DFAKE); added a buyAmount value that multiplies by rate when selling AFAKE and divides by rate when selling DFAKE, matching the on-chain swap math fixed in iteration 2

**Learnings:**
- The frontend's DFAKE->AFAKE swap path was fully blocked by a hardcoded alert('The pair still in maintenance') in App.jsx, independent of the smart-contract rate bug fixed in iteration 2 -- the contract-level fix alone did not surface in the UI until this iteration wired up the second swap direction.
- client/ has no node_modules committed; `npm install` pulls 323 packages (node_modules and dist are gitignored so this doesn't pollute git status). `npm run lint` and `npm run build` both work after install. Pre-existing eslint errors (unused 'status'/'error' vars in App.jsx, conditional hooks in ModalAddToken.jsx/ModalFaucet.jsx, unused imports in Navbar.jsx/ModalSelectToken.jsx/web3config.js/vite.config.js) exist independent of this change -- verified via git stash comparison -- and are candidates for a future dedicated lint-cleanup iteration.
- Vite build succeeds with a single JS chunk warning (664 kB / 203 kB gzip) -- not addressed here since it's a pre-existing bundling characteristic unrelated to this feature.

### Iteration 4

**Summary:** Fixed all 10 pre-existing ESLint errors in client/ (including two real conditional-hooks bugs and a hardcoded 'Buying' preview display bug), and wired the unused swap-status state into the UI, with lint and build both passing cleanly afterward.

**Changes:**
- Fixed React Rules-of-Hooks violations in ModalAddToken.jsx and ModalFaucet.jsx where useState was called after an early `if (!isVisible) return null` return, which could cause React to throw/misbehave when isVisible toggles across renders
- Fixed a UI bug in App.jsx where the 'Buying' summary row always showed a hardcoded '0.0001' instead of the actual computed buyAmount for the selected swap direction
- Wired the previously-unused `status` state in App.jsx into the UI so swap progress messages (Approving/Swapping/failed/completed) are now visible to the user instead of being silently discarded
- Removed dead/unused code: unused `nav`/`handleNav`/`useEffect` in Navbar.jsx (leftover from an unwired mobile-nav feature), unused `useState` import and commented-out line in ModalSelectToken.jsx, unused `path` import in vite.config.js, unused `tx` assignment in web3config.js
- Added console.error(error) logging in App.jsx's two catch blocks (approve/swap failures) instead of silently swallowing the error, fixing the last two no-unused-vars lint errors
- client/ now passes `npm run lint` with zero errors (previously 10 errors across 7 files) and `npm run build` still succeeds

**Learnings:**
- The two react-hooks/rules-of-hooks lint errors flagged in iteration 3's notes were not just lint noise - ModalAddToken and ModalFaucet had a genuine conditional-hook bug (useState called after an early return), which is a real correctness issue since React's hook order must be identical every render for the same component instance
- App.jsx's 'Buying' preview had two separate amount displays: the disabled input (already fixed to use buyAmount in iteration 3) and a summary row above it that was still hardcoded to '0.0001' - the iteration 3 fix was incomplete and this iteration closed that gap
- Navbar.jsx's `nav`/`setNav`/`handleNav` were dead code for a mobile hamburger menu that was never actually wired to any button or conditional render (navItems list is always `hidden sm:flex`) - safe to delete with zero functional change
- client/node_modules was already installed from a prior iteration's `npm install`, so lint/build could run directly without a fresh install this time

### Iteration 5

**Summary:** Fixed a real fund-loss bug in SimpleDEX.swapDogeToArbi where integer-division truncation let users be charged dogeFake while receiving zero arbiFake, added a regression test, and simplified SimpleDEX.sol by removing redundant line-by-line comments.

**Changes:**
- Fixed a real fund-loss bug in SimpleDEX.swapDogeToArbi: integer division (dogeAmount / rate) truncates to zero when dogeAmount < rate, but the function still pulled the full dogeAmount from the user via transferFrom while paying out zero arbiFake. Added require(arbiAmount > 0, "Amount too small to swap") to revert these no-value swaps instead of silently taking user funds.
- Fixed a typo in the insufficient-liquidity revert message ('Not enought arbiFake in DEX' -> 'Not enough arbiFake in DEX') and updated the corresponding test expectation.
- Stripped the line-by-line restating comments from SimpleDEX.sol (every single line had a comment repeating what the code already said) per the project's readability guidance that comments should only explain non-obvious 'why', not restate 'what'. File went from 92 to ~55 lines with identical behavior.
- Added testSwapDogeToArbiRevertsWhenAmountTruncatesToZero to smart_contracts/test/SimpleDEX.t.sol proving a dogeAmount below `rate` now reverts instead of silently zeroing out the payout.

**Learnings:**
- The swapDogeToArbi truncation bug was a real, previously-untested edge case: with RATE=5, swapping dogeAmount in [1,4] wei succeeded, took the full dogeAmount from the user, and paid out 0 arbiFake -- a genuine (if small) fund-loss bug that the iteration-2 test suite didn't cover despite testing both swap directions and revert paths.
- Confirmed the lib/ install + cleanup workflow from iteration 2's notes still applies exactly as documented: `forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts@v5.4.0` from smart_contracts/ is needed to run `forge build`/`forge test` (no deps are committed), and afterward `rm -rf smart_contracts/lib` plus removing the stray `.gitmodules` one directory above the repo (at .../web3/.gitmodules, since simple-dex isn't the git root) and `git restore --staged`/`git restore` on foundry.lock is required to keep the diff clean.
- forge build/forge test both emit pre-existing erc20-unchecked-transfer and mixed-case-variable lint warnings (unrelated to this change, from test setup helpers and an unrelated script) -- these are warnings only, not build failures, and were not touched in this iteration to keep scope minimal.

### Iteration 6

**Summary:** Fixed a fund-loss bug in SimpleDEX where setting rate to 0 (via constructor or setRate) would let swapArbiToDoge take a user's arbiFake while paying out 0 dogeFake, and added regression tests.

**Changes:**
- Added require(_rate > 0, "Rate must be positive") to SimpleDEX's constructor, preventing deployment with a zero rate.
- Added the same require check to setRate, preventing the owner from ever setting rate to 0.
- Documented via inline comment why a zero rate was dangerous specifically for swapArbiToDoge (arbiAmount * 0 = 0 passes the dogeFake balance check and silently takes the user's arbiFake for nothing), while swapDogeToArbi was already implicitly protected since division by zero reverts on its own in Solidity 0.8.
- Added testSetRateRevertsWhenZero and testConstructorRevertsWhenRateIsZero regression tests to smart_contracts/test/SimpleDEX.t.sol.
- Verified full suite (16 tests across 3 files) passes and forge build succeeds; cleaned up the temporary lib/ install and stray outer .gitmodules per the documented workaround so the git diff stays limited to source/test changes.

**Learnings:**
- swapArbiToDoge and swapDogeToArbi were asymmetrically protected against a zero rate: division by zero always reverts in Solidity 0.8+, so swapDogeToArbi (dogeAmount / rate) was already safe, but multiplication by zero does not revert, so swapArbiToDoge (arbiAmount * rate) would silently pass a rate=0 state and take the user's arbiFake for a 0 dogeFake payout -- an owner-triggered but real fund-loss path that no prior iteration's test suite covered.
- The lib/ install + cleanup workflow documented in iterations 2 and 5 continues to work exactly as described: forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts@v5.4.0 from smart_contracts/, then after testing rm -rf smart_contracts/lib, rm the stray .gitmodules one directory above simple-dex, and git restore --staged/git restore on foundry.lock to keep the diff clean.

### Iteration 7

**Summary:** Fixed an unchecked ERC20 transfer return value in SimpleDEX.withdraw() that could silently mislead the owner about a failed withdrawal, with a regression test proving the fix using a mock token that returns false instead of reverting.

**Changes:**
- Fixed SimpleDEX.withdraw() in smart_contracts/src/SimpleDEX.sol to check the ERC20 transfer() return value with require(...), instead of silently ignoring it, preventing the owner from being misled into thinking a failed withdrawal succeeded (relevant for non-standard/broken ERC20 tokens that return false instead of reverting on failure).
- Added a NonRevertingFailToken mock and testWithdrawRevertsWhenTransferReturnsFalse regression test to smart_contracts/test/SimpleDEX.t.sol proving withdraw() now reverts with 'Withdraw transfer failed' when the underlying transfer signals failure via a false return value.

**Learnings:**
- forge build's erc20-unchecked-transfer lint warning (previously noted in iteration 5 as a pre-existing warning, out of scope at the time) pointed to a real, fixable bug at SimpleDEX.sol:62 (withdraw's unchecked IERC20.transfer call) -- the other 4 instances of that same warning are in the test file's setUp() helper using the project's own well-behaved ArbiFake/DogeFake tokens (which revert on failure via OZ ERC20), so those are lower-value to fix and were left alone to keep this iteration scoped to the one real source-contract bug.
- Full lib/ install + cleanup workflow (documented in iterations 2, 5, 6) continues to work unchanged: forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts@v5.4.0 from smart_contracts/, then after testing rm -rf smart_contracts/lib, rm the stray .gitmodules one directory above simple-dex (git restore --staged failed with 'pathspec did not match' after the rm -- deleting the file directly and confirming via git status was sufficient since git status already reported it as AD/deleted), and git restore smart_contracts/foundry.lock to drop the incidental forge-std version bump it recorded.
- The run objective asks for branch names like feat/reduce-complexity or fix/reduce-complexity, but this run operates on a single orchestrator-managed branch (gnhf/read-claude-memory-g-291bd4) with commits handled automatically after each iteration -- there is no tooling available in this iteration to create/switch branches, so that part of the objective is likely meant for the orchestrator's commit/branch-naming step rather than something an individual iteration should do itself.

### Iteration 8

**Summary:** Fixed a frontend bug where user token balances were never refreshed after a swap completed, and removed redundant duplicate cleanup code in the swap error path.

**Changes:**
- Extracted a reusable refreshBalances(web3, contracts, account) helper in client/src/App.jsx from the balance-fetching logic previously inlined only in loadAccount
- Fixed a real UI staleness bug: handleSwap now calls refreshBalances() after a successful on-chain swap, so the displayed 'Selling'/'Max' balance reflects the user's actual post-swap holdings instead of the pre-swap snapshot (previously balances only updated on reconnect/account-change)
- Removed duplicated resetStatus()/setLoading(false)/setAmount(0) calls that were present both inside the swap-failure catch block and again immediately after it in handleSwap

**Learnings:**
- App.jsx's loadAccount() fetched balances on connect/account-change but handleSwap() never re-fetched them after a swap transaction succeeded, so the UI silently showed stale balances post-swap - a real data-integrity bug that could lead a user to click 'Max' and attempt to swap more than they now actually hold, risking a failed follow-up transaction.
- handleSwap's swap-failure catch block duplicated the exact resetStatus/setLoading/setAmount cleanup that ran unconditionally right after the try/catch, meaning on swap failure those three calls fired twice - harmless (resetStatus just restarts a 5s timer) but unnecessary complexity now removed.
- npm run lint has one pre-existing warning (react-hooks/exhaustive-deps on the useEffect missing 'loadAccount') unrelated to this change; lint (0 errors) and vite build both pass cleanly after this fix.

### Iteration 9

**Summary:** Fixed a MetaMask accountsChanged listener leak in App.jsx caused by a useEffect keyed on the wrong dependency, which also eliminated the last remaining ESLint warning in the client.

**Changes:**
- Fixed a MetaMask 'accountsChanged' event-listener leak in client/src/App.jsx: the useEffect that registers the listener and calls loadAccount() was keyed on `[selectedToken]` instead of running once on mount, so every time the user switched the sell/buy token in the modal, a brand-new listener was attached (never removed) and loadAccount() re-fired an extra, redundant balance/rate fetch.
- Wrapped refreshBalances and loadAccount in useCallback (with correct dependencies) and changed the useEffect to depend on `[loadAccount]` with a cleanup function that calls window.ethereum.removeListener('accountsChanged', loadAccount), so exactly one listener exists at a time and it's properly torn down.
- This also resolves the pre-existing react-hooks/exhaustive-deps warning noted in iteration 8's notes (previously the only lint warning in the project) — npm run lint now reports zero errors and zero warnings, and npm run build still succeeds.

**Learnings:**
- The App.jsx mount-time useEffect that wires up wallet auto-reconnect had `[selectedToken]` as its dependency array for no functional reason (loadAccount doesn't use selectedToken at all) — this meant every token switch in the UI silently accumulated another 'accountsChanged' listener on window.ethereum and re-ran the initial connect/balance-fetch flow, a real (if subtle) memory-leak and redundant-RPC-call bug that had been present since before iteration 3 introduced token switching, but was masked because the extra listeners only visibly compound after several token switches followed by an actual account change in MetaMask.
- Fixing the dependency array properly (rather than just changing it to `[]`) required useCallback-wrapping loadAccount and refreshBalances so the effect could legitimately depend on a stable loadAccount reference — this also happened to fully resolve the exhaustive-deps warning flagged as a known pre-existing issue in iteration 8's notes, so the project's client/ now lints with zero errors AND zero warnings for the first time in this run's history.

### Iteration 10

**Summary:** Removed dead `claimed` mapping state from both faucet token contracts and replaced a private web3.js internal field access (`_address`) with the public `options.address` API in the frontend swap flow, verified via full forge test suite (17 passing) and clean npm lint/build.

**Changes:**
- Removed the write-only, never-read `claimed` mapping from both ArbiFake.sol and DogeFake.sol faucet contracts — it was set on every faucet() call but never queried anywhere (not in the contracts, tests, or frontend), so it was pure dead state costing an extra SSTORE per claim with zero functional benefit; faucet cooldown logic already relies entirely on `lastClaim`.
- Replaced `contracts.dex._address` with `contracts.dex.options.address` in client/src/App.jsx's swap approval call — `_address` is web3.js v4's internal/private contract field (only accessible because JS doesn't enforce the underscore convention), while `.options.address` is the documented public API for the same value.

**Learnings:**
- ArbiFake.sol and DogeFake.sol both had an unused `mapping(address => bool) public claimed` that was written in faucet() but never read by any contract, test, or frontend code — a straightforward dead-code removal that reduces gas cost and storage footprint with zero behavior change, verified via grep across .sol/.jsx/.js files repo-wide before removing.
- client/src/App.jsx used `contracts.dex._address` (a web3.js v4 internal field, confirmed by inspecting node_modules/web3-eth-contract/lib/commonjs/contract.js) instead of the public `contracts.dex.options.address` getter that wraps the same underlying `_address` value — functionally identical today but relies on an undocumented internal property that could break on a web3.js internals change; switched to the public API for robustness/readability.
- After 9 prior iterations focused on fund-loss bugs and frontend staleness/lint issues, the remaining low-risk, verifiable improvements in this codebase are smaller readability/dead-code items rather than new bugs — the SimpleDEX.sol contract and App.jsx swap flow appear to have no further correctness issues on inspection this iteration.

### Iteration 11

**Summary:** Fixed a stuck 'Processing...' UI bug in ModalAddToken.jsx where rejecting the MetaMask add-token prompt left the loading state permanently set, by moving the reset into a finally block.

**Changes:**
- Fixed a stuck-loading UI bug in client/src/components/ModalAddToken.jsx: `wallet_watchAsset` resolves to `false` (not a thrown error) when the user rejects the 'Add token to MetaMask' prompt, so the old code's `if (added) { ...; setLoading(null); }` never reset the loading state on rejection, permanently freezing that token's button on 'Processing...' (state persists across the isVisible early-return since the component stays mounted). Moved `setLoading(null)` into a `finally` block so it always resets regardless of approval, rejection, or error.

**Learnings:**
- ModalAddToken.jsx's addTokenToWallet had the same class of stuck-loading bug as prior iterations' UI fixes, but triggered by a resolved-false value rather than a thrown exception: MetaMask's wallet_watchAsset resolves `false` on user rejection instead of throwing, so a try/catch alone doesn't cover the reset path -- only a finally (or resetting outside the if) does.
- ModalFaucet.jsx's analogous addTokenFaucetToWallet does NOT have this bug: getFaucet() in web3config.js already wraps its logic in its own internal try/catch and never rethrows, so ModalFaucet's outer `setLoading(null)` after the await always runs regardless of faucet success/failure/rejection.
- Reviewed SimpleDEX.sol, ArbiFake.sol, App.jsx, and all Modal*.jsx components this iteration; no further correctness bugs found on inspection beyond this one -- remaining candidates for future iterations are likely readability/structure (e.g. vite's 665kB single-chunk bundle warning, or extracting the swap-flow into smaller hooks) rather than new functional bugs.

### Iteration 12

**Summary:** Removed a stray unconditional initWeb3() call at App.jsx module scope that silently triggered an unwanted MetaMask connection popup on every page load (even for first-time visitors) while its result was completely discarded.

**Changes:**
- Removed an unconditional `initWeb3();` call at module load time in client/src/App.jsx that fired `eth_requestAccounts` (a MetaMask wallet-connection popup) on every single page visit, regardless of whether the user clicked 'Connect Metamask' or had a previously stored account, and whose returned web3/accounts/contracts were discarded and never used anywhere.

**Learnings:**
- App.jsx called `initWeb3()` twice on a fresh page load with a stored account: once unconditionally at module scope (line 9, result discarded) and once inside loadAccount() via the mount useEffect (result actually used) -- the first call served no functional purpose but still triggered a real MetaMask eth_requestAccounts prompt immediately on page load for every visitor, even first-time visitors with no localStorage account, before they ever clicked 'Connect Metamask'.
- Confirmed via `git log -p --follow` that this stray top-level `initWeb3();` call has existed since the very first commit of App.jsx, so it was an original design artifact (likely a leftover initialization attempt) rather than something introduced by a prior iteration.
- Confirmed via grep that web3config.js's module-scoped `web3`/`accounts`/`contracts` variables (mutated inside initWeb3) are never read anywhere else in the codebase, so the discarded top-level call had zero functional dependents and was safe to delete outright.
- npm run lint (0 errors/warnings) and npm run build (vite build succeeds, same pre-existing 665kB single-chunk warning noted in earlier iterations) both pass after the removal, confirming no regression.

### Iteration 13

**Summary:** Fixed a crash bug where clicking "Connect Metamask" without MetaMask installed threw an uncaught TypeError from destructuring undefined, instead of just showing the install alert.

**Changes:**
- Made client/src/utils/web3config.js's initWeb3() explicitly return null when window.ethereum is missing, instead of implicitly returning undefined after alerting.
- Guarded client/src/App.jsx's loadAccount() to check the initWeb3() result before destructuring it, returning early (without ever setting loading=true) when MetaMask isn't installed, instead of crashing with an uncaught TypeError.

**Learnings:**
- initWeb3()'s no-MetaMask branch only ever alerted and fell off the end of the function (implicit undefined return); every caller destructured its result unconditionally, so this path was a latent crash bug from the start, only reachable via the manual 'Connect Metamask' button since the auto-reconnect useEffect already separately guards on window.ethereum before calling loadAccount.
- Returning early before setLoading(true) in loadAccount is strictly better than the alternative of setting loading then resetting it, since it avoids ever showing a 'Connecting...' state that would never resolve.
- npm run lint and npm run build both remain clean (0 errors/warnings) after this fix, consistent with iterations 9-12's established baseline.

### Iteration 14

**Summary:** Fixed a misleading error-message bug in the faucet flow where every failure (including a plain MetaMask rejection or network error) was reported to the user as 'you already claimed tokens', regardless of the actual cause.

**Changes:**
- Fixed misleading faucet error handling in client/src/utils/web3config.js: getFaucet() previously showed the same hardcoded 'faucet failed: you already claimed tokens' alert for every possible error (user rejecting the MetaMask prompt, network failures, or any other revert reason), even when the user had never claimed before. Now it distinguishes user-rejected transactions (error.code === 4001), the actual on-chain cooldown revert ('Claim once per day'), and a generic fallback for any other failure.
- Replaced console.log(error) with console.error(error) in the same catch block for correct log-level semantics.

**Learnings:**
- ModalFaucet.jsx's getFaucet() catch block in web3config.js unconditionally alerted 'you already claimed tokens' regardless of the real error cause, confirmed by cross-referencing ArbiFake.sol's actual revert string ('Claim once per day') - a user who simply rejected the MetaMask signature prompt, or hit a network/gas error, would be told a false reason (already claimed) instead of the true one, which is misleading UX debugging-wise.
- No frontend test framework exists in client/ (only eslint + vite build, confirmed via package.json scripts) - verification for frontend changes in this run is limited to `npm run lint` and `npm run build`, both of which remain clean (0 errors/warnings) after this fix.
- After 13 iterations covering the major SimpleDEX/ArbiFake/DogeFake contract fund-loss bugs and App.jsx's core swap/connect flow bugs, remaining issues are smaller UX/error-message correctness bugs in secondary flows (faucet, add-token) rather than new critical bugs - worth checking ModalSelectToken.jsx and ModalAddToken.jsx's error paths next if continuing this thread.

### Iteration 15

**Summary:** Fixed a misleading error-message bug in the DEX swap flow where every approve/swap failure (including a plain MetaMask rejection or insufficient-liquidity revert) was shown to the user as a generic 'Transaction reverted' message.

**Changes:**
- Fixed a misleading error-message bug in client/src/App.jsx's handleSwap: the approve and swap catch blocks previously showed the same hardcoded 'Transaction reverted' alert for every failure, even a plain user rejection in MetaMask or an on-chain liquidity/amount-too-small revert.
- Added a describeSwapError(error, action) helper that distinguishes user-rejected transactions (error.code === 4001), insufficient-DEX-liquidity reverts ('Not enough ... in DEX'), and amount-too-small-to-swap reverts, falling back to a generic 'transaction reverted' message only for unrecognized errors.

**Learnings:**
- App.jsx's handleSwap had the exact same class of misleading-error-message bug that iteration 14 fixed in the faucet flow (web3config.js's getFaucet), just in the swap approve/swap catch blocks instead -- confirming the iteration 14 note's prediction that other flows likely had the same issue.
- The fix reuses the exact pattern already established in getFaucet (check error.code === 4001 for user rejection, then check error.message for known contract revert strings, then fall back to generic), keeping the codebase's error-handling style consistent across faucet and swap flows.
- npm run lint (0 errors/warnings) and npm run build both remain clean after this change, consistent with the zero-lint-issue baseline established since iteration 9.

### Iteration 16

**Summary:** Replaced a fragile `absolute top-[-400px] inset-0` CSS hack in ModalWrapper.jsx (used by the Faucet and Add Token modals) with a standard `fixed inset-0 z-50` overlay, and fixed a stray console.log→console.error inconsistency in ModalAddToken's error handler.

**Changes:**
- client/src/components/ModalWrapper.jsx: replaced the magic-number `absolute top-[-400px] inset-0` positioning (which only 'coincidentally' centered the modal for typical viewport heights because it fights inset-0's top with a hardcoded -400px override, and is anchored to the document rather than the viewport since no ancestor establishes a positioned containing block) with the standard, self-explanatory `fixed inset-0 z-50` full-viewport overlay pattern used for modals, verified visually via a static HTML repro built from the compiled Tailwind CSS and headless Chrome screenshots (before/after) showing correct centering
- client/src/components/ModalAddToken.jsx: changed console.log(error) to console.error(error) in the wallet_watchAsset catch block, matching the console.error convention already used everywhere else in the codebase for actual error logging

**Learnings:**
- ModalWrapper.jsx's `absolute top-[-400px] inset-0` was not an invisible/broken bug in practice (screenshots confirmed the modal was still visible and roughly centered) because Navbar is never sticky/fixed and always sits at the very top of the page, so the modal can only ever be opened while scrolled to the top -- but it was still a fragile magic-number hack: `top-[-400px]` beats `inset-0`'s top because Tailwind's compiled CSS puts `.top-\[-400px\]` after `.inset-0` in the stylesheet, and the visual centering it happened to produce depended on the coincidence of typical viewport heights rather than being guaranteed. `fixed inset-0` is the standard, readable, viewport-robust way to express 'full-screen centered overlay' and has no such coincidental dependency.
- Verifying frontend visual/CSS bugs in this repo doesn't require a full local anvil chain + .env + wallet mock -- building `npm run build` and rendering the compiled dist CSS classes against a hand-written static HTML fragment (matching the exact JSX markup/classes) in headless Chrome (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless --disable-gpu --screenshot=... --window-size=...`) is a fast, reliable way to screenshot-verify isolated component styling without touching wallet/env setup.
- After 15 iterations, the SimpleDEX contracts, App.jsx swap/connect/faucet flows, and lint/build hygiene are all clean on inspection -- the remaining low-risk improvements in this codebase are small readability/robustness cleanups in secondary UI chrome (like this ModalWrapper CSS hack) rather than new functional bugs; worth scanning remaining CSS/Tailwind class combinations for similar magic-number hacks in a future iteration if continuing this thread.

### Iteration 17

**Summary:** Fixed a floating-point precision display bug in the DEX swap 'Buying' amount preview, which previously showed ugly long decimals (e.g. 0.8999999999999999) instead of clean rounded values (0.9) for common amount/rate combinations.

**Changes:**
- Fixed a floating-point display bug in client/src/App.jsx where the 'Buying' amount preview (both the summary row and the disabled input) showed raw JS floating-point arithmetic results (e.g. 0.8999999999999999 instead of 0.9 for 0.3 AFAKE at rate 3), by adding a formattedBuyAmount helper that rounds to 6 decimals and strips trailing zeros before rendering.

**Learnings:**
- buyAmount in App.jsx is purely a display preview (Number(amount) * or / Number(rate)) - it does not affect the actual on-chain swap amount, which is computed separately via web3.utils.toWei(amount, 'ether') from the raw amount string, so fixing its formatting is a pure UX/readability improvement with zero risk to swap correctness.
- Common rate/amount combinations (e.g. 0.3 * 3, 0.1 * 5 in some cases) trigger classic binary floating-point representation noise in JS, producing ugly long-decimal previews like 0.8999999999999999 - confirmed via node -e reproduction before fixing, per the project's 'reproduce first' guidance.
- After 16 prior iterations, SimpleDEX.sol, ArbiFake.sol, App.jsx's core swap/connect/faucet flows, and all Modal*.jsx components show no further correctness bugs on inspection this iteration - remaining low-risk work is small display/formatting polish (like this one) or new feature additions rather than fund-loss or crash bugs.
