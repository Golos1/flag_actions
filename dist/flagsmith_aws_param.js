"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const client_ssm_1 = require("@aws-sdk/client-ssm");
const flagsmith_1 = __importDefault(require("flagsmith"));
/**
 * If the flag value cannot be retreived then the action will fail
 * and the parameter on AWS won;t be set; however, if the version
 * number cannot be retreived from AWS the action will still succeed.
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield flagsmith_1.default.init({
            environmentID: core.getInput("FLAGSMITH_CLIENT_KEY"),
        });
        const flagName = core.getInput("FLAG_NAME");
        if (!flagsmith_1.default.hasFeature(flagName)) {
            core.setFailed(flagName + " does not exist.");
        }
        else {
            const flag_value = flagsmith_1.default.getValue(flagName);
            if (!flag_value) {
                core.setFailed(flagName + " could not be retrieved from flagsmith.");
            }
            else {
                core.setOutput("FLAG_VALUE", flag_value);
                const ssm = new client_ssm_1.SSMClient();
                const command = new client_ssm_1.PutParameterCommand({
                    Name: flagName,
                    Value: flag_value.toString(),
                });
                const response = yield ssm.send(command);
                const versionNumber = response.Version;
                if (!versionNumber) {
                    console.log("No version number found.");
                }
                else {
                    core.setOutput("PARAM_VERSION", versionNumber.toString());
                }
            }
        }
    });
}
main();
