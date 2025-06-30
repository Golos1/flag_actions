import * as core from '@actions/core'
import {SSMClient,PutParameterCommand} from "@aws-sdk/client-ssm";
import {Flagsmith} from "flagsmith-nodejs";
import {readFlag} from "../utils";

/**
 * If the flag value cannot be retreived then the action will fail
 * and the parameter on AWS won;t be set; however, if the version
 * number cannot be retreived from AWS the action will still succeed.
 */
async function main(): Promise<void> {
    const flagName = core.getInput("FLAG_NAME");
    const flag_value =  await readFlag(flagName);
    if(flag_value === null) {
        return;
    }
    else {
        core.setOutput("FLAG_VALUE", flag_value);
        const ssm = new SSMClient()
        const command = new PutParameterCommand({
            Name: flagName,
            Value: flag_value.toString(),
            Type: "SecureString",
            Overwrite: true,
        })
        const response = await ssm.send(command);
        if(!response.$metadata.httpStatusCode || response.$metadata.httpStatusCode >= 300){
            core.setFailed("AWS ECR Error, http status code: " +  response.$metadata.httpStatusCode);
        }
        else{

        }
        const versionNumber = response.Version;
        if (!versionNumber) {
            console.log("No version number found.");
        } else {
            core.setOutput("PARAM_VERSION", versionNumber.toString());
        }
    }
}
main()