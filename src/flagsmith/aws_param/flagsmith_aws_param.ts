import * as core from '@actions/core'
import {SSMClient,PutParameterCommand} from "@aws-sdk/client-ssm";
import {Flagsmith} from "flagsmith-nodejs";

/**
 * If the flag value cannot be retreived then the action will fail
 * and the parameter on AWS won;t be set; however, if the version
 * number cannot be retreived from AWS the action will still succeed.
 */
async function main(): Promise<void> {
    const flagsmith = new Flagsmith({
        environmentKey: core.getInput("FLAGSMITH_ENV_KEY"),
    })
    const flagName = core.getInput("FLAG_NAME");
    const flags = await flagsmith.getEnvironmentFlags()
    const flag_value =  flags.getFlag(flagName).value;
    if(!flag_value) {
        core.setFailed(flagName + " value does not exist.");
    }
    else {
        core.setOutput("FLAG_VALUE", flag_value);
        const ssm = new SSMClient()
        const command = new PutParameterCommand({
            Name: flagName,
            Value: flag_value.toString(),
            Type: "SecureString"
        })
        const response = await ssm.send(command);
        const versionNumber = response.Version;
        if (!versionNumber) {
            console.log("No version number found.");
        } else {
            core.setOutput("PARAM_VERSION", versionNumber.toString());
        }
    }
}
main()