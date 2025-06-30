import * as core from '@actions/core'
import {ECRClient,TagResourceCommand} from "@aws-sdk/client-ecr";
import {Flagsmith} from "flagsmith-nodejs";
import {readFlag} from "../utils";
async function main() {
    const flagName = core.getInput("FLAG_NAME");
    const flag_value =  await readFlag(flagName);
    if(flag_value === null) {
        return;
    }
    else{
        core.setOutput("FLAG_VALUE", flag_value);
        const ecr = new ECRClient();
        const command = new TagResourceCommand({
            resourceArn: core.getInput("ARN"),
            tags: [
                {
                    Key: flagName,
                    Value: flag_value.toString()
                }
            ]
        })
        const response = await ecr.send(command);
        if(!response.$metadata.httpStatusCode || response.$metadata.httpStatusCode >= 300){
            core.setFailed("AWS ECR Error, http status code: " +  response.$metadata.httpStatusCode);
        }
    }
}
main();