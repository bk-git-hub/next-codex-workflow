import { createInterface } from "node:readline/promises";
import process from "node:process";

import type { ExternalSkillSet, InitOptions, WorkflowMode } from "./init.js";

export type InitPrompter = (
  options: InitOptions
) => Promise<Pick<InitOptions, "performance" | "routes" | "externalSkillSet" | "workflowMode">>;

function formatChoiceLabel<T extends string>(label: string, value: T, current: T): string {
  return `${label}${value === current ? " [default]" : ""}`;
}

async function askChoice<T extends string>(
  rl: ReturnType<typeof createInterface>,
  question: string,
  choices: Array<{ key: string; value: T; label: string }>,
  current: T
): Promise<T> {
  while (true) {
    const answer = (await rl.question(question)).trim().toLowerCase();

    if (answer === "") {
      return current;
    }

    const byKey = choices.find((choice) => choice.key === answer);

    if (byKey) {
      return byKey.value;
    }

    const byValue = choices.find((choice) => choice.value === answer);

    if (byValue) {
      return byValue.value;
    }
  }
}

async function askYesNo(
  rl: ReturnType<typeof createInterface>,
  question: string,
  current: boolean
): Promise<boolean> {
  while (true) {
    const answer = (await rl.question(question)).trim().toLowerCase();

    if (answer === "") {
      return current;
    }

    if (["y", "yes"].includes(answer)) {
      return true;
    }

    if (["n", "no"].includes(answer)) {
      return false;
    }
  }
}

function parseRoutes(rawValue: string): string[] {
  return rawValue
    .split(",")
    .map((route) => route.trim())
    .filter(Boolean);
}

export async function promptInitOptions(options: InitOptions): Promise<
  Pick<InitOptions, "performance" | "routes" | "externalSkillSet" | "workflowMode">
> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const workflowModeChoices: Array<{ key: string; value: WorkflowMode; label: string }> = [
    {
      key: "1",
      value: "multi-agent",
      label: formatChoiceLabel("multi-agent (recommended)", "multi-agent", options.workflowMode)
    },
    {
      key: "2",
      value: "single-agent",
      label: formatChoiceLabel("single-agent", "single-agent", options.workflowMode)
    }
  ];

  const skillSetChoices: Array<{ key: string; value: ExternalSkillSet; label: string }> = [
    {
      key: "1",
      value: "recommended",
      label: formatChoiceLabel("recommended", "recommended", options.externalSkillSet)
    },
    {
      key: "2",
      value: "minimal",
      label: formatChoiceLabel("minimal", "minimal", options.externalSkillSet)
    },
    {
      key: "3",
      value: "full",
      label: formatChoiceLabel("full", "full", options.externalSkillSet)
    }
  ];

  try {
    process.stdout.write("Interactive next-codex-workflow setup\n\n");
    process.stdout.write(
      [
        "Workflow mode:",
        ...workflowModeChoices.map((choice) => `  ${choice.key}. ${choice.label}`)
      ].join("\n") + "\n"
    );
    const workflowMode = await askChoice(
      rl,
      "Choose workflow mode [enter for default]: ",
      workflowModeChoices,
      options.workflowMode
    );

    process.stdout.write(
      [
        "",
        "External skill set:",
        ...skillSetChoices.map((choice) => `  ${choice.key}. ${choice.label}`)
      ].join("\n") + "\n"
    );
    const externalSkillSet = await askChoice(
      rl,
      "Choose external skill set [enter for default]: ",
      skillSetChoices,
      options.externalSkillSet
    );

    const performance = await askYesNo(
      rl,
      `Enable performance workflow? [${options.performance ? "Y/n" : "y/N"}]: `,
      options.performance
    );

    let routes = options.routes;

    if (performance) {
      const defaultRouteValue = options.routes.join(", ");
      const routeAnswer = await rl.question(
        `Performance routes (comma separated, blank for auto-discover${defaultRouteValue ? `, current: ${defaultRouteValue}` : ""}): `
      );

      routes = routeAnswer.trim() === "" ? options.routes : parseRoutes(routeAnswer);
    } else {
      routes = [];
    }

    return {
      workflowMode,
      externalSkillSet,
      performance,
      routes
    };
  } finally {
    rl.close();
  }
}
