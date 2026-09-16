import {ModuleDeclarationInterface} from "@sentients/sdk/domain/entities/module.interface";
import HelloWorldModule from "./hello-world";

export const externalModules: ModuleDeclarationInterface[] = [
    HelloWorldModule,
];

export default externalModules;