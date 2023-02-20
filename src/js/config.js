

const maxSteps = 15;
const buildReportButtonText = "build";

const config = { 

    maxSteps: maxSteps,        // max steps in a business process
    defaultStepTime: 5,        // default elapsed time for a process step
    defaultFactor: 1,          // default speed-up factor for a step

    prebuildText: 

        `We're going to build a process table.
        First choose how many steps there are in the process
        (up to ${maxSteps} steps)`,

    instructions:

        `Process step names (Step A, Step B, ..) are auto-generated.
        You can change them if you wish.<br/>
        Then, for each step in the process, update the length of time each step
        takes to run now ('Step Time') and then set the factor of improvement
        ('Speed-up Factor') you expect for each step after a redesign/change
        (where a factor of 1.0 means the process stays the same,
        1.5 indicates the process runs 50% quicker,
        and 0.4 indicates the process degrades by 60% etc).<br/>
        When you have all your figures as you want them click '${buildReportButtonText}'
        to see the change in the process according to Amdahl's Law`,

    buildReportButtonText: buildReportButtonText

};

export {config};
