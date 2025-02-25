import { PathLike } from 'node:fs';
export declare class FilterConfig {
    heading: {
        prefix: string;
        suffix: string;
    };
    constructor();
}
export interface ActionContext {
    filter?: FilterConfig;
    version: string;
    paths: {
        changelog: PathLike;
        notes: PathLike;
    };
}
/** Process changelog and extract release notes. */
export declare function process(context: ActionContext): Promise<void>;
/** The main function for the action. */
export declare function main(): Promise<void>;
