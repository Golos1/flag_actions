import * as core from '@actions/core'
import {SSMClient,PutParameterCommand} from "@aws-sdk/client-ssm";
import flagsmith from "flagsmith";

/**
 * If the flag value cannot be retreived then the action will fail
 * and the parameter on AWS won;t be set; however, if the version
 * number cannot be retreived from AWS the action will still succeed.
 */
async function main(): Promise<void> {
    await flagsmith.init({
        environmentID: core.getInput("FLAGSMITH_CLIENT_KEY"),
    })
    const flagName = core.getInput("FLAG_NAME");
    if(!flagsmith.hasFeature(flagName)) {
        core.setFailed(flagName + " does not exist.");
    }
    else{
        const flag_value =  flagsmith.getValue(flagName);
        if (!flag_value) {
            core.setFailed(flagName + " could not be retrieved from flagsmith.");
        }
        else {
            core.setOutput("FLAG_VALUE", flag_value);
            const ssm = new SSMClient()
            const command = new PutParameterCommand({
                Name: flagName,
                Value: flag_value.toString(),
            })
            const response = await ssm.send(command);
            const versionNumber = response.Version;
            if (!versionNumber) {
                console.log("No version number found.");
            }
            else {
                core.setOutput("PARAM_VERSION", versionNumber.toString());
            }
        }
    }
}
main()