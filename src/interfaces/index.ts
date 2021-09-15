import {SharePointsNames} from "@app/utils";

export interface IArgs {
    headless?: boolean;
    configPath?: string;
    executablePath?: string;
    removeJS?: boolean;
    website?: typeof SharePointsNames[number];
    snapshot?: boolean;
}
