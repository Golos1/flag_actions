import {Flagsmith, FlagsmithValue} from "flagsmith-nodejs";
import * as core from "@actions/core";

/**
 * Reads a flag from flagsmith and returns its value.
 * The caller of this function is responsible for null-checking
 * and appropriate error handling.
 */
export async function readFlag(flag_name: string): Promise<string |number | boolean | null> {
    const flagsmith = new Flagsmith({
        environmentKey: core.getInput("FLAGSMITH_ENV_KEY"),
    })
    const flagName = core.getInput("FLAG_NAME");
    const flags = await flagsmith.getEnvironmentFlags()
    const flag_value =  flags.getFlag(flagName).value;
    if(!flag_value) {
        core.setFailed(flagName + " value does not exist.");
        return null;
    }
    return flag_value;
}