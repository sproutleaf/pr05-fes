# Project updates

## Week 8 - 9 (August 19 - September 1, 2024)

* Since I'm almost at the halfway point of the grant, we had a meeting with Q present, who asked clarifying questions and gave many good suggestions:

  * Towards the end of the grant period, it'd be good to go through the existing [FES PRs / issues](https://github.com/processing/p5.js/labels/Friendly%20Errors) and respond accordingly.
  * Need to think about how to update existing p5.js FES documentation in the `dev-2.0` branch, including:
    * [p5.js Friendly Error System (FES)](https://github.com/processing/p5.js/blob/main/contributor_docs/friendly_error_system.md)
    * [How to add Friendly Error Messages](https://github.com/processing/p5.js/blob/main/contributor_docs/how-to-add-friendly-error-messages.md)
    * [Friendly Error System Contribution Guide](https://github.com/processing/p5.js/blob/main/contributor_docs/fes_contribution_guide.md)
  * Need to document my progress during the grant in a more detailed and systematic way.

* Finished the bulk of parameter validation. Merged [#7186](https://github.com/processing/p5.js/pull/7186) and [#7194](https://github.com/processing/p5.js/pull/7194) into the `dev-2.0` branch.

* I was stuck at testing `p5Constructors`, which is dynamically loaded after a window loads. This was resolved by switching to the modular syntax, although there still needs to be testing that checks if the constructors are properly loaded.

## Week 6 - 7 (August 5 - 18, 2024)

* Had a one-off meeting with Ken to discuss testing. Learned about how testing currently works in `p5.js`, the testing landscape for JavaScript with regards to `Vitest`, `Chai` and `Mocha`.

* Finally started contributing to the repo! Got my first PRs ([#7179](https://github.com/processing/p5.js/pull/7179), [#7183](https://github.com/processing/p5.js/pull/7183)) merged into the `dev-2.0` branch.

* Thinking about using new files for code and test, so that they can be developed without interfering with existing functionality.

* Talked about the new modular syntax that p5 v2.0 will adopt soon; it allows dependency injection and makes the different modules more independent. [See the directory for math](https://github.com/processing/p5.js/tree/main/src/math).

* Shared my progress and learnings so far with other grantees and mentors during the cohort meeting.

## Week 5 (July 29 - August 4, 2024)

* Spent much time tinkering and realized that it'd be difficult to generate a `.d.ts` file that can be readily fed into `ts-to-zod`. Challenges:

  * `.d.ts` file generated is too big and has duplicated entries.
  * Methods that are chainable return an interface for the whole `p5` module instead of just referencing the existing `p5` type.
  * Even with a `.d.ts` file, [it's not clear whether `ts-to-zod` will support all JSDoc tags](https://github.com/processing/p5.js/pull/6972).

* We'll need to write our own schema generation logic.

  * Of course, there's always the risk of seeing discrepancies between what we documented and what the function is actually doing.

* Type `Constant` is now replaced by specific parameter options!

## Week 4 (July 22 - 28, 2024)

* Conducted additional research after last meeting.

* Drafted up project plan.

* Attended my first town hall as part of the pr05 + processing fellowship programming! The topic was on accessibility.

* Some important points to note from meeting:

  * __Parameter validation__
  
    * For performance measurement, we can create our own test cases and use browser profiling.
    * Also see Ken's [`p5-benchmark`](https://github.com/limzykenneth/p5-benchmark) and [`vitest`](https://vitest.dev/config/#benchmark)'s benchmark feature.
    * `npm run docs` generates the data for parameter validation. It [converts](https://github.com/processing/p5.js/blob/dev-2.0/utils/convert.js) `documentation.js` to a simpler format first, then [converts](https://github.com/processing/p5.js/blob/4fd250812b48a364ac464f106d0d2c086f28ee33/docs/preprocessor.js#L217) it to `parameterData.json`.

## Weeks 1 - 3 (July 1 - 21, 2024)

* Kickoff meeting with Dave, Ken, and Q, where I learned more about the history and end goal of the project, and made some logistics arrangements.

* Prepared a slide presentation for the pr05 kickoff meeting, where I introduced the top priorities of the FES project and the ways we could leverage on to tackle them.

* Revisited research prior to the second meeting with mentors; received feedback, guidance, and related GitHub issues. Summary below:

  * __Overridden constants and functions__

    * Our priority is finding out how fast parsing is: use a larger javascript file to produce significant result instead of using `benchmark.js`.
    * There's another tool called [`tinybench`](https://github.com/tinylibs/tinybench) that can be leveraged upon.
    * __Performance is important but not critical__, because we have other ways of optimizing it, i.e. parsing the string of user code in a worker thread.
    * We also need to measure dependency size (i.e. `color.js` added ~50kb to the bundle).
  * __Parameter validation__
    * We can potentially generate TypeScript definitions from documentation -> __we're still able to use Zod__, especially given how Zod is already being used in p5.js website.
    * Performance is more important for parameter validation becuase of the runtime nature.
