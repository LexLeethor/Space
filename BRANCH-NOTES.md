# Branch: `physics-worker-fmm`

A rewrite of the physics pipeline, kept off `main` until it's decided on. Seven
commits on top of `2674547`. Nothing here is merged; `main` is unchanged.

```bash
git switch physics-worker-fmm
npm install && npm test
```

## What it changes

| commit | |
|---|---|
| `06ee791` | Physics moves to a Web Worker; solver hardened |
| `ee6f948` | Barnes-Hut replaced with a Cartesian-Taylor FMM |
| `be88d6c` | FMM tuned for accuracy parity; tree cells pooled |
| `c282adb` | Trail memory blow-up fixed; paint allocations cut |
| `3890255` | Label cost fixed; dispatches sized to a frame; static hosting readied |
| `1acd8bd` | Bodies drawn ahead of the last worker result |
| `19fb6c7` | Test harness brought into the repo |

Physics grows from 404 lines to about 1,790 across `PhysicsSystem`,
`PhysicsWorkerBridge`, `FMMSolver`, `workers/physicsWorker.js` and
`variables/physicsConstants.js`. Whole diff is +2,442 / −623 over 18 files.

## What it's worth, measured

Three configurations, one variable at a time — the baseline, the new solver on
the *main thread* (`WORKER_THRESHOLD` raised), and the new solver in the worker.
Reproduce with `node tests/benchmark.mjs 4`.

Under a 30 Hz frame cap, which is what Chrome's Energy Saver imposes on battery.
`states/s` counts paints showing a position nothing had before — what the eye
actually tracks, as opposed to the paint rate, which says nothing once physics
is asynchronous.

| bodies | | baseline | no-worker | worker |
|---|---|---|---|---|
| 12000 | states/s | 20.1 | 13.5 | **30.0** |
| 21000 | states/s | 16.2 | 13.5 | **29.9** |
| 30000 | states/s | 4.5 | 4.1 | **29.8** |
| 30000 | input lag p50/p95 | 69/132 ms | 89/816 ms | **3/9 ms** |
| 30000 | main thread blocked | 892 ms/s | 1021 ms/s | **0 ms/s** |

At 3,000 bodies all three measure identically, and the worker isn't used below
200 at all. The gain starts around 12k.

The `no-worker` column is the reason the worker is kept: the FMM costs more per
step than Barnes-Hut did, so on the main thread it is *worse* than the baseline.
The two changes only pay off together.

**Simulation correctness.** The baseline stepped `dt = 1.0` per *frame*, so its
speed tracked the frame rate: 102.4 simulated units/s at 3k bodies against 7.9
at 30k — a 13× swing with load. This branch normalises to elapsed time and holds
59.7–60.3 flat until the solver genuinely cannot keep up. Orbit drift on the
Solar System preset over 30 s improves from −11.5% to −2.7% while integrating
about three times more simulated time.

**Be aware:** because of that normalisation, scenes evolve roughly 2–3× faster
in wall-clock terms than on `main`. Same physics, different clock.

## Known debt, not fixed

- Physics is ~4.4× the code for the same job, and reasoning about it now means
  holding an async pipeline in your head: generation counters, banked time,
  dispatch sizing, shadow position state, a lead ramp.
- Collision logic is duplicated — `functions/collisionAndMassTransfer.js` and an
  inlined SoA copy inside the worker. `tests/solvers.test.mjs` pins them
  together, but they can still drift in intent.
- `README.md` is stale: still describes Barnes-Hut as planned and gravity as
  O(N²).
- The gravity visualisations are unusable at scale and this branch does not fix
  them — at 21k bodies the heatmap costs about 4,960 ms per frame, contours
  1,270, grid warp 370, vectors 270. Worse now than before, because a blocked
  main thread also stalls physics 1:1. Preset 9 does not turn them off.
- Untested: black holes and extreme mass ratios, long-run energy conservation.

## If it's not wanted

The trail fix (`c282adb`) and the label fix (`3890255`) are independent of the
worker and the solver, and are the best value per line in the branch. They can
be cherry-picked onto `main` on their own.
